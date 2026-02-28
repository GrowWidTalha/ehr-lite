/**
 * Images Routes
 * API endpoints for image upload and management
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

// Ensure images directory exists
imageHandler.ensureImagesDir();

// ============================================================================
// IMAGE UPLOAD & MANAGEMENT
// ============================================================================

/**
 * POST /api/images
 * Upload a single image
 * Body: entity_type, entity_id, caption, sequence (optional), image (file)
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { entity_type, entity_id, caption, sequence = 0 } = req.body;

    // Validation
    if (!entity_type || !entity_id) {
      return res.status(400).json({
        success: false,
        error: 'entity_type and entity_id are required'
      });
    }

    const validEntityTypes = [
      'patient_vitals',
      'patient_history',
      'previous_treatments',
      'pathology_reports',
      'biomarker_tests',
      'imaging_studies',
      'treatment_sessions',
      'reports'
    ];

    if (!validEntityTypes.includes(entity_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid entity_type. Must be one of: ${validEntityTypes.join(', ')}`
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Determine patient_id based on entity_type
    let patientId;
    if (entity_type === 'patient_vitals' || entity_type === 'patient_history') {
      patientId = entity_id;
    } else {
      // For other entities, we need to look up the patient_id
      const lookupMap = {
        'previous_treatments': 'SELECT diagnosis_id FROM previous_treatments WHERE id = ?',
        'pathology_reports': 'SELECT diagnosis_id FROM pathology_reports WHERE id = ?',
        'biomarker_tests': 'SELECT diagnosis_id FROM biomarker_tests WHERE id = ?',
        'imaging_studies': 'SELECT diagnosis_id FROM imaging_studies WHERE id = ?',
        'treatment_sessions': 'SELECT diagnosis_id FROM treatment_sessions WHERE id = ?',
        'reports': 'SELECT patient_id FROM reports WHERE id = ?'
      };

      const lookupQuery = lookupMap[entity_type];
      if (!lookupQuery) {
        return res.status(400).json({
          success: false,
          error: 'Invalid entity_type'
        });
      }

      const result = await get(lookupQuery, entity_id);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Entity not found'
        });
      }

      // For reports, patient_id is direct, for others we need to get it from diagnosis
      if (entity_type === 'reports') {
        patientId = result.patient_id;
      } else {
        const diagnosis = await get('SELECT patient_id FROM cancer_diagnoses WHERE id = ?', result.diagnosis_id);
        patientId = diagnosis?.patient_id;
      }
    }

    if (!patientId) {
      return res.status(404).json({
        success: false,
        error: 'Could not determine patient_id'
      });
    }

    // Generate filename and save
    const imageId = generateId();
    const fileExt = req.file.originalname.split('.').pop();
    const sequenceNum = parseInt(sequence) || 0;
    const filename = imageHandler.generateImageFilename(entity_type, entity_id, sequenceNum, fileExt);

    const imagePath = imageHandler.saveImage(patientId, filename, req.file.buffer);

    // Save to database
    const now = new Date().toISOString();
    await run(`
      INSERT INTO report_images (id, entity_type, entity_id, image_path, file_name, file_type, file_size, caption, sequence, captured_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, imageId, entity_type, entity_id, imagePath, req.file.originalname, fileExt, req.file.size, caption || null, sequenceNum, now, now);

    const image = await get(`SELECT * FROM report_images WHERE id = ?`, imageId);

    res.status(201).json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/images
 * Get images by entity
 * Query: entity_type, entity_id, patient_id
 */
router.get('/', async (req, res) => {
  try {
    const { entity_type, entity_id, patient_id } = req.query;

    let query = 'SELECT * FROM report_images WHERE 1=1';
    const params = [];

    if (entity_type) {
      query += ' AND entity_type = ?';
      params.push(entity_type);
    }

    if (entity_id) {
      query += ' AND entity_id = ?';
      params.push(entity_id);
    }

    if (patient_id) {
      query += ' AND image_path LIKE ?';
      params.push(`%/patient-images/${patient_id}/%`);
    }

    query += ' ORDER BY sequence, created_at';

    const images = await all(query, ...params);

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/images/:id
 * Get single image by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const image = await get(`SELECT * FROM report_images WHERE id = ?`, id);

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/images/:id
 * Delete an image
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const image = await get(`SELECT * FROM report_images WHERE id = ?`, id);

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Delete file
    imageHandler.deleteImage(image.image_path);

    // Delete database record
    await run(`DELETE FROM report_images WHERE id = ?`, id);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/images/:id
 * Update image metadata (caption, sequence)
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, sequence } = req.body;

    const updates = [];
    const values = [];

    if (caption !== undefined) {
      updates.push('caption = ?');
      values.push(caption);
    }

    if (sequence !== undefined) {
      updates.push('sequence = ?');
      values.push(sequence);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id);
    await run(`UPDATE report_images SET ${updates.join(', ')} WHERE id = ?`, ...values);

    const image = await get(`SELECT * FROM report_images WHERE id = ?`, id);

    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
