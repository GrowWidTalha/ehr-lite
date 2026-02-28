/**
 * Reports Routes
 * API endpoints for general document/report storage
 */

import express from 'express';
import multer from 'multer';
import { all, get, run } from '../db/query.js';
import { generateId, validateId } from '../utils/uuid.js';
import * as imageHandler from '../utils/imageHandler.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!imageHandler.isValidImageType(file.originalname)) {
      return cb(new Error('Invalid file type. Only jpg, jpeg, png, gif, pdf allowed.'));
    }
    cb(null, true);
  }
});

// ============================================================================
// REPORTS CRUD
// ============================================================================

/**
 * GET /api/reports
 * List reports with optional filters
 * Query: patient_id, diagnosis_id, report_type, limit, offset
 */
router.get('/', async (req, res) => {
  try {
    const { patient_id, diagnosis_id, report_type, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT
        r.*,
        COUNT(DISTINCT img.id) as image_count
      FROM reports r
      LEFT JOIN report_images img ON img.entity_type = 'reports' AND img.entity_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (patient_id) {
      query += ' AND r.patient_id = ?';
      params.push(patient_id);
    }

    if (diagnosis_id) {
      query += ' AND r.diagnosis_id = ?';
      params.push(diagnosis_id);
    }

    if (report_type) {
      query += ' AND r.report_type = ?';
      params.push(report_type);
    }

    query += ' GROUP BY r.id ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const reports = await all(query, ...params);

    res.json({
      success: true,
      data: reports,
      count: reports.length
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports/:id
 * Get single report by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const report = await get(`
      SELECT
        r.*,
        COUNT(DISTINCT img.id) as image_count
      FROM reports r
      LEFT JOIN report_images img ON img.entity_type = 'reports' AND img.entity_id = r.id
      WHERE r.id = ?
      GROUP BY r.id
    `, id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/reports
 * Create new report
 */
router.post('/', async (req, res) => {
  try {
    const {
      patient_id,
      diagnosis_id,
      title,
      report_type,
      notes,
      report_date
    } = req.body;

    // Validation
    if (!patient_id) {
      return res.status(400).json({
        success: false,
        error: 'patient_id is required'
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'title is required'
      });
    }

    if (!report_type) {
      return res.status(400).json({
        success: false,
        error: 'report_type is required'
      });
    }

    // Verify patient exists
    const patient = await get(`SELECT id FROM patients WHERE id = ?`, patient_id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // If diagnosis_id provided, verify it exists and belongs to patient
    if (diagnosis_id) {
      const diagnosis = await get('SELECT patient_id FROM cancer_diagnoses WHERE id = ?', diagnosis_id);
      if (!diagnosis || diagnosis.patient_id !== patient_id) {
        return res.status(400).json({
          success: false,
          error: 'Invalid diagnosis_id'
        });
      }
    }

    const reportId = generateId();
    const now = new Date().toISOString();

    await run(`
      INSERT INTO reports (id, patient_id, diagnosis_id, title, report_type, notes, report_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, reportId, patient_id, diagnosis_id || null, title, report_type, notes || null, report_date || null, now);

    const report = await get(`SELECT * FROM reports WHERE id = ?`, reportId);

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/reports/:id/images
 * Upload image for a report
 */
router.post('/:id/images', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, sequence = 0 } = req.body;

    const report = await get(`SELECT patient_id FROM reports WHERE id = ?`, id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const imageId = generateId();
    const fileExt = req.file.originalname.split('.').pop();
    const sequenceNum = parseInt(sequence) || 0;
    const filename = imageHandler.generateImageFilename('reports', id, sequenceNum, fileExt);

    const imagePath = imageHandler.saveImage(report.patient_id, filename, req.file.buffer);

    const now = new Date().toISOString();
    await run(`
      INSERT INTO report_images (id, entity_type, entity_id, image_path, file_name, file_type, file_size, caption, sequence, captured_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, imageId, 'reports', id, imagePath, req.file.originalname, fileExt, req.file.size, caption || null, sequenceNum, now, now);

    const image = await get(`SELECT * FROM report_images WHERE id = ?`, imageId);

    res.status(201).json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error uploading report image:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/reports/:id
 * Update report
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await get(`SELECT id FROM reports WHERE id = ?`, id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    const {
      diagnosis_id,
      title,
      report_type,
      notes,
      report_date
    } = req.body;

    const updates = [];
    const values = [];

    const updatableFields = {
      diagnosis_id,
      title,
      report_type,
      notes,
      report_date
    };

    for (const [key, value] of Object.entries(updatableFields)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id);
    const query = `UPDATE reports SET ${updates.join(', ')} WHERE id = ?`;
    await run(query, ...values);

    const report = await get(`SELECT * FROM reports WHERE id = ?`, id);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/reports/:id
 * Delete report (and associated images)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get images to delete files
    const images = await all(`SELECT image_path FROM report_images WHERE entity_type = 'reports' AND entity_id = ?`, id);

    // Delete image files
    images.forEach(img => {
      imageHandler.deleteImage(img.image_path);
    });

    // Delete report (cascade will delete image records)
    const result = await run(`DELETE FROM reports WHERE id = ?`, id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports/:id/images
 * Get all images for a report
 */
router.get('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;

    const images = await all(`
      SELECT * FROM report_images
      WHERE entity_type = 'reports' AND entity_id = ?
      ORDER BY sequence, created_at
    `, id);

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Error fetching report images:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
