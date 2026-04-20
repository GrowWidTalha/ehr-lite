/**
 * Export Service
 *
 * Handles exporting patient data from the database to Excel format.
 * Converts normalized database structure to flat 82-column Onco format.
 *
 * @module export.service
 */

import { all } from '../db/query.js';
import { getAllExcelColumns, EXCEL_COLUMN_MAPPING } from '../utils/excel.mapper.js';
import { createExportLog } from '../utils/log-writer.js';
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Fetch all patients with their related data for export
 *
 * @returns {Promise<Array>} Array of patient objects with all related data
 */
export async function fetchAllPatientsForExport() {
  // Fetch all patients
  const patients = await all(`
    SELECT
      p.id,
      p.registration_number,
      p.registration_date,
      p.full_name,
      p.age,
      p.sex,
      p.marital_status,
      p.children_count,
      p.sibling_count,
      p.language,
      p.territory,
      p.phone as contact_number,
      p.cnic as cnic_number,
      p.education
    FROM patients p
    ORDER BY p.registration_number, p.created_at
  `);

  // Fetch related data for each patient
  const patientsWithRelated = await Promise.all(
    patients.map(async (patient) => {
      // Get vitals
      const vitals = await all(`
        SELECT height_cm, weight_kg, blood_group
        FROM patient_vitals
        WHERE patient_id = ?
        ORDER BY recorded_at DESC
        LIMIT 1
      `, patient.id);

      // Get history
      const history = await all(`
        SELECT presenting_complaint as medical_history, comorbidities, family_cancer_history
        FROM patient_history
        WHERE patient_id = ?
        LIMIT 1
      `, patient.id);

      // Get habits
      const habits = await all(`
        SELECT
          smoking_status, smoking_quantity,
          pan_use, pan_quantity,
          gutka_use, gutka_quantity,
          naswar_use, naswar_quantity,
          alcohol_use, alcohol_quantity,
          other_habits, quit_period
        FROM patient_habits
        WHERE patient_id = ?
        LIMIT 1
      `, patient.id);

      // Get diagnosis (most recent)
      const diagnoses = await all(`
        SELECT
          id,
          cancer_type, stage, grade, who_classification,
          diagnosis_date
        FROM cancer_diagnoses
        WHERE patient_id = ?
        ORDER BY diagnosis_date DESC, created_at DESC
        LIMIT 1
      `, patient.id);

      const diagnosis = diagnoses[0] || null;

      // Get pathology
      let pathology = null;
      if (diagnosis) {
        const pathologies = await all(`
          SELECT
            pathological_stage, tumor_size, depth, margins,
            lvi, pni,
            nodes_recovered, nodes_involved, extra_nodal_extension,
            surgery_adequacy, recurrence
          FROM pathology_reports
          WHERE diagnosis_id = ?
          LIMIT 1
        `, diagnosis.id);
        pathology = pathologies[0] || null;
      }

      // Get biomarkers
      let biomarkers = null;
      if (diagnosis) {
        const biomarkerTests = await all(`
          SELECT
            er_status, pr_status, her2_status,
            ki67_percentage, mitosis_count,
            ihc_markers, tumor_markers
          FROM biomarker_tests
          WHERE diagnosis_id = ?
          LIMIT 1
        `, diagnosis.id);
        biomarkers = biomarkerTests[0] || null;
      }

      // Get previous treatments
      let previousTreatments = [];
      if (diagnosis) {
        previousTreatments = await all(`
          SELECT
            previous_chemo,
            previous_radiotherapy,
            previous_targeted_therapy,
            previous_hormonal,
            previous_immunotherapy,
            previous_surgery,
            second_surgery,
            non_cancer_surgery
          FROM previous_treatments
          WHERE diagnosis_id = ?
        `, diagnosis.id);
      }

      // Get imaging studies (with findings)
      let imagingStudies = [];
      if (diagnosis) {
        imagingStudies = await all(`
          SELECT study_type, findings
          FROM imaging_studies
          WHERE diagnosis_id = ?
        `, diagnosis.id);
      }

      // Get treatment plan
      let treatmentPlan = null;
      if (diagnosis) {
        const plans = await all(`
          SELECT
            id,
            plan_type,
            surgery_planned, radical_surgery, palliative_surgery,
            neoadjuvant_chemo, adjuvant_chemo, induction_chemo,
            notes
          FROM treatment_plans
          WHERE diagnosis_id = ?
          LIMIT 1
        `, diagnosis.id);
        treatmentPlan = plans[0] || null;
      }

      // Get treatment sessions
      let treatmentSessions = [];
      if (diagnosis) {
        treatmentSessions = await all(`
          SELECT
            treatment_type,
            chemo_regimen, rt_dose,
            hormonal_agent, targeted_agent, immunotherapy_agent,
            notes
          FROM treatment_sessions
          WHERE diagnosis_id = ?
        `, diagnosis.id);
      }

      return {
        ...patient,
        vitals: vitals[0] || {},
        history: history[0] || {},
        habits: habits[0] || {},
        diagnosis: diagnosis || {},
        pathology: pathology || {},
        biomarkers: biomarkers || {},
        previousTreatments,
        imagingStudies,
        treatmentPlan: treatmentPlan || {},
        treatmentSessions
      };
    })
  );

  return patientsWithRelated;
}

/**
 * Convert normalized patient data to flat Excel row format
 *
 * @param {Object} patient - Patient object with all related data
 * @returns {Object} Flat object with 82 Excel column keys
 */
export function patientToExcelRow(patient) {
  const row = {};

  // Initialize all columns with empty values
  const columns = getAllExcelColumns();
  columns.forEach(col => {
    row[col] = '';
  });

  // Helper to safely get nested value
  const getVal = (obj, key, defaultVal = '') => {
    if (!obj) return defaultVal;
    return obj[key] !== undefined && obj[key] !== null ? obj[key] : defaultVal;
  };

  // Map demographics (patients table)
  row['Reg No'] = getVal(patient, 'registration_number');
  row['Reg. Date'] = formatDate(getVal(patient, 'registration_date'));
  row['Name & Sur Name'] = getVal(patient, 'full_name');
  row['Age'] = getVal(patient, 'age');
  row['Sex'] = normalizeSex(getVal(patient, 'sex'));
  row['Marital Status'] = getVal(patient, 'marital_status');
  row['Children'] = getVal(patient, 'children_count');
  row['Sibling'] = getVal(patient, 'sibling_count');
  row['Language'] = getVal(patient, 'language');
  row['Territory'] = getVal(patient, 'territory');
  row['Contact No'] = getVal(patient, 'contact_number');
  row['CNIC NO'] = getVal(patient, 'cnic_number');
  row['Education'] = getVal(patient, 'education');

  // Map vitals
  row['Height'] = getVal(patient.vitals, 'height_cm');
  row['Weight'] = getVal(patient.vitals, 'weight_kg');
  row['Blood Group'] = getVal(patient.vitals, 'blood_group');

  // Map history
  row['History'] = getVal(patient.history, 'medical_history');
  row['DM - HTN/IHD - HCV/HBV - Others'] = getVal(patient.history, 'comorbidities');
  row['Family History of Cancer'] = getVal(patient.history, 'family_cancer_history');

  // Map habits
  row['Smoking'] = booleanToYes(getVal(patient.habits, 'smoking_status'));
  row['Quantity'] = getVal(patient.habits, 'smoking_quantity');
  row['Pan'] = booleanToYes(getVal(patient.habits, 'pan_use'));
  row['Quantity2'] = getVal(patient.habits, 'pan_quantity');
  row['Gutka'] = booleanToYes(getVal(patient.habits, 'gutka_use'));
  row['Quantity3'] = getVal(patient.habits, 'gutka_quantity');
  row['Naswar'] = booleanToYes(getVal(patient.habits, 'naswar_use'));
  row['Quantity4'] = getVal(patient.habits, 'naswar_quantity');
  row['Alcohol'] = booleanToYes(getVal(patient.habits, 'alcohol_use'));
  row['Quantity5'] = getVal(patient.habits, 'alcohol_quantity');
  row['Others'] = getVal(patient.habits, 'other_habits');
  row['Quit Period'] = getVal(patient.habits, 'quit_period');

  // Map diagnosis
  row['Type of Cancer'] = getVal(patient.diagnosis, 'cancer_type');
  row['Stage'] = getVal(patient.diagnosis, 'stage');
  row['Grade'] = getVal(patient.diagnosis, 'grade');
  row['WHO'] = getVal(patient.diagnosis, 'who_classification');

  // Map previous treatments
  const prevTx = patient.previousTreatments?.[0] || {};

  row['Previous Chemo'] = normalizeYesNo(getVal(prevTx, 'previous_chemo'));
  row['Previous RT'] = normalizeYesNo(getVal(prevTx, 'previous_radiotherapy'));
  row['Previous Targeted / TKI Therapy'] = normalizeYesNo(getVal(prevTx, 'previous_targeted_therapy'));
  row['Previous HT'] = normalizeYesNo(getVal(prevTx, 'previous_hormonal'));
  row['Previous IT'] = normalizeYesNo(getVal(prevTx, 'previous_immunotherapy'));
  row['Surgery Other Than Cancer'] = normalizeYesNo(getVal(prevTx, 'non_cancer_surgery'));
  row['Previous Surgery'] = getVal(prevTx, 'previous_surgery');
  row['2nd Surgery'] = getVal(prevTx, 'second_surgery');

  // Map pathology
  row['Pathological Stage'] = getVal(patient.pathology, 'pathological_stage');
  row['Tumor Size'] = getVal(patient.pathology, 'tumor_size');
  row['Depth'] = getVal(patient.pathology, 'depth');
  row['Margins'] = getVal(patient.pathology, 'margins');
  row['LVI'] = normalizeBoolean(getVal(patient.pathology, 'lvi'));
  row['PNI'] = normalizeBoolean(getVal(patient.pathology, 'pni'));
  row['Nodes Recover'] = getVal(patient.pathology, 'nodes_recovered');
  row['Nodes Involved'] = getVal(patient.pathology, 'nodes_involved');
  row['Extra Node Ext'] = getVal(patient.pathology, 'extra_nodal_extension');
  row['Adequate.  Inadequate Surgery'] = getVal(patient.pathology, 'surgery_adequacy');
  row['Recurence'] = normalizeYesNo(getVal(patient.pathology, 'recurrence'));

  // Map biomarkers
  row['ER'] = normalizeBoolean(getVal(patient.biomarkers, 'er_status'));
  row['PR'] = normalizeBoolean(getVal(patient.biomarkers, 'pr_status'));
  row['Her2-U'] = getVal(patient.biomarkers, 'her2_status');
  row['Ki-67'] = getVal(patient.biomarkers, 'ki67_percentage');
  row['Mitosis/10HPF'] = getVal(patient.biomarkers, 'mitosis_count');
  const ihcMarkers = getVal(patient.biomarkers, 'ihc_markers');
  const tumorMarkers = getVal(patient.biomarkers, 'tumor_markers');
  row['IHC Markers / Tumor Markers'] = [ihcMarkers, tumorMarkers].filter(Boolean).join('; ') || '';

  // Map imaging studies — output findings text if present, otherwise Yes/No
  const imagingMap = {};
  for (const img of (patient.imagingStudies || [])) {
    if (img.findings) {
      imagingMap[img.study_type] = img.findings;
    } else {
      imagingMap[img.study_type] = 'Yes';
    }
  }

  row['Ct Scane'] = imagingMap.ct_scan || '';
  row['MRI'] = imagingMap.mri || '';
  row['Pet Scane'] = imagingMap.pet_scan || '';
  row['U/Sound'] = imagingMap.ultrasound || '';
  row['Mammogram'] = imagingMap.mammogram || '';
  row['Bone Scane'] = imagingMap.bone_scan || '';
  row['Echo'] = imagingMap.echocardiogram || '';
  row['BSC'] = imagingMap.bsc || '';

  // Map treatment plan
  row['Plan'] = getVal(patient.treatmentPlan, 'plan_type');
  row['Surgery'] = exportTreatmentField(getVal(patient.treatmentPlan, 'surgery_planned'));
  row['Radical'] = exportTreatmentField(getVal(patient.treatmentPlan, 'radical_surgery'));
  row['Pallative'] = exportTreatmentField(getVal(patient.treatmentPlan, 'palliative_surgery'));
  row['Neo ADJ'] = exportTreatmentField(getVal(patient.treatmentPlan, 'neoadjuvant_chemo'));
  row['ADJ'] = exportTreatmentField(getVal(patient.treatmentPlan, 'adjuvant_chemo'));
  row['Induction Chemo'] = exportTreatmentField(getVal(patient.treatmentPlan, 'induction_chemo'));

  // Map treatment sessions
  const sessions = patient.treatmentSessions || [];
  const chemoSession = sessions.find(s => s.treatment_type === 'chemotherapy');
  const rtSession = sessions.find(s => s.treatment_type === 'radiotherapy');
  const hormonalSession = sessions.find(s => s.treatment_type === 'hormonal');
  const targetedSession = sessions.find(s => s.treatment_type === 'targeted');
  const brachySession = sessions.find(s => s.treatment_type === 'brachytherapy');
  const immunoSession = sessions.find(s => s.treatment_type === 'immunotherapy');

  row['Chemotherapy'] = chemoSession ? (chemoSession.chemo_regimen || chemoSession.notes || '') : '';
  row['Hormonal Therapy'] = hormonalSession ? (hormonalSession.hormonal_agent || hormonalSession.notes || '') : '';
  row['Targeted Therapy / TKI'] = targetedSession ? (targetedSession.targeted_agent || targetedSession.notes || '') : '';
  row['Radio Therapy'] = rtSession ? (rtSession.rt_dose || rtSession.notes || '') : '';
  row['Brachy Therapy'] = brachySession ? (brachySession.notes || '') : '';
  row['Immuno Theray'] = immunoSession ? (immunoSession.immunotherapy_agent || immunoSession.notes || '') : '';

  return row;
}

/**
 * Helper functions for data normalization
 */

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function normalizeSex(sex) {
  if (!sex) return '';
  const s = sex.toString().toUpperCase();
  if (s === 'MALE' || s === 'M') return 'M';
  if (s === 'FEMALE' || s === 'F') return 'F';
  return sex;
}

function booleanToYes(val) {
  if (val === true || val === 1 || val === '1' || val === 'Yes' || val === 'Y') return 'Yes';
  if (val === false || val === 0 || val === '0' || val === 'No' || val === 'N') return 'No';
  // Handle habit status values ('Current', 'Former', 'Never')
  if (val === 'Current') return 'Yes';
  if (val === 'Never' || val === 'Former') return 'No';
  return '';
}

function normalizeBoolean(val) {
  if (!val) return '';
  const v = val.toString().toLowerCase();
  if (v === 'true' || v === '1' || v === 'positive' || v === '+' || v === 'present') return 'Positive';
  if (v === 'false' || v === '0' || v === 'negative' || v === '-' || v === 'absent') return 'Negative';
  return val;
}

function normalizeYesNo(val) {
  if (!val) return '';
  const v = val.toString().toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes' || v === 'y') return 'Yes';
  if (v === 'false' || v === '0' || v === 'no' || v === 'n') return 'No';
  return val;
}

/**
 * Export treatment field — preserves text values, converts Yes/No as-is.
 * Empty stays empty.
 */
function exportTreatmentField(val) {
  if (!val) return '';
  return String(val);
}

/**
 * Generate Excel file from patient data
 *
 * @param {Array} patients - Array of patient objects with related data
 * @returns {Buffer} Excel file buffer
 */
export function generateExcelFile(patients) {
  // Convert patients to Excel rows
  const rows = patients.map(patientToExcelRow);

  // Get column order (82 columns in specific order)
  const columns = getAllExcelColumns();

  // Create worksheet data
  const wsData = [columns]; // Header row

  // Add patient rows
  rows.forEach(row => {
    const dataRow = columns.map(col => row[col] || '');
    wsData.push(dataRow);
  });

  // Create worksheet
  const ws = xlsx.utils.aoa_to_sheet(wsData);

  // Create workbook
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Patients');

  // Generate buffer
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return buffer;
}

/**
 * Export all patients to Excel and log the operation
 *
 * @returns {Promise<{ buffer: Buffer, filename: string, count: number }>}
 */
export async function exportPatientsToExcel() {
  const startTime = Date.now();
  let status = 'success';
  let errorMessage = null;

  try {
    // Fetch all patients with related data
    const patients = await fetchAllPatientsForExport();

    if (patients.length === 0) {
      return {
        buffer: null,
        filename: null,
        count: 0,
        message: 'No patients to export'
      };
    }

    // Generate Excel file
    const buffer = generateExcelFile(patients);

    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '-' +
      now.toTimeString().split(' ')[0].replace(/:/g, '');
    const filename = `ehr-export-${timestamp}.xlsx`;

    // Calculate duration
    const duration = Date.now() - startTime;

    // Log the export
    await createExportLog({
      timestamp: now.toISOString(),
      filename,
      patientCount: patients.length,
      duration: `${duration}ms`,
      status: 'success',
      fileSize: buffer.length
    });

    return {
      buffer,
      filename,
      count: patients.length
    };
  } catch (error) {
    status = 'error';
    errorMessage = error.message;
    const duration = Date.now() - startTime;

    // Log the failure
    await createExportLog({
      timestamp: new Date().toISOString(),
      filename: null,
      patientCount: 0,
      duration: `${duration}ms`,
      status: 'error',
      error: errorMessage
    });

    throw error;
  }
}

export default {
  fetchAllPatientsForExport,
  patientToExcelRow,
  generateExcelFile,
  exportPatientsToExcel
};
