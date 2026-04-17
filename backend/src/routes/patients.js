/**
 * Patient Routes
 * API endpoints for patient management
 */

import express from 'express';
import multer from 'multer';
import { all, get, run } from '../db/query.js';
import { generateId, validateId } from '../utils/uuid.js';
import * as imageHandler from '../utils/imageHandler.js';

const router = express.Router();

// Helper to convert undefined to null
function toNull(value) {
  return (value === undefined || value === '' || value === null) ? null : value;
}

// ============================================================================
// PATIENT CRUD
// ============================================================================

/**
 * GET /api/patients
 * List all patients with optional search/filter
 */
router.get('/', async (req, res) => {
  try {
    const { search, limit, offset = 0 } = req.query;

    // When searching or no limit specified, return all results. Otherwise use provided limit.
    const actualLimit = Number(limit) || (search ? 10000 : 10000);

    let query = `
      SELECT
        p.id,
        p.registration_number,
        p.full_name,
        p.age,
        p.sex,
        p.phone,
        p.cnic,
        p.registration_date,
        COUNT(DISTINCT r.id) as report_count
      FROM patients p
      LEFT JOIN reports r ON p.id = r.patient_id
    `;

    let params = [];

    if (search) {
      query += ` WHERE p.full_name LIKE ? OR p.phone LIKE ? OR p.cnic LIKE ?`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(actualLimit, Number(offset));

    const patients = await all(query, ...params);

    res.json({
      success: true,
      data: patients,
      count: patients.length
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patients/:id
 * Get single patient by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid patient ID format'
      });
    }

    const patient = await get(`SELECT * FROM patients WHERE id = ?`, id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/patients
 * Create new patient
 */
router.post('/', async (req, res) => {
  try {
    const id = generateId();
    const now = new Date().toISOString();

    const {
      registration_number,
      registration_date,
      full_name,
      age,
      sex,
      phone,
      cnic,
      marital_status,
      education,
      language,
      territory,
      children_count,
      sibling_count
    } = req.body;

    // Validation
    if (!full_name) {
      return res.status(400).json({
        success: false,
        error: 'full_name is required'
      });
    }

    if (sex && !['Male', 'Female', 'Other'].includes(sex)) {
      return res.status(400).json({
        success: false,
        error: 'sex must be Male, Female, or Other'
      });
    }

    await run(`
      INSERT INTO patients (
        id, registration_number, registration_date,
        full_name, age, sex, phone, cnic,
        marital_status, education, language, territory,
        children_count, sibling_count,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      id,
      toNull(registration_number),
      toNull(registration_date),
      full_name,
      toNull(age),
      toNull(sex),
      toNull(phone),
      toNull(cnic),
      toNull(marital_status),
      toNull(education),
      toNull(language),
      toNull(territory),
      children_count || 0,
      sibling_count || 0,
      now,
      now
    );

    const patient = await get(`SELECT * FROM patients WHERE id = ?`, id);

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error creating patient:', error);

    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({
        success: false,
        error: 'Registration number already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/patients/:id
 * Update patient
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid patient ID format'
      });
    }

    // Check if patient exists
    const existing = await get(`SELECT id FROM patients WHERE id = ?`, id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    const {
      registration_number,
      registration_date,
      full_name,
      age,
      sex,
      phone,
      cnic,
      marital_status,
      education,
      language,
      territory,
      children_count,
      sibling_count
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];

    const updatableFields = {
      registration_number,
      registration_date,
      full_name,
      age,
      sex,
      phone,
      cnic,
      marital_status,
      education,
      language,
      territory,
      children_count,
      sibling_count
    };

    for (const [key, value] of Object.entries(updatableFields)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(toNull(value));
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString(), id);

    const query = `UPDATE patients SET ${updates.join(', ')} WHERE id = ?`;
    await run(query, ...values);

    const patient = await get(`SELECT * FROM patients WHERE id = ?`, id);

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/patients/:id
 * Delete patient (cascade deletes all related records)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid patient ID format'
      });
    }

    const result = await run(`DELETE FROM patients WHERE id = ?`, id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// PATIENT RELATED DATA
// ============================================================================

/**
 * GET /api/patients/:id/vitals
 * Get patient vitals history
 */
router.get('/:id/vitals', async (req, res) => {
  try {
    const { id } = req.params;

    const vitals = await all(`
      SELECT * FROM patient_vitals
      WHERE patient_id = ?
      ORDER BY recorded_at DESC
    `, id);

    res.json({
      success: true,
      data: vitals
    });
  } catch (error) {
    console.error('Error fetching vitals:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/patients/:id/vitals
 * Add patient vitals
 */
router.post('/:id/vitals', async (req, res) => {
  try {
    const { id } = req.params;
    const vitalsId = generateId();

    const {
      height_cm,
      weight_kg,
      blood_group
    } = req.body;

    if (blood_group && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(blood_group)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid blood group'
      });
    }

    await run(`
      INSERT INTO patient_vitals (id, patient_id, height_cm, weight_kg, blood_group)
      VALUES (?, ?, ?, ?, ?)
    `, vitalsId, id, toNull(height_cm), toNull(weight_kg), toNull(blood_group));

    const vitals = await get(`SELECT * FROM patient_vitals WHERE id = ?`, vitalsId);

    res.status(201).json({
      success: true,
      data: vitals
    });
  } catch (error) {
    console.error('Error adding vitals:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patients/:id/history
 * Get patient history
 */
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;

    const history = await get(`SELECT * FROM patient_history WHERE patient_id = ?`, id);

    res.json({
      success: true,
      data: history || null
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/patients/:id/history
 * Create/update patient history
 */
router.post('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();

    const {
      presenting_complaint,
      comorbidities,
      family_cancer_history
    } = req.body;

    // Check if exists
    const existing = await get(`SELECT id FROM patient_history WHERE patient_id = ?`, id);

    if (existing) {
      // Update
      await run(`
        UPDATE patient_history
        SET presenting_complaint = ?, comorbidities = ?, family_cancer_history = ?, updated_at = ?
        WHERE patient_id = ?
      `, toNull(presenting_complaint), toNull(comorbidities), toNull(family_cancer_history), now, id);
    } else {
      // Insert
      const historyId = generateId();
      await run(`
        INSERT INTO patient_history (id, patient_id, presenting_complaint, comorbidities, family_cancer_history, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, historyId, id, toNull(presenting_complaint), toNull(comorbidities), toNull(family_cancer_history), now, now);
    }

    const history = await get(`SELECT * FROM patient_history WHERE patient_id = ?`, id);

    res.status(201).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error saving history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/patients/:id/history
 * Update patient history
 */
router.put('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();

    const {
      presenting_complaint,
      comorbidities,
      family_cancer_history
    } = req.body;

    // Check if exists
    const existing = await get(`SELECT id FROM patient_history WHERE patient_id = ?`, id);

    if (existing) {
      // Update
      await run(`
        UPDATE patient_history
        SET presenting_complaint = ?, comorbidities = ?, family_cancer_history = ?, updated_at = ?
        WHERE patient_id = ?
      `, toNull(presenting_complaint), toNull(comorbidities), toNull(family_cancer_history), now, id);
    } else {
      // Insert
      const historyId = generateId();
      await run(`
        INSERT INTO patient_history (id, patient_id, presenting_complaint, comorbidities, family_cancer_history, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, historyId, id, toNull(presenting_complaint), toNull(comorbidities), toNull(family_cancer_history), now, now);
    }

    const history = await get(`SELECT * FROM patient_history WHERE patient_id = ?`, id);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error updating history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patients/:id/habits
 * Get patient habits
 */
router.get('/:id/habits', async (req, res) => {
  try {
    const { id } = req.params;

    const habits = await get(`SELECT * FROM patient_habits WHERE patient_id = ?`, id);

    res.json({
      success: true,
      data: habits || null
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/patients/:id/habits
 * Create/update patient habits
 */
router.post('/:id/habits', async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();

    const habitData = req.body;

    // Check if exists
    const existing = await get(`SELECT id FROM patient_habits WHERE patient_id = ?`, id);

    if (existing) {
      // Update
      const updates = [];
      const values = [];

      const fields = [
        'smoking_status', 'smoking_quantity',
        'pan_use', 'pan_quantity',
        'gutka_use', 'gutka_quantity',
        'naswar_use', 'naswar_quantity',
        'alcohol_use', 'alcohol_quantity',
        'other_habits', 'quit_period'
      ];

      for (const field of fields) {
        if (habitData[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(toNull(habitData[field]));
        }
      }

      updates.push('updated_at = ?');
      values.push(now, id);

      await run(`UPDATE patient_habits SET ${updates.join(', ')} WHERE patient_id = ?`, ...values);
    } else {
      // Insert
      const habitsId = generateId();
      const values = [habitsId, id];
      const placeholders = ['id', 'patient_id'];

      for (const field of [
        'smoking_status', 'smoking_quantity',
        'pan_use', 'pan_quantity',
        'gutka_use', 'gutka_quantity',
        'naswar_use', 'naswar_quantity',
        'alcohol_use', 'alcohol_quantity',
        'other_habits', 'quit_period'
      ]) {
        if (habitData[field] !== undefined) {
          placeholders.push(field);
          values.push(toNull(habitData[field]));
        }
      }

      values.push(now, now);
      placeholders.push('created_at', 'updated_at');

      await run(`
        INSERT INTO patient_habits (${placeholders.join(', ')})
        VALUES (${placeholders.map(() => '?').join(', ')})
      `, ...values);
    }

    const habits = await get(`SELECT * FROM patient_habits WHERE patient_id = ?`, id);

    res.status(201).json({
      success: true,
      data: habits
    });
  } catch (error) {
    console.error('Error saving habits:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patients/:id/diagnoses
 * Get patient cancer diagnoses with all related data
 */
router.get('/:id/diagnoses', async (req, res) => {
  try {
    const { id } = req.params;

    // Get basic diagnoses
    const diagnoses = await all(`
      SELECT cd.*,
        (SELECT COUNT(*) FROM report_images img WHERE img.entity_type = 'cancer_diagnoses' AND img.entity_id = cd.id) as image_count
      FROM cancer_diagnoses cd
      WHERE cd.patient_id = ?
      ORDER BY cd.created_at DESC
    `, id);

    // Fetch related data for each diagnosis and attach it
    const diagnosesWithDetails = await Promise.all(diagnoses.map(async (diagnosis) => {
      // Get pathology data
      const pathology = await get(`
        SELECT tumor_size, depth, margins, lvi, pni, nodes_recovered, nodes_involved
        FROM pathology_reports
        WHERE diagnosis_id = ?
        LIMIT 1
      `, diagnosis.id);

      // Get biomarker data
      const biomarker = await get(`
        SELECT er_status, er_percentage, pr_status, pr_percentage, her2_status, ki67_percentage
        FROM biomarker_tests
        WHERE diagnosis_id = ?
        LIMIT 1
      `, diagnosis.id);

      // Get imaging data
      const imaging = await get(`
        SELECT study_type, study_date, findings, indication
        FROM imaging_studies
        WHERE diagnosis_id = ?
        LIMIT 1
      `, diagnosis.id);

      // Get treatment data
      const treatment = await get(`
        SELECT plan_type, surgery_planned, neoadjuvant_chemo, adjuvant_chemo
        FROM treatment_plans
        WHERE diagnosis_id = ?
        LIMIT 1
      `, diagnosis.id);

      return {
        ...diagnosis,
        // Pathology
        tumor_size: pathology?.tumor_size || null,
        depth: pathology?.depth || null,
        margins: pathology?.margins || null,
        lvi: pathology?.lvi || null,
        pni: pathology?.pni || null,
        nodes_recovered: pathology?.nodes_recovered || null,
        nodes_involved: pathology?.nodes_involved || null,
        // Biomarkers
        er_status: biomarker?.er_status || null,
        er_percentage: biomarker?.er_percentage || null,
        pr_status: biomarker?.pr_status || null,
        pr_percentage: biomarker?.pr_percentage || null,
        her2_status: biomarker?.her2_status || null,
        ki67_percentage: biomarker?.ki67_percentage || null,
        // Imaging
        study_type: imaging?.study_type || null,
        study_date: imaging?.study_date || null,
        findings: imaging?.findings || null,
        indication: imaging?.indication || null,
        // Treatment
        plan_type: treatment?.plan_type || null,
        surgery_planned: treatment?.surgery_planned || null,
        neoadjuvant_chemo: treatment?.neoadjuvant_chemo || null,
        adjuvant_chemo: treatment?.adjuvant_chemo || null,
      };
    }));

    res.json({
      success: true,
      data: diagnosesWithDetails
    });
  } catch (error) {
    console.error('Error fetching diagnoses:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patients/:id/diagnoses/:diagnosisId
 * Get single diagnosis with all details for editing
 */
router.get('/:id/diagnoses/:diagnosisId', async (req, res) => {
  try {
    const { id, diagnosisId } = req.params;

    // Get basic diagnosis
    const diagnosis = await get(`
      SELECT cd.*
      FROM cancer_diagnoses cd
      WHERE cd.id = ? AND cd.patient_id = ?
    `, diagnosisId, id);

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        error: 'Diagnosis not found'
      });
    }

    // Get pathology data
    const pathology = await get(`
      SELECT tumor_size, depth, margins, lvi, pni, nodes_recovered, nodes_involved
      FROM pathology_reports
      WHERE diagnosis_id = ?
      LIMIT 1
    `, diagnosisId);

    // Get biomarker data
    const biomarker = await get(`
      SELECT er_status, er_percentage, pr_status, pr_percentage, her2_status, ki67_percentage
      FROM biomarker_tests
      WHERE diagnosis_id = ?
      LIMIT 1
    `, diagnosisId);

    // Get imaging data
    const imaging = await get(`
      SELECT study_type, study_date, findings, indication
      FROM imaging_studies
      WHERE diagnosis_id = ?
      LIMIT 1
    `, diagnosisId);

    // Get treatment data
    const treatment = await get(`
      SELECT plan_type, surgery_planned, neoadjuvant_chemo, adjuvant_chemo
      FROM treatment_plans
      WHERE diagnosis_id = ?
      LIMIT 1
    `, diagnosisId);

    // Combine all data
    const combinedDiagnosis = {
      ...diagnosis,
      // Pathology
      tumor_size: pathology?.tumor_size || null,
      depth: pathology?.depth || null,
      margins: pathology?.margins || null,
      lvi: pathology?.lvi || null,
      pni: pathology?.pni || null,
      nodes_recovered: pathology?.nodes_recovered || null,
      nodes_involved: pathology?.nodes_involved || null,
      // Biomarkers
      er_status: biomarker?.er_status || null,
      er_percentage: biomarker?.er_percentage || null,
      pr_status: biomarker?.pr_status || null,
      pr_percentage: biomarker?.pr_percentage || null,
      her2_status: biomarker?.her2_status || null,
      ki67_percentage: biomarker?.ki67_percentage || null,
      // Imaging
      study_type: imaging?.study_type || null,
      study_date: imaging?.study_date || null,
      findings: imaging?.findings || null,
      indication: imaging?.indication || null,
      // Treatment
      plan_type: treatment?.plan_type || null,
      surgery_planned: treatment?.surgery_planned || null,
      neoadjuvant_chemo: treatment?.neoadjuvant_chemo || null,
      adjuvant_chemo: treatment?.adjuvant_chemo || null,
    };

    res.json({
      success: true,
      data: combinedDiagnosis
    });
  } catch (error) {
    console.error('Error fetching diagnosis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/patients/:id/diagnoses
 * Create new cancer diagnosis for patient
 */
router.post('/:id/diagnoses', async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();

    const {
      cancer_type,
      stage,
      grade,
      who_classification,
      diagnosis_date,
      tumor_size,
      depth,
      margins,
      lvi,
      pni,
      nodes_recovered,
      nodes_involved,
      extra_nodal_extension,
      er_status,
      er_percentage,
      pr_status,
      pr_percentage,
      her2_status,
      her2_score,
      ki67_percentage,
      mitosis_count,
      ihc_markers,
      tumor_markers,
      study_type,
      study_date,
      findings,
      indication,
      plan_type,
      surgery_planned,
      neoadjuvant_chemo,
      adjuvant_chemo,
      radical_surgery,
      palliative_surgery,
    } = req.body;

    // Validation
    if (!cancer_type) {
      return res.status(400).json({
        success: false,
        error: 'cancer_type is required'
      });
    }

    // Verify patient exists
    const patient = await get(`SELECT id FROM patients WHERE id = ?`, id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    const diagnosisId = generateId();

    // Create the diagnosis record
    await run(`
      INSERT INTO cancer_diagnoses (id, patient_id, cancer_type, stage, grade, who_classification, diagnosis_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, diagnosisId, id, cancer_type, stage || null, grade || null, who_classification || null, diagnosis_date || null, now, now);

    // Create pathology report if any pathology fields provided
    if (tumor_size || depth || margins || lvi || pni || nodes_recovered || nodes_involved || extra_nodal_extension) {
      const reportId = generateId();
      await run(`
        INSERT INTO pathology_reports (id, diagnosis_id, report_type, pathological_stage, tumor_size, depth, margins, lvi, pni, nodes_recovered, nodes_involved, extra_nodal_extension, created_at)
        VALUES (?, ?, 'pathology', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, reportId, diagnosisId, null, tumor_size || null, depth || null, margins || null, lvi || null, pni || null, nodes_recovered || null, nodes_involved || null, extra_nodal_extension || null, now);
    }

    // Create biomarker test if any biomarker fields provided
    if (er_status || pr_status || her2_status || ki67_percentage || er_percentage || pr_percentage || her2_score || mitosis_count || ihc_markers || tumor_markers) {
      const biomarkerId = generateId();
      await run(`
        INSERT INTO biomarker_tests (id, diagnosis_id, test_type, test_date, er_status, er_percentage, pr_status, pr_percentage, her2_status, her2_score, ki67_percentage, mitosis_count, ihc_markers, tumor_markers, created_at)
        VALUES (?, ?, 'IHC', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, biomarkerId, diagnosisId, diagnosis_date || null, er_status || null, er_percentage || null, pr_status || null, pr_percentage || null, her2_status || null, her2_score || null, ki67_percentage || null, mitosis_count || null, ihc_markers || null, tumor_markers || null, now);
    }

    // Create imaging study if any imaging fields provided
    if (study_type || findings || indication) {
      const imagingId = generateId();
      await run(`
        INSERT INTO imaging_studies (id, diagnosis_id, study_type, study_date, findings, indication, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, imagingId, diagnosisId, study_type || 'Unknown', study_date || null, findings || null, indication || null, now);
    }

    // Create treatment plan if any treatment fields provided
    if (plan_type || surgery_planned || neoadjuvant_chemo || adjuvant_chemo || radical_surgery || palliative_surgery) {
      const planId = generateId();
      await run(`
        INSERT INTO treatment_plans (id, diagnosis_id, plan_type, surgery_planned, radical_surgery, palliative_surgery, neoadjuvant_chemo, adjuvant_chemo, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, planId, diagnosisId, plan_type || null, surgery_planned || null, radical_surgery || null, palliative_surgery || null, neoadjuvant_chemo || null, adjuvant_chemo || null, now, now);
    }

    // Get the created diagnosis
    const diagnosis = await get(`SELECT * FROM cancer_diagnoses WHERE id = ?`, diagnosisId);

    res.status(201).json({
      success: true,
      data: diagnosis
    });
  } catch (error) {
    console.error('Error creating diagnosis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/patients/:id/diagnoses/:diagnosisId
 * Update existing cancer diagnosis
 */
router.put('/:id/diagnoses/:diagnosisId', async (req, res) => {
  try {
    const { id, diagnosisId } = req.params;
    const now = new Date().toISOString();

    const {
      cancer_type,
      stage,
      grade,
      who_classification,
      diagnosis_date,
      tumor_size,
      depth,
      margins,
      lvi,
      pni,
      nodes_recovered,
      nodes_involved,
      er_status,
      er_percentage,
      pr_status,
      pr_percentage,
      her2_status,
      ki67_percentage,
      study_type,
      study_date,
      findings,
      indication,
      plan_type,
      surgery_planned,
      neoadjuvant_chemo,
      adjuvant_chemo,
    } = req.body;

    // Verify diagnosis exists and belongs to patient
    const existingDiagnosis = await get(
      `SELECT * FROM cancer_diagnoses WHERE id = ? AND patient_id = ?`,
      diagnosisId, id
    );

    if (!existingDiagnosis) {
      return res.status(404).json({
        success: false,
        error: 'Diagnosis not found'
      });
    }

    // Validation
    if (!cancer_type) {
      return res.status(400).json({
        success: false,
        error: 'cancer_type is required'
      });
    }

    // Update basic diagnosis
    await run(`
      UPDATE cancer_diagnoses
      SET cancer_type = ?, stage = ?, grade = ?, who_classification = ?, diagnosis_date = ?, updated_at = ?
      WHERE id = ?
    `, cancer_type, stage || null, grade || null, who_classification || null, diagnosis_date || null, now, diagnosisId);

    // Update or insert pathology report
    const existingPathology = await get(`SELECT * FROM pathology_reports WHERE diagnosis_id = ?`, diagnosisId);
    const hasPathologyData = tumor_size || depth || margins || lvi || pni || nodes_recovered || nodes_involved;

    if (hasPathologyData) {
      if (existingPathology) {
        await run(`
          UPDATE pathology_reports
          SET tumor_size = ?, depth = ?, margins = ?, lvi = ?, pni = ?, nodes_recovered = ?, nodes_involved = ?
          WHERE diagnosis_id = ?
        `, tumor_size || null, depth || null, margins || null, lvi || null, pni || null, nodes_recovered || null, nodes_involved || null, diagnosisId);
      } else {
        const reportId = generateId();
        await run(`
          INSERT INTO pathology_reports (id, diagnosis_id, report_type, tumor_size, depth, margins, lvi, pni, nodes_recovered, nodes_involved, created_at)
          VALUES (?, ?, 'pathology', ?, ?, ?, ?, ?, ?, ?, ?)
        `, reportId, diagnosisId, tumor_size || null, depth || null, margins || null, lvi || null, pni || null, nodes_recovered || null, nodes_involved || null, now);
      }
    }

    // Update or insert biomarker test
    const existingBiomarker = await get(`SELECT * FROM biomarker_tests WHERE diagnosis_id = ?`, diagnosisId);
    const hasBiomarkerData = er_status || pr_status || her2_status || ki67_percentage || er_percentage || pr_percentage;

    if (hasBiomarkerData) {
      if (existingBiomarker) {
        await run(`
          UPDATE biomarker_tests
          SET er_status = ?, er_percentage = ?, pr_status = ?, pr_percentage = ?, her2_status = ?, ki67_percentage = ?
          WHERE diagnosis_id = ?
        `, er_status || null, er_percentage || null, pr_status || null, pr_percentage || null, her2_status || null, ki67_percentage || null, diagnosisId);
      } else {
        const biomarkerId = generateId();
        await run(`
          INSERT INTO biomarker_tests (id, diagnosis_id, test_type, er_status, er_percentage, pr_status, pr_percentage, her2_status, ki67_percentage, created_at)
          VALUES (?, ?, 'IHC', ?, ?, ?, ?, ?, ?, ?)
        `, biomarkerId, diagnosisId, er_status || null, er_percentage || null, pr_status || null, pr_percentage || null, her2_status || null, ki67_percentage || null, now);
      }
    }

    // Update or insert imaging study
    const existingImaging = await get(`SELECT * FROM imaging_studies WHERE diagnosis_id = ?`, diagnosisId);
    const hasImagingData = study_type || findings || indication;

    if (hasImagingData) {
      if (existingImaging) {
        await run(`
          UPDATE imaging_studies
          SET study_type = ?, study_date = ?, findings = ?, indication = ?
          WHERE diagnosis_id = ?
        `, study_type || 'Unknown', study_date || null, findings || null, indication || null, diagnosisId);
      } else {
        const imagingId = generateId();
        await run(`
          INSERT INTO imaging_studies (id, diagnosis_id, study_type, study_date, findings, indication, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, imagingId, diagnosisId, study_type || 'Unknown', study_date || null, findings || null, indication || null, now);
      }
    }

    // Update or insert treatment plan
    const existingTreatment = await get(`SELECT * FROM treatment_plans WHERE diagnosis_id = ?`, diagnosisId);
    const hasTreatmentData = plan_type || surgery_planned || neoadjuvant_chemo || adjuvant_chemo;

    if (hasTreatmentData) {
      if (existingTreatment) {
        await run(`
          UPDATE treatment_plans
          SET plan_type = ?, surgery_planned = ?, neoadjuvant_chemo = ?, adjuvant_chemo = ?, updated_at = ?
          WHERE diagnosis_id = ?
        `, plan_type || null, surgery_planned || null, neoadjuvant_chemo || null, adjuvant_chemo || null, now, diagnosisId);
      } else {
        const planId = generateId();
        await run(`
          INSERT INTO treatment_plans (id, diagnosis_id, plan_type, surgery_planned, neoadjuvant_chemo, adjuvant_chemo, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, planId, diagnosisId, plan_type || null, surgery_planned || null, neoadjuvant_chemo || null, adjuvant_chemo || null, now, now);
      }
    }

    // Get the updated diagnosis with all related data
    const updatedDiagnosis = await get(`
      SELECT
        cd.*,
        pr.tumor_size, pr.depth, pr.margins, pr.lvi, pr.pni, pr.nodes_recovered, pr.nodes_involved,
        bt.er_status, bt.er_percentage, bt.pr_status, bt.pr_percentage, bt.her2_status, bt.ki67_percentage,
        ist.study_type, ist.study_date as imaging_study_date, ist.findings, ist.indication,
        tpl.plan_type, tpl.surgery_planned, tpl.neoadjuvant_chemo, tpl.adjuvant_chemo
      FROM cancer_diagnoses cd
      LEFT JOIN pathology_reports pr ON pr.diagnosis_id = cd.id
      LEFT JOIN biomarker_tests bt ON bt.diagnosis_id = cd.id
      LEFT JOIN imaging_studies ist ON ist.diagnosis_id = cd.id
      LEFT JOIN treatment_plans tpl ON tpl.diagnosis_id = cd.id
      WHERE cd.id = ?
    `, diagnosisId);

    res.json({
      success: true,
      data: { ...updatedDiagnosis, study_date: updatedDiagnosis.imaging_study_date || updatedDiagnosis.study_date }
    });
  } catch (error) {
    console.error('Error updating diagnosis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/patients/:id/diagnoses/:diagnosisId
 * Delete a diagnosis and all related records
 */
router.delete('/:id/diagnoses/:diagnosisId', async (req, res) => {
  try {
    const { id, diagnosisId } = req.params;

    // Verify diagnosis exists and belongs to patient
    const diagnosis = await get(
      `SELECT * FROM cancer_diagnoses WHERE id = ? AND patient_id = ?`,
      diagnosisId, id
    );

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        error: 'Diagnosis not found'
      });
    }

    // Delete related records first (due to foreign key constraints, though we're not using FKs)
    await run(`DELETE FROM pathology_reports WHERE diagnosis_id = ?`, diagnosisId);
    await run(`DELETE FROM biomarker_tests WHERE diagnosis_id = ?`, diagnosisId);
    await run(`DELETE FROM imaging_studies WHERE diagnosis_id = ?`, diagnosisId);
    await run(`DELETE FROM treatment_plans WHERE diagnosis_id = ?`, diagnosisId);

    // Delete the diagnosis
    await run(`DELETE FROM cancer_diagnoses WHERE id = ?`, diagnosisId);

    res.json({
      success: true,
      data: { id: diagnosisId }
    });
  } catch (error) {
    console.error('Error deleting diagnosis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patients/:id/reports
 * Get patient reports with optional type filter
 */
router.get('/:id/reports', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    let query = `
      SELECT r.*
      FROM reports r
      WHERE r.patient_id = ?
    `;
    const params = [id];

    if (type) {
      query += ' AND r.report_type = ?';
      params.push(type);
    }

    query += ' ORDER BY r.created_at DESC';

    const reports = await all(query, ...params);

    // Fetch images for each report
    const reportIds = reports.map(r => r.id);
    const imagesMap = {};

    if (reportIds.length > 0) {
      const placeholders = reportIds.map(() => '?').join(',');
      const images = await all(`
        SELECT entity_id, image_path, file_name, id
        FROM report_images
        WHERE entity_type = 'reports' AND entity_id IN (${placeholders})
        ORDER BY sequence, created_at
      `, ...reportIds);

      // Group images by entity_id
      for (const img of images) {
        if (!imagesMap[img.entity_id]) {
          imagesMap[img.entity_id] = [];
        }
        // Construct URL based on image_path
        // image_path format: /patient-images/{patientId}/{filename}
        // Static file serves from /images -> data/patient-images
        // So we need to strip the /patient-images prefix
        const imagePath = img.image_path || '';
        const relativePath = imagePath.replace('/patient-images/', '');
        imagesMap[img.entity_id].push({
          id: img.id,
          url: `http://localhost:4000/images/${relativePath}`, // Full URL for now - frontend can use as-is
          file_name: img.file_name
        });
      }
    }

    // Attach images to reports
    const reportsWithImages = reports.map(report => ({
      ...report,
      images: imagesMap[report.id] || [],
      image_count: imagesMap[report.id]?.length || 0
    }));

    res.json({
      success: true,
      data: reportsWithImages
    });
  } catch (error) {
    console.error('Error fetching patient reports:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/patients/:id/reports
 * Create new report for patient with optional image upload
 * Form data: title, report_type, notes, report_date, images (file)
 */

// Configure multer for patient report uploads
const upload = multer({
  storage: multer.memoryStorage(),
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

router.post('/:id/reports', upload.single('images'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify patient exists
    const patient = await get(`SELECT id FROM patients WHERE id = ?`, id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    const { title, report_type, notes, report_date } = req.body;

    // Validation
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

    const reportId = generateId();
    const now = new Date().toISOString();

    // Create report record
    await run(`
      INSERT INTO reports (id, patient_id, title, report_type, notes, report_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, reportId, id, title, report_type, notes || null, report_date || null, now);

    // Debug: check if file was uploaded
    console.log('Upload debug - req.file:', req.file ? 'YES' : 'NO', req.file);

    // If image was uploaded, save it
    if (req.file) {
      try {
        const imageId = generateId();
        const fileExt = req.file.originalname.split('.').pop();
        const filename = imageHandler.generateImageFilename('reports', reportId, 0, fileExt);

        console.log('Saving image:', { id, filename, bufferSize: req.file.buffer.length });
        const imagePath = imageHandler.saveImage(id, filename, req.file.buffer);
        console.log('Image saved to:', imagePath);

        await run(`
          INSERT INTO report_images (id, entity_type, entity_id, image_path, file_name, file_type, file_size, caption, sequence, captured_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, imageId, 'reports', reportId, imagePath, req.file.originalname, fileExt, req.file.size, null, 0, now, now);
      } catch (imageError) {
        console.error('Error saving image:', imageError);
      }
    }

    const report = await get(`SELECT * FROM reports WHERE id = ?`, reportId);

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error creating patient report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
