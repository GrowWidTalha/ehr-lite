/**
 * Backup Configuration Service
 *
 * Manages backup path configuration for external hard drives.
 * Stores configuration in /data/backup-config.json.
 *
 * @module backup.config.service
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG_FILE = 'backup-config.json';
const getDataDir = () => path.resolve(__dirname, '../../data');
const getConfigPath = () => path.join(getDataDir(), CONFIG_FILE);

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  backupPath: null, // Path to external hard drive
  lastReminderDate: null,
  reminderInterval: 7, // Days between reminders
  reminderEnabled: true
};

/**
 * Read backup configuration
 */
export function getBackupConfig() {
  try {
    const configPath = getConfigPath();

    if (!fs.existsSync(configPath)) {
      return { ...DEFAULT_CONFIG };
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content);

    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    console.error('Error reading backup config:', error);
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Write backup configuration
 */
export function saveBackupConfig(config) {
  try {
    const configPath = getConfigPath();
    const dataDir = getDataDir();

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return { success: true };
  } catch (error) {
    console.error('Error saving backup config:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Set backup path (external hard drive)
 */
export function setBackupPath(backupPath) {
  const config = getBackupConfig();
  config.backupPath = backupPath;
  return saveBackupConfig(config);
}

/**
 * Get backup path
 */
export function getBackupPath() {
  const config = getBackupConfig();
  return config.backupPath;
}

/**
 * Set last reminder date
 */
export function setLastReminderDate(date) {
  const config = getBackupConfig();
  config.lastReminderDate = date;
  return saveBackupConfig(config);
}

/**
 * Check if reminder should be shown
 * Returns true if it's been more than reminderInterval days since last backup
 */
export function shouldShowReminder(lastBackupDate) {
  const config = getBackupConfig();

  if (!config.reminderEnabled) {
    return { show: false, reason: 'Reminder disabled' };
  }

  if (!lastBackupDate) {
    return { show: true, reason: 'Never backed up', daysSince: 999 };
  }

  const lastBackup = new Date(lastBackupDate);
  const now = new Date();
  const daysSince = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));

  if (daysSince >= config.reminderInterval) {
    return { show: true, reason: 'Backup overdue', daysSince };
  }

  return { show: false, reason: 'Backup recent', daysSince };
}

/**
 * Validate backup path (check if directory exists and is writable)
 * If path doesn't exist, try to create it (for user home directories only)
 */
export function validateBackupPath(backupPath) {
  try {
    if (!backupPath) {
      return { valid: false, error: 'Path is required' };
    }

    // Expand home directory if path starts with ~
    let expandedPath = backupPath;
    if (backupPath.startsWith('~')) {
      const homeDir = process.env.HOME || process.env.USERPROFILE;
      if (homeDir) {
        expandedPath = backupPath.replace('~', homeDir);
      }
    }

    if (!fs.existsSync(expandedPath)) {
      return {
        valid: false,
        error: 'Path does not exist',
        hint: `The path "${expandedPath}" does not exist. Please create it first or enter a valid path. Examples: /home/user/Backups, E:\\Backups`
      };
    }

    const stats = fs.statSync(expandedPath);
    if (!stats.isDirectory()) {
      return { valid: false, error: 'Path is not a directory' };
    }

    // Test write permissions
    const testFile = path.join(expandedPath, '.ehr-backup-test');
    try {
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (writeError) {
      return {
        valid: false,
        error: 'Cannot write to this directory. Check permissions.'
      };
    }

    return { valid: true, path: expandedPath };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

export default {
  getBackupConfig,
  saveBackupConfig,
  setBackupPath,
  getBackupPath,
  setLastReminderDate,
  shouldShowReminder,
  validateBackupPath
};
