/**
 * Log Writer Utility
 *
 * Handles writing JSON log files for import/export/backup operations.
 * Logs are stored in /data/logs/ with daily rotation.
 *
 * @module utils/log-writer
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get the project root directory (parent of backend/)
 */
const getProjectRoot = () => path.resolve(__dirname, '../..');

/**
 * Get the logs directory path
 */
const getLogsDir = () => path.join(getProjectRoot(), 'data', 'logs');

/**
 * Ensure logs directory exists
 */
function ensureLogsDir() {
  const logsDir = getLogsDir();
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  return logsDir;
}

/**
 * Generate log file path for a given date and type
 *
 * @param {string} type - Type of log ('import', 'export', 'backup')
 * @param {Date} date - Date for the log (defaults to today)
 * @returns {string} Full path to the log file
 */
function getLogFilePath(type, date = new Date()) {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `${type}-${dateStr}.json`;
  return path.join(getLogsDir(), filename);
}

/**
 * Write or append to a log file
 *
 * @param {string} type - Type of log ('import', 'export', 'backup')
 * @param {Object} logEntry - Log entry to write
 * @returns {Promise<boolean>} Success status
 */
async function writeLog(type, logEntry) {
  try {
    ensureLogsDir();
    const logPath = getLogFilePath(type);

    let logs = [];

    // Read existing logs if file exists
    if (fs.existsSync(logPath)) {
      try {
        const content = fs.readFileSync(logPath, 'utf-8');
        logs = JSON.parse(content);
      } catch (error) {
        console.warn(`Could not parse existing log file ${logPath}, starting fresh:`, error.message);
        logs = [];
      }
    }

    // Add new log entry
    logs.push({
      ...logEntry,
      timestamp: logEntry.timestamp || new Date().toISOString()
    });

    // Write back to file
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

    return true;
  } catch (error) {
    console.error(`Failed to write ${type} log:`, error);
    return false;
  }
}

/**
 * Create a new import log entry
 *
 * @param {Object} importData - Import operation data
 * @returns {Promise<Object>} Created log entry with timestamp
 */
export async function createImportLog(importData) {
  const logEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type: 'import',
    ...importData
  };

  await writeLog('import', logEntry);

  return logEntry;
}

/**
 * Create a new export log entry
 *
 * @param {Object} exportData - Export operation data
 * @returns {Promise<Object>} Created log entry with timestamp
 */
export async function createExportLog(exportData) {
  const logEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type: 'export',
    ...exportData
  };

  await writeLog('export', logEntry);

  return logEntry;
}

/**
 * Create a new backup log entry
 *
 * @param {Object} backupData - Backup operation data
 * @returns {Promise<Object>} Created log entry with timestamp
 */
export async function createBackupLog(backupData) {
  const logEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type: 'backup',
    ...backupData
  };

  await writeLog('backup', logEntry);

  return logEntry;
}

/**
 * Read logs for a specific type and date
 *
 * @param {string} type - Type of log ('import', 'export', 'backup')
 * @param {Date} date - Date for the log (defaults to today)
 * @returns {Array} Array of log entries
 */
export function readLogs(type, date = new Date()) {
  try {
    ensureLogsDir();
    const logPath = getLogFilePath(type, date);

    if (!fs.existsSync(logPath)) {
      return [];
    }

    const content = fs.readFileSync(logPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to read ${type} logs:`, error);
    return [];
  }
}

/**
 * Get import logs for today
 *
 * @returns {Array} Today's import log entries
 */
export function getTodayImportLogs() {
  return readLogs('import');
}

/**
 * Get export logs for today
 *
 * @returns {Array} Today's export log entries
 */
export function getTodayExportLogs() {
  return readLogs('export');
}

/**
 * Get backup logs for today
 *
 * @returns {Array} Today's backup log entries
 */
export function getTodayBackupLogs() {
  return readLogs('backup');
}

/**
 * Format bytes to human-readable size
 *
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted size string
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human-readable string
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export default {
  createImportLog,
  createExportLog,
  createBackupLog,
  readLogs,
  getTodayImportLogs,
  getTodayExportLogs,
  getTodayBackupLogs,
  formatBytes,
  formatDuration
};
