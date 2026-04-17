/**
 * Backup Routes
 *
 * API endpoints for backup management and status.
 *
 * @module routes/backup
 */

import express from 'express';
import {
  createBackup,
  getBackupStatus,
  listBackups,
  verifyBackup
} from '../services/backup.service.js';
import {
  getBackupConfig,
  saveBackupConfig,
  setBackupPath,
  getBackupPath,
  shouldShowReminder,
  validateBackupPath
} from '../services/backup.config.service.js';

const router = express.Router();

// Track in-progress backups
let backupInProgress = false;

/**
 * GET /api/backup/status
 * Get current backup status and information
 */
router.get('/status', async (req, res) => {
  try {
    const status = await getBackupStatus();

    res.json({
      success: true,
      data: {
        ...status,
        inProgress: backupInProgress
      }
    });
  } catch (error) {
    console.error('Backup status error:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/backup/create
 * Create a new backup (manual trigger)
 */
router.post('/create', async (req, res) => {
  // Check if backup is already in progress
  if (backupInProgress) {
    return res.status(409).json({
      success: false,
      error: 'Backup already in progress'
    });
  }

  backupInProgress = true;

  try {
    console.log('Manual backup requested...');
    const result = await createBackup('manual');

    // Verify the backup
    const isValid = await verifyBackup(result.path);

    res.json({
      success: true,
      data: {
        path: result.path,
        filename: result.filename,
        size: result.size,
        duration: result.duration,
        verified: isValid
      }
    });

    console.log(`Manual backup completed: ${result.filename}`);
  } catch (error) {
    console.error('Manual backup error:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create backup'
    });
  } finally {
    backupInProgress = false;
  }
});

/**
 * GET /api/backup/list
 * List all backups
 */
router.get('/list', async (req, res) => {
  try {
    const backups = await listBackups();

    res.json({
      success: true,
      data: {
        backups,
        count: backups.length
      }
    });
  } catch (error) {
    console.error('List backups error:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// BACKUP CONFIGURATION ENDPOINTS
// ============================================================================

/**
 * GET /api/backup/config
 * Get backup configuration
 */
router.get('/config', async (req, res) => {
  try {
    const config = getBackupConfig();

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get backup config error:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/backup/config/path
 * Set backup path (external hard drive)
 */
router.post('/config/path', async (req, res) => {
  try {
    const { path } = req.body;

    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'Backup path is required'
      });
    }

    // Validate the path
    const validation = validateBackupPath(path);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        hint: validation.hint
      });
    }

    // Save the path (use expanded path if provided)
    const result = setBackupPath(validation.path || path);

    if (result.success) {
      res.json({
        success: true,
        data: { path: validation.path || path }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Set backup path error:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/backup/config/validate
 * Validate a backup path without saving it
 */
router.post('/config/validate', async (req, res) => {
  try {
    const { path } = req.body;

    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'Path is required'
      });
    }

    const validation = validateBackupPath(path);

    res.json({
      success: validation.valid,
      data: {
        valid: validation.valid,
        error: validation.error,
        hint: validation.hint
      }
    });
  } catch (error) {
    console.error('Validate backup path error:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/backup/reminder
 * Check if backup reminder should be shown
 */
router.get('/reminder', async (req, res) => {
  try {
    const status = await getBackupStatus();
    const lastBackupDate = status.lastBackup?.time || null;

    const reminderCheck = shouldShowReminder(lastBackupDate);

    res.json({
      success: true,
      data: {
        show: reminderCheck.show,
        reason: reminderCheck.reason,
        daysSince: reminderCheck.daysSince,
        lastBackup: status.lastBackup
      }
    });
  } catch (error) {
    console.error('Backup reminder check error:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
