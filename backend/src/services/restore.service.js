/**
 * Restore Service
 *
 * Handles restoration of patient data from backup archives.
 * Extracts zip files containing database.db and patient-images/ folder.
 *
 * @module restore.service
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createBackupLog, readLogs } from '../utils/log-writer.js';
import { closeConnection, getConnection, saveDatabase } from '../db/connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get project paths
 */
const getProjectRoot = () => path.resolve(__dirname, '../..');
const getDataDir = () => process.env.DATA_DIR || path.join(getProjectRoot(), 'data');
const getDatabasePath = () => path.join(getDataDir(), 'database.db');
const getImagesDir = () => path.join(getDataDir(), 'patient-images');

/**
 * Extract zip file to data directory
 *
 * @param {string} zipPath - Path to the backup zip file
 * @returns {Promise<Object>} Restore result
 */
export async function restoreBackup(zipPath) {
  const startTime = Date.now();

  // Validate zip file exists
  if (!fs.existsSync(zipPath)) {
    throw new Error('Backup file not found');
  }

  // Verify it's a valid zip file
  const fd = fs.openSync(zipPath, 'r');
  const buffer = Buffer.alloc(4);
  fs.readSync(fd, buffer, 0, 4, 0);
  fs.closeSync(fd);

  // ZIP files start with PK (0x504B)
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
    throw new Error('Invalid backup file format');
  }

  try {
    // Import adm-zip dynamically
    const AdmZip = (await import('adm-zip')).default;

    // Create a temporary directory for extraction
    const tempDir = path.join(getDataDir(), '.temp-restore');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    // Extract zip to temp directory
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(tempDir, true);

    // Verify expected files exist in the backup
    const extractedDbPath = path.join(tempDir, 'database.db');
    if (!fs.existsSync(extractedDbPath)) {
      throw new Error('Backup file does not contain database.db');
    }

    // Close existing database connection
    await closeConnection();

    // Backup current database (if it exists)
    const currentDbPath = getDatabasePath();
    if (fs.existsSync(currentDbPath)) {
      const backupDbPath = path.join(getDataDir(), `database.pre-restore.${Date.now()}.db`);
      fs.copyFileSync(currentDbPath, backupDbPath);
      console.log(`Backed up current database to: ${backupDbPath}`);
    }

    // Backup current images directory (if it exists)
    const currentImagesDir = getImagesDir();
    if (fs.existsSync(currentImagesDir)) {
      const backupImagesDir = path.join(getDataDir(), `patient-images.pre-restore.${Date.now()}`);
      fs.renameSync(currentImagesDir, backupImagesDir);
      console.log(`Backed up current images to: ${backupImagesDir}`);
    }

    // Copy new database
    fs.copyFileSync(extractedDbPath, currentDbPath);
    console.log(`Restored database from: ${extractedDbPath}`);

    // Copy images directory if it exists in the backup
    const extractedImagesDir = path.join(tempDir, 'patient-images');
    if (fs.existsSync(extractedImagesDir)) {
      fs.cpSync(extractedImagesDir, currentImagesDir, { recursive: true });
      console.log(`Restored images from: ${extractedImagesDir}`);
    } else {
      // Ensure images directory exists
      fs.mkdirSync(currentImagesDir, { recursive: true });
    }

    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Reopen database connection
    await getConnection();

    const duration = Date.now() - startTime;

    // Log success
    await createBackupLog({
      timestamp: new Date().toISOString(),
      type: 'restore',
      status: 'success',
      filename: path.basename(zipPath),
      path: zipPath,
      duration: `${duration}ms`
    });

    return {
      success: true,
      path: zipPath,
      filename: path.basename(zipPath),
      duration
    };
  } catch (error) {
    // Log failure
    await createBackupLog({
      timestamp: new Date().toISOString(),
      type: 'restore',
      status: 'failed',
      error: error.message
    });

    throw error;
  }
}

export default {
  restoreBackup
};
