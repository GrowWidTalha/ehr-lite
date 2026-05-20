/**
 * Patient Routes - New Schema (PascalCase/Integer)
 * API endpoints for patient management using Patient table
 */

import express from 'express';
import multer from 'multer';
import { all, get, run } from '../db/query.js';
import { generateId } from '../utils/uuid.js';
import * as imageHandler from '../utils/imageHandler.js';

const router = express.Router();

// Configure multer for report image uploads
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
// PATIENT CRUD
// ============================================================================

/**
 * GET /api/patients
 * List patients with pagination and search
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Count total matching patients
    let countQuery = 'SELECT COUNT(*) as count FROM vw_patient_list';
    let countParams = [];
    if (search) {
      countQuery += ' WHERE PatientName LIKE ? OR RegistrationNo LIKE ? OR ContactNo LIKE ?';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const totalResult = await get(countQuery, ...countParams);
    const total = totalResult.count;

    // Get paginated patients
    let query = 'SELECT * FROM vw_patient_list';
    let params = [];
    if (search) {
      query += ' WHERE PatientName LIKE ? OR RegistrationNo LIKE ? OR ContactNo LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY RegistrationDate DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const patients = await all(query, ...params);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        patients,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages
      }
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
 * Get single patient by ID (integer)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = Number(id);

    if (isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID must be a number'
      });
    }

    const patient = await get('SELECT * FROM vw_patient_detail WHERE PatientID = ?', patientId);

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
    const data = req.body;
    const now = new Date().toISOString();

    // Validation
    if (!data.PatientName) {
      return res.status(400).json({
        success: false,
        error: 'PatientName is required'
      });
    }

    // Set RegistrationDate if not provided
    if (!data.RegistrationDate) {
      data.RegistrationDate = now;
    }

    // Build column and value lists
    const columns = [];
    const placeholders = [];
    const values = [];

    // All Patient fields that can be inserted
    const patientFields = [
      'RegistrationNo', 'RegistrationDate', 'PatientName', 'WOSODO', 'RelativeName',
      'Age', 'Height', 'HScale', 'Weight', 'WScale', 'Gender', 'MaritalStatus',
      'NoOfChidren', 'NoOfSibling', 'BloodGroup', 'ContactNo', 'CNICNo',
      'Educated', 'Qualifications', 'Occupation', 'Years', 'MonthlyIncome',
      'WaterUsage', 'MotherTongue', 'PlaceOfBirth', 'DoSports', 'Sports',
      'HowOften', 'DoExercise', 'Exercise', 'Durantion', 'PresentAddress',
      'PermanentAddress', 'TreatedBefore', 'AlternativeNameDuration',
      'MedicalTreatmentSpecify', 'PreviousTreatment', 'ModeOfPresentation',
      'PresentedWith', 'TreatmentOfferedAtJPMC', 'OutComeOfTreatment',
      'ProposedTreatment', 'PlanOfTreatment', 'SurgicalProcedure', 'SurgicalDate',
      'Hospital', 'TNM', 'Margins', 'LVI', 'PNI', 'EGFR', 'EGFR2', 'ENE',
      'ECE', 'NodesDisected', 'NodesInvolved', 'Metastasis', 'SitesOfMetastasis',
      'TumorLateralityRL', 'Quadrant', 'TumorSize', 'TumorDepth',
      'TumorResponseToChemo', 'Grade', 'RadioTherapy', 'Dose', 'ResponseR',
      'ChemoRegimen', 'Cycles', 'ResponseC', 'SurgicalOutCome',
      'SurgicalPathalogy', 'StatingTest', 'BrainTumor', 'HeadAndNeck',
      'BreastCancer', 'Genitourinary', 'Gyneacological', 'LungsCancer',
      'GITumor', 'SkinTumor', 'Hematological', 'Sarcoma', 'Carcinoma',
      'FollowUp', 'ExaminationDate', 'DoctorName'
    ];

    for (const field of patientFields) {
      if (data[field] !== undefined) {
        columns.push(field);
        placeholders.push('?');
        values.push(data[field] === null ? null : data[field]);
      }
    }

    const query = `
      INSERT INTO Patient (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
    `;

    const result = await run(query, ...values);
    const patientId = result.lastInsertRowid;

    const patient = await get('SELECT * FROM vw_patient_detail WHERE PatientID = ?', patientId);

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
 * Update patient (partial update supported)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = Number(id);

    if (isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID must be a number'
      });
    }

    // Check if patient exists
    const existing = await get('SELECT PatientID FROM Patient WHERE PatientID = ?', patientId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    const data = req.body;

    // Field name mapping (snake_case from frontend → PascalCase columns)
    const fieldMapping = {
      height_cm: 'Height',
      weight_kg: 'Weight',
      blood_group: 'BloodGroup',
      diagnosis_date: 'ExaminationDate',
      stAge: 'StAge',
      grade: 'Grade',
      tumor_size: 'TumorSize',
      depth: 'TumorDepth',
      nodes_recovered: 'NodesDisected',
      nodes_involved: 'NodesInvolved',
      who_classification: 'WHOClassification',
      er_status: 'ERStatus',
      er_percentAge: 'ERPercent',
      pr_status: 'PRStatus',
      pr_percentAge: 'PRPercent',
      her2_status: 'HER2Status',
      ki67_percentAge: 'Ki67Percent',
      study_type: 'StudyType',
      study_date: 'StudyDate',
      findings: 'Findings',
      indication: 'Indication',
      plan_type: 'PlanType',
      surgery_planned: 'SurgeryPlanned',
      neoadjuvant_chemo: 'NeoadjuvantChemo'
    };

    // Apply field mapping
    const mappedData = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'cancer_type') {
        // Map cancer_type to specific cancer column based on value
        const cancerType = value?.toLowerCase();
        if (cancerType?.includes('brain')) mappedData.BrainTumor = value;
        else if (cancerType?.includes('head') || cancerType?.includes('neck')) mappedData.HeadAndNeck = value;
        else if (cancerType?.includes('breast')) mappedData.BreastCancer = value;
        else if (cancerType?.includes('genitourinary')) mappedData.Genitourinary = value;
        else if (cancerType?.includes('gynecological')) mappedData.Gyneacological = value;
        else if (cancerType?.includes('lung')) mappedData.LungsCancer = value;
        else if (cancerType?.includes('gi') || cancerType?.includes('gastro')) mappedData.GITumor = value;
        else if (cancerType?.includes('skin')) mappedData.SkinTumor = value;
        else if (cancerType?.includes('hematological') || cancerType?.includes('blood')) mappedData.Hematological = value;
        else if (cancerType?.includes('sarcoma')) mappedData.Sarcoma = value;
        else if (cancerType?.includes('carcinoma')) mappedData.Carcinoma = value;
      } else {
        const mappedKey = fieldMapping[key] || key;
        mappedData[mappedKey] = value;
      }
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    // All updatable Patient fields (exclude PatientID and auto-managed fields)
    // Only include fields that actually exist in the Patient table schema
    const updatableFields = [
      'RegistrationNo', 'RegistrationDate', 'PatientName', 'WOSODO', 'RelativeName',
      'Age', 'Height', 'HScale', 'Weight', 'WScale', 'Gender', 'MaritalStatus',
      'NoOfChidren', 'NoOfSibling', 'BloodGroup', 'ContactNo', 'CNICNo',
      'Educated', 'Qualifications', 'Occupation', 'Years', 'MonthlyIncome',
      'WaterUsage', 'MotherTongue', 'PlaceOfBirth', 'DoSports', 'Sports',
      'HowOften', 'DoExercise', 'Exercise', 'Durantion', 'PresentAddress',
      'PermanentAddress', 'TreatedBefore', 'AlternativeNameDuration',
      'MedicalTreatmentSpecify', 'PreviousTreatment', 'ModeOfPresentation',
      'PresentedWith', 'TreatmentOfferedAtJPMC', 'OutComeOfTreatment',
      'ProposedTreatment', 'PlanOfTreatment', 'SurgicalProcedure', 'SurgicalDate',
      'Hospital', 'TNM', 'Margins', 'LVI', 'PNI', 'EGFR', 'EGFR2', 'ENE',
      'ECE', 'NodesDisected', 'NodesInvolved', 'Metastasis', 'SitesOfMetastasis',
      'TumorLateralityRL', 'Quadrant', 'TumorSize', 'TumorDepth',
      'TumorResponseToChemo', 'Grade', 'StAge', 'RadioTherapy', 'Dose', 'ResponseR',
      'ChemoRegimen', 'Cycles', 'ResponseC', 'SurgicalOutCome',
      'SurgicalPathalogy', 'StatingTest', 'BrainTumor', 'HeadAndNeck',
      'BreastCancer', 'Genitourinary', 'Gyneacological', 'LungsCancer',
      'GITumor', 'SkinTumor', 'Hematological', 'Sarcoma', 'Carcinoma',
      'FollowUp', 'ExaminationDate', 'DoctorName',
      'PresentingComplaint', 'Comorbidities', 'FamilyCancerHistory',
      'WHOClassification', 'ERStatus', 'ERPercent', 'PRStatus', 'PRPercent',
      'HER2Status', 'Ki67Percent', 'StudyType', 'StudyDate', 'Findings',
      'Indication', 'PlanType', 'SurgeryPlanned', 'NeoadjuvantChemo'
    ];

    for (const field of updatableFields) {
      if (mappedData[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(mappedData[field] === null ? null : mappedData[field]);
      }
    }

    // Check if we have any data to update (either Patient fields OR habits)
    const hasPatientData = updates.length > 0;
    const habitsFields = ['smoking_status', 'smoking_quantity', 'pan_use', 'pan_quantity',
                          'gutka_use', 'gutka_quantity', 'naswar_use', 'naswar_quantity',
                          'alcohol_use', 'alcohol_quantity', 'other_habits', 'quit_period'];
    const hasHabitsData = habitsFields.some(field => data[field] !== undefined && data[field] !== '' && data[field] !== null)
                          || (Array.isArray(data.habits) && data.habits.length > 0);

    if (!hasPatientData && !hasHabitsData) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Update Patient table if we have data
    if (hasPatientData) {
      values.push(patientId);
      const query = `UPDATE Patient SET ${updates.join(', ')} WHERE PatientID = ?`;
      await run(query, ...values);
    }

    // Handle habits data - new structure with array of habits
    if (hasHabitsData) {
      // Delete existing records
      await run('DELETE FROM PatientAddictions WHERE PatientID = ?', patientId);

      // Check if data has the new habits array structure
      if (Array.isArray(data.habits)) {
        // New structure: habits array with each habit having has_habit, quantity, frequency, quit, quit_period
        for (const habit of data.habits) {
          if (habit.has_habit && habit.addiction_id) {
            await run(
              `INSERT INTO PatientAddictions (PatientID, AddictionID, Quantity, Frequency, Quit, QuitPeriod)
               VALUES (?, ?, ?, ?, ?, ?)`,
              patientId,
              habit.addiction_id,
              habit.quantity || null,
              habit.frequency || null,
              habit.quit ? 'Yes' : 'No',
              habit.quit ? (habit.quit_period || null) : null
            );
          }
        }
      } else {
        // Legacy structure - support old field names for backward compatibility
        const addictions = await all('SELECT ID, Addiction FROM Addictions');
        const addictionMap = {};
        addictions.forEach(a => {
          const key = a.Addiction?.toLowerCase();
          addictionMap[key] = a.ID;
        });

        const habitTypes = [
          { field: 'smoking_status', quantityField: 'smoking_quantity', name: 'Smoking' },
          { field: 'pan_use', quantityField: 'pan_quantity', name: 'Pan' },
          { field: 'gutka_use', quantityField: 'gutka_quantity', name: 'Gutka' },
          { field: 'naswar_use', quantityField: 'naswar_quantity', name: 'Naswar' },
          { field: 'alcohol_use', quantityField: 'alcohol_quantity', name: 'Alcohol' }
        ];

        for (const habit of habitTypes) {
          const status = data[habit.field];
          if (status && status !== 'never' && status !== 'Never') {
            const addictionId = addictionMap[habit.name.toLowerCase()];
            if (addictionId) {
              await run(
                'INSERT INTO PatientAddictions (PatientID, AddictionID, Quantity, Frequency, Quit, QuitPeriod) VALUES (?, ?, ?, ?, ?, ?)',
                patientId, addictionId, data[habit.quantityField] || null, 'Yes', 'No', null
              );
            }
          }
        }
      }
    }
    const patient = await get('SELECT * FROM vw_patient_detail WHERE PatientID = ?', patientId);

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
    const patientId = Number(id);

    if (isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID must be a number'
      });
    }

    await run('DELETE FROM Patient WHERE PatientID = ?', patientId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// PATIENT SUB-RESOURCES
// ============================================================================

/**
 * GET /api/patients/:id/labs
 * Get all lab results for patient grouped by type
 */
router.get('/:id/labs', async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = Number(id);

    const result = {
      cbc: await all('SELECT * FROM LabTestCBCHB WHERE PatientID = ?', patientId),
      lft: await all('SELECT * FROM LFT WHERE PatientID = ?', patientId),
      bloodSugar: await all('SELECT * FROM BloodSugar WHERE PatientID = ?', patientId),
      bloodUrea: await all('SELECT * FROM BloodUrea WHERE PatientID = ?', patientId),
      electrolytes: await all('SELECT * FROM Electrolytes WHERE PatientID = ?', patientId),
      tumorMarkers: await all('SELECT * FROM TumorMarkers WHERE PatientID = ?', patientId),
      pt: await all('SELECT * FROM PT WHERE PatientID = ?', patientId),
      esr: await all('SELECT * FROM ESR WHERE PatientID = ?', patientId),
      ldh: await all('SELECT * FROM LDH WHERE PatientID = ?', patientId),
      calcium: await all('SELECT * FROM Calcium WHERE PatientID = ?', patientId),
      uricAcid: await all('SELECT * FROM UricAcid WHERE PatientID = ?', patientId),
      bloodLipids: await all('SELECT * FROM BloodLipids WHERE PatientID = ?', patientId),
      bicarbonate: await all('SELECT * FROM Bicarbonate WHERE PatientID = ?', patientId),
      tport: await all('SELECT * FROM TPort WHERE PatientID = ?', patientId),
      antiHCV: await all('SELECT * FROM AntiHCV WHERE PatientID = ?', patientId),
      hbsag: await all('SELECT * FROM HBSag WHERE PatientID = ?', patientId),
      urine: await all('SELECT * FROM Urine WHERE PatientID = ?', patientId),
      urineDR2: await all('SELECT * FROM UrineDR2 WHERE PatientID = ?', patientId),
      otherTests: await all('SELECT * FROM LabOtherTests WHERE PatientID = ?', patientId)
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching labs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patients/:id/imaging
 * Get all imaging for patient grouped by type
 */
router.get('/:id/imaging', async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = Number(id);

    const result = {
      xray: await all('SELECT * FROM xRay WHERE PatientID = ?', patientId),
      ctScan: await all('SELECT * FROM CTScan WHERE PatientID = ?', patientId),
      mri: await all('SELECT * FROM MRI WHERE PatientID = ?', patientId),
      ultrasound: await all('SELECT * FROM UltraSound WHERE PatientID = ?', patientId),
      petScan: await all('SELECT * FROM PetScan WHERE PatientID = ?', patientId),
      boneScan: await all('SELECT * FROM BoneScan WHERE PatientID = ?', patientId),
      mammography: await all('SELECT * FROM Mammography WHERE PatientID = ?', patientId),
      doppler: await all('SELECT * FROM Doppler WHERE PatientID = ?', patientId),
      endoscopy: await all('SELECT * FROM Endoscopy WHERE PatientID = ?', patientId),
      bronchoscopy: await all('SELECT * FROM Bronchoscopy WHERE PatientID = ?', patientId),
      laproscopy: await all('SELECT * FROM Laproscopy WHERE PatientID = ?', patientId),
      ecg: await all('SELECT * FROM ECG WHERE PatientID = ?', patientId),
      echocardiography: await all('SELECT * FROM Echocardiography WHERE PatientID = ?', patientId),
      srs: await all('SELECT * FROM SRS WHERE PatientID = ?', patientId),
      otherTests: await all('SELECT * FROM OtherTests WHERE PatientID = ?', patientId)
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching imaging:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patients/:id/treatments
 * Get all treatments for patient grouped by type
 */
router.get('/:id/treatments', async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = Number(id);

    const result = {
      chemo: await all('SELECT * FROM ChemoTherapy WHERE PatientID = ?', patientId),
      radio: await all('SELECT * FROM RadioTherapy WHERE PatientID = ?', patientId),
      hormonal: await all('SELECT * FROM HormonalTherapy WHERE PatientID = ?', patientId),
      targeted: await all('SELECT * FROM TargettedTherapy WHERE PatientID = ?', patientId),
      surgery: await all('SELECT * FROM Surgery WHERE PatientID = ?', patientId),
      leukemia: await all('SELECT * FROM Leukemia WHERE PatientID = ?', patientId),
      chronicLeukemia: await all('SELECT * FROM ChronicLeukemia WHERE PatientID = ?', patientId),
      myeloma: await all('SELECT * FROM Myeloma WHERE PatientID = ?', patientId)
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patients/:id/pathology
 * Get pathology results for patient
 */
router.get('/:id/pathology', async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = Number(id);

    const result = {
      boneMarrow: await all('SELECT * FROM BoneMarrowBiopsy WHERE PatientID = ?', patientId),
      cytogenetics: await all('SELECT * FROM Cytogenetics WHERE PatientID = ?', patientId),
      immunophenotyping: await all('SELECT * FROM immunophenotyping WHERE PatientID = ?', patientId),
      molecular: await all('SELECT * FROM MolecularTest WHERE PatientID = ?', patientId),
      imagingFooter: await get('SELECT * FROM ImagingTestFooter WHERE PatientID = ?', patientId)
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching pathology:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patients/:id/lifestyle
 * Get lifestyle data for patient (addictions, drinks, foods, family history)
 */
router.get('/:id/lifestyle', async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = Number(id);

    const result = {
      addictions: await all(`
        SELECT pa.*, a.Addiction
        FROM PatientAddictions pa
        LEFT JOIN Addictions a ON pa.AddictionID = a.ID
        WHERE pa.PatientID = ?
      `, patientId),
      drinks: await all(`
        SELECT pd.*, d.Drinks
        FROM PatientDrinks pd
        LEFT JOIN Drinks d ON pd.DrinkID = d.ID
        WHERE pd.PatientID = ?
      `, patientId),
      foods: await all(`
        SELECT pf.*, f.Food
        FROM PatientFoods pf
        LEFT JOIN Foods f ON pf.FoodID = f.ID
        WHERE pf.PatientID = ?
      `, patientId),
      familyHistory: await all(`
        SELECT fh.*, d.Diseases, r.Relations
        FROM FamilyHistory fh
        LEFT JOIN Diseases d ON fh.Diseas = d.ID
        LEFT JOIN Relations r ON fh.Relation = r.ID
        WHERE fh.PatientID = ?
      `, patientId)
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching lifestyle:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// REPORTS - Convenience route for patient reports
// ============================================================================

/**
 * GET /api/patients/:id/reports
 * Get all reports for a specific patient with images
 */
router.get('/:id/reports', async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = Number(id);

    if (isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID must be a number'
      });
    }

    // Verify patient exists
    const patient = await get('SELECT PatientID FROM Patient WHERE PatientID = ?', patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    const reports = await all(`
      SELECT
        r.*,
        COUNT(DISTINCT img.id) as image_count
      FROM reports r
      LEFT JOIN report_images img ON img.entity_type = 'reports' AND img.entity_id = r.id
      WHERE r.patient_id = ?
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `, patientId);

    // Fetch images for each report
    const reportsWithImages = await Promise.all(
      reports.map(async (report) => {
        const images = await all(`
          SELECT id, image_path, file_name, caption
          FROM report_images
          WHERE entity_type = 'reports' AND entity_id = ?
          ORDER BY sequence, created_at
        `, report.id);

        return {
          ...report,
          images: images.map((img) => ({
            id: img.id,
            url: `${req.protocol}://${req.get('host')}${img.image_path}`,
            caption: img.caption,
            file_name: img.file_name
          }))
        };
      })
    );

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
 * Create report for a specific patient with optional image upload
 */
router.post('/:id/reports', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = Number(id);

    if (isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID must be a number'
      });
    }

    // Verify patient exists
    const patient = await get('SELECT PatientID FROM Patient WHERE PatientID = ?', patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    const { title, report_type, notes, report_date } = req.body;

    // Validate report_type
    if (!report_type) {
      return res.status(400).json({
        success: false,
        error: 'report_type is required'
      });
    }

    // Use report_type as title if title not provided
    const finalTitle = title || report_type;

    const reportId = generateId();
    const now = new Date().toISOString();

    await run(
      `INSERT INTO reports (id, patient_id, title, report_type, notes, report_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      reportId, patientId, finalTitle, report_type, notes || null, report_date || null, now
    );

    // Handle image uploads if present
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageId = generateId();
        const fileExt = file.originalname.split('.').pop();
        const filename = imageHandler.generateImageFilename('reports', reportId, i, fileExt);

        const imagePath = imageHandler.saveImage(patientId, filename, file.buffer);

        await run(`
          INSERT INTO report_images (id, entity_type, entity_id, image_path, file_name, file_type, file_size, caption, sequence, captured_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, imageId, 'reports', reportId, imagePath, file.originalname, fileExt, file.size, null, i, now, now);
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
