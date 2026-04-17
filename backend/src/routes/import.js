/**
 * Import Routes
 *
 * API endpoints for importing patient data from Excel files.
 *
 * @module routes/import
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { importPatientsFromExcel } from '../services/import.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: (req, file, cb) => {
    // Only accept Excel files
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/octet-stream' // Fallback
    ];

    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls' || allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  }
});

// Store active imports
const activeImports = new Map();

/**
 * POST /api/import/upload
 * Upload and import Excel file
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  // Check if there's an active import
  if (activeImports.size > 0) {
    return res.status(409).json({
      success: false,
      error: 'An import is already in progress'
    });
  }

  const importId = Date.now().toString();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log(`Import request received: ${req.file.originalname} (${req.file.size} bytes)`);

    activeImports.set(importId, { status: 'processing', file: req.file.originalname });

    // Import patients with progress tracking
    const result = await importPatientsFromExcel(req.file.buffer, (progress) => {
      // Could emit socket event here for real-time progress
      console.log(`Import progress: ${progress.percent}% (${progress.current}/${progress.total})`);
    });

    activeImports.set(importId, { status: 'completed', ...result.stats });

    res.json({
      success: true,
      data: {
        importId,
        stats: result.stats,
        errors: result.errors
      }
    });

    console.log(`Import completed: ${result.stats.successCount} successful, ${result.stats.errorCount} errors`);

  } catch (error) {
    activeImports.set(importId, { status: 'failed', error: error.message });

    console.error('Import error:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Import failed'
    });
  } finally {
    // Clean up after 5 minutes
    setTimeout(() => {
      activeImports.delete(importId);
    }, 5 * 60 * 1000);
  }
});

/**
 * GET /api/import/status
 * Check if an import is in progress
 */
router.get('/status', async (req, res) => {
  try {
    const imports = Array.from(activeImports.entries()).map(([id, data]) => ({
      id,
      ...data
    }));

    res.json({
      success: true,
      data: {
        active: imports.length > 0,
        imports
      }
    });
  } catch (error) {
    console.error('Import status error:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/import/logs
 * Get import logs
 */
router.get('/logs', async (req, res) => {
  try {
    const { readLogs } = await import('../utils/log-writer.js');
    const logs = readLogs('import');

    // Get last 10 imports
    const recentLogs = logs.slice(-10).reverse();

    res.json({
      success: true,
      data: recentLogs
    });
  } catch (error) {
    console.error('Import logs error:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
