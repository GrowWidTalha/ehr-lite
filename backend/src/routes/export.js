/**
 * Export Routes
 *
 * API endpoints for exporting patient data to Excel format.
 *
 * @module routes/export
 */

import express from 'express';
import { exportPatientsToExcel } from '../services/export.service.js';

const router = express.Router();

/**
 * GET /api/export/patients
 * Export all patient data to Excel file (Onco format - 82 columns)
 *
 * Returns a binary Excel file download with timestamp filename
 */
router.get('/patients', async (req, res) => {
  try {
    console.log('Export request received...');

    // Generate the Excel file
    const result = await exportPatientsToExcel();

    // Handle empty database case
    if (result.count === 0) {
      return res.status(200).json({
        success: true,
        message: result.message || 'No patients found to export',
        data: {
          count: 0,
          filename: null
        }
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);

    // Send the buffer
    res.send(result.buffer);

    console.log(`Export completed: ${result.filename} (${result.count} patients)`);
  } catch (error) {
    console.error('Export error:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to export patient data'
    });
  }
});

/**
 * GET /api/export/status
 * Get export status and recent export info
 *
 * Returns information about the export functionality and recent exports
 */
router.get('/status', async (req, res) => {
  try {
    const { getTodayExportLogs } = await import('../utils/log-writer.js');
    const todayExports = getTodayExportLogs();

    // Get today's export count and total patients
    const exportCount = todayExports.filter(e => e.status === 'success').length;
    const totalPatients = todayExports
      .filter(e => e.status === 'success')
      .reduce((sum, e) => sum + (e.patientCount || 0), 0);

    res.json({
      success: true,
      data: {
        today: {
          exportCount,
          totalPatients,
          lastExport: todayExports.length > 0 ? todayExports[todayExports.length - 1] : null
        },
        format: 'Excel (.xlsx)',
        columns: 82,
        description: 'Onco format - flat structure with all patient data'
      }
    });
  } catch (error) {
    console.error('Export status error:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
