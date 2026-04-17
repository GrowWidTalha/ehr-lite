/**
 * Backup Index Manager
 *
 * Manages the backup inventory index file at /data/backups/index.json.
 * Tracks all backups with metadata for listing and restoration planning.
 *
 * @module utils/backup-index
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createBackupLog } from './log-writer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get the project root directory
 */
const getProjectRoot = () => path.resolve(__dirname, '../..');

/**
 * Get the backups directory path
 */
const getBackupsDir = () => path.join(getProjectRoot(), 'data', 'backups');

/**
 * Get the backup index file path
 */
const getIndexFilePath = () => path.join(getBackupsDir(), 'index.json');

/**
 * Ensure backups directory exists
 */
function ensureBackupsDir() {
  const backupsDir = getBackupsDir();
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
  return backupsDir;
}

/**
 * Initialize or load the backup index
 *
 * @returns {Object} Backup index structure
 */
function getOrInitIndex() {
  ensureBackupsDir();
  const indexPath = getIndexFilePath();

  if (!fs.existsSync(indexPath)) {
    // Create new index
    const newIndex = {
      last_updated: new Date().toISOString(),
      version: '1.0.0',
      backups: []
    };
    fs.writeFileSync(indexPath, JSON.stringify(newIndex, null, 2));
    return newIndex;
  }

  // Read existing index
  try {
    const content = fs.readFileSync(indexPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse backup index, creating new:', error);
    const newIndex = {
      last_updated: new Date().toISOString(),
      version: '1.0.0',
      backups: []
    };
    fs.writeFileSync(indexPath, JSON.stringify(newIndex, null, 2));
    return newIndex;
  }
}

/**
 * Save the backup index atomically
 *
 * @param {Object} index - Index object to save
 * @returns {boolean} Success status
 */
function saveIndex(index) {
  try {
    const indexPath = getIndexFilePath();

    // Atomic write: write to temp file, then rename
    const tempPath = indexPath + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify({
      ...index,
      last_updated: new Date().toISOString()
    }, null, 2));

    fs.renameSync(tempPath, indexPath);
    return true;
  } catch (error) {
    console.error('Failed to save backup index:', error);
    return false;
  }
}

/**
 * Add a backup to the index
 *
 * @param {Object} backupData - Backup metadata
 * @returns {Promise<Object>} Added backup entry
 */
export async function addBackup(backupData) {
  const index = getOrInitIndex();

  const backupEntry = {
    id: backupData.id || crypto.randomUUID(),
    timestamp: backupData.timestamp || new Date().toISOString(),
    path: backupData.path,
    size_bytes: backupData.size_bytes || 0,
    status: backupData.status || 'complete',
    type: backupData.type || 'manual',
    database_included: backupData.database_included !== false,
    images_included: backupData.images_included !== false,
    verification_passed: backupData.verification_passed !== false,
    error_message: backupData.error_message || null
  };

  // Check if backup already exists (by path)
  const existingIndex = index.backups.findIndex(b => b.path === backupEntry.path);
  if (existingIndex >= 0) {
    // Update existing entry
    index.backups[existingIndex] = backupEntry;
  } else {
    // Add new entry
    index.backups.push(backupEntry);
  }

  // Sort backups by timestamp (newest first)
  index.backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  saveIndex(index);

  // Also log to backup logs
  await createBackupLog({
    backup_id: backupEntry.id,
    path: backupEntry.path,
    size_bytes: backupEntry.size_bytes,
    status: backupEntry.status,
    type: backupEntry.type
  });

  return backupEntry;
}

/**
 * List all backups from the index
 *
 * @returns {Array} Array of backup entries
 */
export function listBackups() {
  const index = getOrInitIndex();
  return index.backups || [];
}

/**
 * Get backup by ID
 *
 * @param {string} backupId - Backup UUID
 * @returns {Object|null} Backup entry or null if not found
 */
export function getBackup(backupId) {
  const index = getOrInitIndex();
  return index.backups?.find(b => b.id === backupId) || null;
}

/**
 * Get the most recent backup
 *
 * @returns {Object|null} Latest backup entry or null if no backups
 */
export function getLatestBackup() {
  const backups = listBackups();
  if (backups.length === 0) {
    return null;
  }
  return backups[0]; // Already sorted newest first
}

/**
 * Get backup statistics
 *
 * @returns {Object} Statistics about backups
 */
export function getBackupStats() {
  const backups = listBackups();

  const totalBackups = backups.length;
  const totalSizeBytes = backups.reduce((sum, b) => sum + (b.size_bytes || 0), 0);

  const byType = {
    automatic: backups.filter(b => b.type === 'automatic').length,
    manual: backups.filter(b => b.type === 'manual').length
  };

  const byStatus = {
    complete: backups.filter(b => b.status === 'complete').length,
    incomplete: backups.filter(b => b.status === 'incomplete').length,
    failed: backups.filter(b => b.status === 'failed').length
  };

  return {
    total_backups: totalBackups,
    total_size_bytes: totalSizeBytes,
    by_type: byType,
    by_status: byStatus,
    last_updated: getOrInitIndex().last_updated
  };
}

/**
 * Delete a backup from the index (does not delete the actual file)
 *
 * @param {string} backupId - Backup UUID
 * @returns {boolean} Success status
 */
export function removeBackupFromIndex(backupId) {
  const index = getOrInitIndex();

  const initialLength = index.backups.length;
  index.backups = index.backups.filter(b => b.id !== backupId);

  if (index.backups.length < initialLength) {
    return saveIndex(index);
  }

  return false;
}

/**
 * Create a new backup folder for a specific date
 *
 * @param {Date} date - Date for the backup (defaults to today)
 * @returns {string} Path to the created backup folder
 */
export function createBackupFolder(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const folderName = dateStr;
  const folderPath = path.join(getBackupsDir(), folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  return folderPath;
}

/**
 * Get backup folder path for a specific date
 *
 * @param {Date} date - Date for the backup
 * @returns {string} Path to the backup folder
 */
export function getBackupFolderPath(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(getBackupsDir(), dateStr);
}

/**
 * Check if a backup exists for a specific date
 *
 * @param {Date} date - Date to check
 * @returns {boolean} True if backup folder exists for the date
 */
export function hasBackupForDate(date = new Date()) {
  const folderPath = getBackupFolderPath(date);
  return fs.existsSync(folderPath);
}

/**
 * Generate backup filename with timestamp
 *
 * @param {Date} timestamp - Timestamp for the filename (defaults to now)
 * @returns {string} Backup filename (e.g., "backup-143022.zip")
 */
export function generateBackupFilename(timestamp = new Date()) {
  const hours = String(timestamp.getHours()).padStart(2, '0');
  const minutes = String(timestamp.getMinutes()).padStart(2, '0');
  const seconds = String(timestamp.getSeconds()).padStart(2, '0');
  return `backup-${hours}${minutes}${seconds}.zip`;
}

/**
 * Get all backup dates (folders) in the backups directory
 *
 * @returns {Array<string>} Array of date strings (YYYY-MM-DD)
 */
export function getBackupDates() {
  const backupsDir = getBackupsDir();

  if (!fs.existsSync(backupsDir)) {
    return [];
  }

  try {
    const entries = fs.readdirSync(backupsDir, { withFileTypes: true });

    // Filter and return only directories that match date format (YYYY-MM-DD)
    return entries
      .filter(entry => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name))
      .map(entry => entry.name)
      .sort()
      .reverse(); // Newest first
  } catch (error) {
    console.error('Failed to read backup dates:', error);
    return [];
  }
}

/**
 * Clean up old backups (manual function - not automatic)
 *
 * @param {number} daysToKeep - Number of days of backups to keep
 * @returns {Object} Cleanup result with deleted count
 */
export function cleanupOldBackups(daysToKeep) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const index = getOrInitIndex();
  const initialLength = index.backups.length;

  // Filter out old backups
  const oldBackups = index.backups.filter(b => {
    const backupDate = new Date(b.timestamp);
    return backupDate < cutoffDate;
  });

  // Update index
  index.backups = index.backups.filter(b => {
    const backupDate = new Date(b.timestamp);
    return backupDate >= cutoffDate;
  });

  saveIndex(index);

  return {
    removed_count: initialLength - index.backups.length,
    remaining_count: index.backups.length,
    cutoff_date: cutoffDate.toISOString()
  };
}

export default {
  addBackup,
  listBackups,
  getBackup,
  getLatestBackup,
  getBackupStats,
  removeBackupFromIndex,
  createBackupFolder,
  getBackupFolderPath,
  hasBackupForDate,
  generateBackupFilename,
  getBackupDates,
  cleanupOldBackups
};
