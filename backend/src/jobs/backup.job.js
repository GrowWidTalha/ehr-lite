/**
 * Backup Job Scheduler
 *
 * Handles automated daily backups using node-schedule.
 * Runs at 2:00 AM daily and checks for missed backups on startup.
 *
 * @module jobs/backup.job
 */

import schedule from 'node-schedule';
import { createBackup, getBackupStatus } from '../services/backup.service.js';

let backupJob = null;
const BACKUP_TIME = '0 2 * * *'; // 2:00 AM daily

/**
 * Execute scheduled backup
 */
async function executeScheduledBackup() {
  try {
    console.log('[' + new Date().toISOString() + '] Scheduled backup starting...');
    const result = await createBackup('automatic');
    console.log(`[${result.filename}] Scheduled backup completed:`, result);
  } catch (error) {
    console.error('Scheduled backup failed:', error);
  }
}

/**
 * Start the backup scheduler
 */
export function startBackupScheduler() {
  if (backupJob) {
    console.log('Backup scheduler already running');
    return;
  }

  console.log('Starting backup scheduler (daily at 2:00 AM)...');
  backupJob = schedule.scheduleJob(BACKUP_TIME, executeScheduledBackup);

  if (backupJob) {
    console.log('Backup scheduler started successfully');
    console.log('Next scheduled backup:', backupJob.nextInvocation().toString());
  } else {
    console.error('Failed to start backup scheduler');
  }
}

/**
 * Stop the backup scheduler
 */
export function stopBackupScheduler() {
  if (backupJob) {
    backupJob.cancel();
    backupJob = null;
    console.log('Backup scheduler stopped');
  }
}

/**
 * Check if a backup was missed today
 * If the current time is past 2 AM and no automatic backup exists for today, run it
 */
export async function checkMissedBackup() {
  try {
    const status = await getBackupStatus();
    const now = new Date();
    const twoAM = new Date(now);
    twoAM.setHours(2, 0, 0, 0);

    // Only check if it's past 2 AM today
    if (now < twoAM) {
      console.log('Too early to check for missed backup (before 2 AM)');
      return;
    }

    const today = now.toISOString().split('T')[0];

    // Check if there's an automatic backup for today
    if (status.lastAutomaticBackup) {
      const lastBackupDate = status.lastAutomaticBackup.date;
      if (lastBackupDate === today) {
        console.log('Automatic backup already completed today');
        return;
      }
    }

    // No automatic backup today - check if we should run one
    console.log('Checking for missed backup...');

    // If last backup was from a previous day, run a backup now
    if (status.lastBackup) {
      const lastBackupDate = status.lastBackup.date;
      if (lastBackupDate !== today) {
        console.log('Missed backup detected. Running backup now...');
        await executeScheduledBackup();
      }
    } else {
      // No backups at all - run first backup
      console.log('No previous backups found. Running initial backup...');
      await executeScheduledBackup();
    }
  } catch (error) {
    console.error('Error checking for missed backup:', error);
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    running: backupJob !== null,
    nextInvocation: backupJob ? backupJob.nextInvocation() : null,
    schedule: BACKUP_TIME
  };
}

export default {
  startBackupScheduler,
  stopBackupScheduler,
  checkMissedBackup,
  getSchedulerStatus
};
