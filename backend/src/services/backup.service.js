/**
 * Backup Service
 *
 * Handles automated and manual backups of patient data.
 * Creates zip archives containing database.db and patient-images/ folder.
 *
 * @module backup.service
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import archiver from 'archiver';
import { createBackupLog, readLogs } from '../utils/log-writer.js';
import { addBackup, listBackups as getIndexBackups, getBackupStats, getLatestBackup, cleanupOldBackups } from '../utils/backup-index.js';
import { getBackupPath as getConfiguredBackupPath } from './backup.config.service.js';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get project paths
 */
const getProjectRoot = () => path.resolve(__dirname, '../..');
const getDataDir = () => path.join(getProjectRoot(), 'data');
const getBackupsDir = () => path.join(getDataDir(), 'backups'); // Fallback/backups index
const getDatabasePath = () => path.join(getDataDir(), 'database.db');
const getImagesDir = () => path.join(getDataDir(), 'patient-images');

/**
 * Ensure backups directory exists
 */
function ensureBackupsDir(dateStr) {
  const backupsDir = getBackupsDir();
  const dateDir = path.join(backupsDir, dateStr);

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  if (!fs.existsSync(dateDir)) {
    fs.mkdirSync(dateDir, { recursive: true });
  }

  return dateDir;
}

/**
 * Check available disk space
 * Returns available bytes
 */
export async function checkDiskSpace() {
  try {
    const dataDir = getDataDir();
    const { stdout } = await execAsync(`df -k "${dataDir}"`);
    const lines = stdout.trim().split('\n');

    // Skip header, get first data line
    if (lines.length < 2) {
      return { available: 0, error: 'Could not parse df output' };
    }

    const parts = lines[1].split(/\s+/);
    // Available is the 4th column (1-indexed: 4)
    const availableKB = parseInt(parts[3], 10);

    if (isNaN(availableKB)) {
      return { available: 0, error: 'Could not parse available space' };
    }

    return { available: availableKB * 1024 }; // Convert to bytes
  } catch (error) {
    return { available: 0, error: error.message };
  }
}

/**
 * Get current data size (database + images)
 */
export async function getDataSize() {
  let totalSize = 0;

  try {
    // Database size
    const dbPath = getDatabasePath();
    if (fs.existsSync(dbPath)) {
      const dbStats = fs.statSync(dbPath);
      totalSize += dbStats.size;
    }

    // Images directory size
    const imagesDir = getImagesDir();
    if (fs.existsSync(imagesDir)) {
      const { stdout } = await execAsync(`du -sk "${imagesDir}"`);
      const sizeKB = parseInt(stdout.split(/\s+/)[0], 10);
      if (!isNaN(sizeKB)) {
        totalSize += sizeKB * 1024;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Error calculating data size:', error);
    return 0;
  }
}

/**
 * Check if there's enough disk space for backup
 * Requires at least 2x current data size
 */
export async function hasEnoughDiskSpace() {
  const dataSize = await getDataSize();
  const requiredSpace = dataSize * 2;
  const { available } = await checkDiskSpace();

  return {
    enough: available >= requiredSpace,
    required: requiredSpace,
    available,
    dataSize
  };
}

/**
 * Create a backup zip archive
 *
 * @param {string} type - 'manual' or 'automatic'
 * @param {string} customPath - Optional custom backup path (overrides config)
 * @returns {Promise<Object>} Backup result with path and size
 */
export async function createBackup(type = 'manual', customPath = null) {
  const startTime = Date.now();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS

  const filename = `ehr-backup-${dateStr}-${timeStr}.zip`;

  // Get backup path: custom path > configured path > fallback to local
  let targetDir = customPath || getConfiguredBackupPath();
  const usingExternalDrive = !!targetDir;

  if (!targetDir) {
    // No configured path, use local fallback
    targetDir = ensureBackupsDir(dateStr);
  } else {
    // Create EHR backups subdirectory in external drive
    const ehrBackupDir = path.join(targetDir, 'EHR-Backups');
    if (!fs.existsSync(ehrBackupDir)) {
      fs.mkdirSync(ehrBackupDir, { recursive: true });
    }
    targetDir = path.join(ehrBackupDir, dateStr);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  }

  const backupPath = path.join(targetDir, filename);

  // Check disk space on target drive
  let spaceCheck;
  if (usingExternalDrive) {
    // For external drive, just check if we can write a small test file
    try {
      const testFile = path.join(targetDir, '.space-check');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      spaceCheck = { enough: true };
    } catch (error) {
      spaceCheck = { enough: false, error: 'Cannot write to backup location' };
    }
  } else {
    spaceCheck = await hasEnoughDiskSpace();
  }

  if (!spaceCheck.enough) {
    const error = spaceCheck.error || `Insufficient disk space`;
    await createBackupLog({
      timestamp: now.toISOString(),
      type,
      status: 'failed',
      error,
      location: usingExternalDrive ? 'external' : 'local'
    });
    throw new Error(error);
  }

  try {
    // Create write stream for zip file
    const output = fs.createWriteStream(backupPath);
    const archive = archiver('zip', {
      zlib: { level: 6 } // Compression level
    });

    // Pipe archive to file
    archive.pipe(output);

    // Add database file
    const dbPath = getDatabasePath();
    if (fs.existsSync(dbPath)) {
      archive.file(dbPath, { name: 'database.db' });
    }

    // Add images directory if it exists
    const imagesDir = getImagesDir();
    if (fs.existsSync(imagesDir)) {
      archive.directory(imagesDir, 'patient-images');
    }

    // Finalize archive
    await archive.finalize();

    // Wait for completion
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
      archive.on('error', reject);
    });

    // Verify backup was created and has content
    const stats = fs.statSync(backupPath);
    if (stats.size === 0) {
      throw new Error('Backup file is empty');
    }

    // Update backup index (always update local index for tracking)
    await addBackup({
      path: backupPath,
      size_bytes: stats.size,
      type,
      timestamp: now.toISOString()
    });

    const duration = Date.now() - startTime;

    // Log success
    await createBackupLog({
      timestamp: now.toISOString(),
      type,
      status: 'success',
      filename,
      path: backupPath,
      size: stats.size,
      duration: `${duration}ms`
    });

    return {
      success: true,
      path: backupPath,
      filename,
      size: stats.size,
      duration
    };
  } catch (error) {
    // Clean up failed backup file
    if (fs.existsSync(backupPath)) {
      try {
        fs.unlinkSync(backupPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    // Log failure
    await createBackupLog({
      timestamp: now.toISOString(),
      type,
      status: 'failed',
      error: error.message
    });

    throw error;
  }
}

/**
 * Verify backup integrity by attempting to read the archive
 *
 * @param {string} backupPath - Path to backup file
 * @returns {Promise<boolean>} True if backup is valid
 */
export async function verifyBackup(backupPath) {
  return new Promise((resolve) => {
    try {
      if (!fs.existsSync(backupPath)) {
        resolve(false);
        return;
      }

      const stats = fs.statSync(backupPath);
      if (stats.size === 0) {
        resolve(false);
        return;
      }

      // Basic validation - check if it's a valid zip file
      // by reading the first few bytes (zip magic number)
      const fd = fs.openSync(backupPath, 'r');
      const buffer = Buffer.alloc(4);
      fs.readSync(fd, buffer, 0, 4, 0);
      fs.closeSync(fd);

      // ZIP files start with PK (0x504B)
      const isValidZip = buffer[0] === 0x50 && buffer[1] === 0x4B;
      resolve(isValidZip);
    } catch (error) {
      resolve(false);
    }
  });
}

/**
 * Get all backups from index
 *
 * @returns {Promise<Array>} Array of backup info
 */
export async function listBackups() {
  try {
    return getIndexBackups();
  } catch (error) {
    return [];
  }
}

/**
 * Get backup status for display
 *
 * @returns {Promise<Object>} Backup status info
 */
export async function getBackupStatus() {
  try {
    const backups = getIndexBackups();
    const logs = readLogs('backup');
    const todayLogs = logs.filter(l => l.status === 'success');

    const lastBackup = getLatestBackup();
    const lastAutomaticBackup = backups.find(b => b.type === 'automatic') || null;

    return {
      lastBackup: lastBackup ? {
        date: lastBackup.timestamp ? lastBackup.timestamp.split('T')[0] : null,
        time: lastBackup.timestamp,
        size: lastBackup.size_bytes,
        type: lastBackup.type,
        filename: lastBackup.path ? lastBackup.path.split('/').pop() : null
      } : null,
      lastAutomaticBackup: lastAutomaticBackup ? {
        date: lastAutomaticBackup.timestamp ? lastAutomaticBackup.timestamp.split('T')[0] : null,
        time: lastAutomaticBackup.timestamp
      } : null,
      totalBackups: backups.length,
      totalSize: backups.reduce((sum, b) => sum + (b.size_bytes || 0), 0),
      todayCount: todayLogs.length,
      nextScheduled: 'Manual (no schedule)'
    };
  } catch (error) {
    return {
      lastBackup: null,
      lastAutomaticBackup: null,
      totalBackups: 0,
      totalSize: 0,
      todayCount: 0,
      nextScheduled: '2:00 AM',
      error: error.message
    };
  }
}

/**
 * Delete old backups (optional - not currently used)
 *
 * @param {number} daysToKeep - Number of days of backups to keep
 */
export async function deleteOldBackups(daysToKeep = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const backups = getIndexBackups();
    const toDelete = backups.filter(b => new Date(b.timestamp) < cutoffDate);

    // Delete actual files
    for (const backup of toDelete) {
      if (backup.path && fs.existsSync(backup.path)) {
        try {
          fs.unlinkSync(backup.path);
        } catch (e) {
          console.error(`Failed to delete backup file: ${backup.path}`, e.message);
        }
      }
    }

    // Update index using the cleanup function
    const result = cleanupOldBackups(daysToKeep);

    return { deleted: toDelete.length, remaining: result.remaining_count };
  } catch (error) {
    throw new Error(`Failed to delete old backups: ${error.message}`);
  }
}

export default {
  createBackup,
  verifyBackup,
  listBackups,
  getBackupStatus,
  checkDiskSpace,
  hasEnoughDiskSpace,
  deleteOldBackups
};
