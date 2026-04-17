/**
 * Import Service
 *
 * Handles importing patient data from Excel format to the database.
 * Parses Onco 2025 format (82 columns) and maps to normalized schema.
 *
 * @module import.service
 */

import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { run } from '../db/query.js';
import { createImportLog } from '../utils/log-writer.js';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Parse Excel file to JSON
 *
 * @param {Buffer} buffer - Excel file buffer
 * @returns {Array} Array of row objects with Excel column headers
 */
function parseExcelFile(buffer) {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  return data;
}

/**
 * Map Excel row to database structure
 *
 * @param {Object} row - Excel row object (82 columns)
 * @returns {Object} Normalized data structure for database
 */
function mapExcelRowToDb(row) {
  const patient = {
    id: randomUUID(),
    registration_number: row['Reg No'] || `REG-${Date.now()}`,
    registration_date: parseDate(row['Reg. Date']),
    full_name: row['Name & Sur Name'] || '',
    age: row['Age'] ? parseInt(row['Age']) || null : null,
    sex: normalizeSex(row['Sex']),
    phone: row['Contact No'] || '',
    cnic: row['CNIC NO'] || '',
    marital_status: row['Marital Status'] || '',
    children_count: row['Children'] ? parseInt(row['Children']) || 0 : 0,
    sibling_count: row['Sibling'] ? parseInt(row['Sibling']) || 0 : 0,
    language: row['Language'] || '',
    territory: row['Territory'] || '',
    education: row['Education'] || ''
  };

  // Vitals
  const vitals = {
    id: randomUUID(),
    patient_id: patient.id,
    height_cm: row['Height'] ? parseFloat(row['Height']) || null : null,
    weight_kg: row['Weight'] ? parseFloat(row['Weight']) || null : null,
    blood_group: normalizeBloodGroup(row['Blood Group'])
  };

  // History
  const history = {
    id: randomUUID(),
    patient_id: patient.id,
    presenting_complaint: row['History'] || '',
    comorbidities: row['DM - HTN/IHD - HCV/HBV - Others'] || '',
    family_cancer_history: row['Family History of Cancer'] || ''
  };

  // Habits
  const habits = {
    id: randomUUID(),
    patient_id: patient.id,
    smoking_status: normalizeHabitStatus(row['Smoking']),
    smoking_quantity: row['Quantity'] || '',
    pan_use: normalizeHabitStatus(row['Pan']),
    pan_quantity: row['Quantity2'] || '',
    gutka_use: normalizeHabitStatus(row['Gutka']),
    gutka_quantity: row['Quantity3'] || '',
    naswar_use: normalizeHabitStatus(row['Naswar']),
    naswar_quantity: row['Quantity4'] || '',
    alcohol_use: normalizeHabitStatus(row['Alcohol']),
    alcohol_quantity: row['Quantity5'] || '',
    other_habits: row['Others'] || '',
    quit_period: row['Quit Period'] || ''
  };

  // Diagnosis (create if data exists)
  const hasDiagnosis = row['Type of Cancer'] || row['Stage'] || row['Grade'];
  const diagnosis = hasDiagnosis ? {
    id: randomUUID(),
    patient_id: patient.id,
    cancer_type: row['Type of Cancer'] || '',
    stage: row['Stage'] || '',
    grade: row['Grade'] || '',
    who_classification: row['WHO'] || '',
    diagnosis_date: null // Could parse from row if available
  } : null;

  // Pathology (if diagnosis exists AND has any pathology data)
  const hasPathologyData = diagnosis && (
    row['Pathological Stage'] || row['Tumor Size'] || row['Depth'] ||
    row['Margins'] || row['LVI'] || row['PNI'] ||
    row['Nodes Recover'] || row['Nodes Involved'] ||
    row['Extra Node Ext'] || row['Adequate.  Inadequate Surgery'] || row['Recurence']
  );

  const pathology = hasPathologyData ? {
    id: randomUUID(),
    diagnosis_id: diagnosis.id,
    pathological_stage: row['Pathological Stage'] || '',
    tumor_size: row['Tumor Size'] || '',
    depth: row['Depth'] || '',
    margins: row['Margins'] || '',
    lvi: row['LVI'] || '',
    pni: row['PNI'] || '',
    nodes_recovered: row['Nodes Recover'] ? parseInt(row['Nodes Recover']) || null : null,
    nodes_involved: row['Nodes Involved'] ? parseInt(row['Nodes Involved']) || null : null,
    extra_nodal_extension: row['Extra Node Ext'] || '',
    surgery_adequacy: row['Adequate.  Inadequate Surgery'] || '',
    recurrence: normalizeRecurrence(row['Recurence'])
  } : null;

  // Biomarkers (if diagnosis exists AND has any biomarker data)
  const hasBiomarkerData = diagnosis && (
    row['ER'] || row['PR'] || row['Her2-U'] ||
    row['Ki-67'] || row['Mitosis/10HPF'] || row['IHC Markers / Tumor Markers']
  );

  const biomarkers = hasBiomarkerData ? {
    id: randomUUID(),
    diagnosis_id: diagnosis.id,
    er_status: normalizeBiomarker(row['ER']),
    pr_status: normalizeBiomarker(row['PR']),
    her2_status: row['Her2-U'] || '',
    ki67_percentage: row['Ki-67'] ? parseInt(row['Ki-67']) || null : null,
    mitosis_count: row['Mitosis/10HPF'] ? parseInt(row['Mitosis/10HPF']) || null : null,
    ihc_markers: row['IHC Markers / Tumor Markers'] || ''
  } : null;

  // Previous treatments (always create if diagnosis exists)
  const previousTreatments = diagnosis ? {
    id: randomUUID(),
    diagnosis_id: diagnosis.id,
    previous_chemo: normalizeYesNoToDb(row['Previous Chemo']),
    previous_radiotherapy: normalizeYesNoToDb(row['Previous RT']),
    previous_targeted_therapy: normalizeYesNoToDb(row['Previous Targeted / TKI Therapy']),
    previous_hormonal: normalizeYesNoToDb(row['Previous HT']),
    previous_immunotherapy: normalizeYesNoToDb(row['Previous IT']),
    previous_surgery: row['Previous Surgery'] || '',
    second_surgery: row['2nd Surgery'] || '',
    non_cancer_surgery: row['Surgery Other Than Cancer'] === 'Yes' ? 'Yes' : 'No'
  } : null;

  // Imaging studies (if diagnosis exists)
  const imagingTypes = [];
  if (diagnosis) {
    if (row['Ct Scane'] === 'Yes') imagingTypes.push({ diagnosis_id: diagnosis.id, study_type: 'ct_scan' });
    if (row['MRI'] === 'Yes') imagingTypes.push({ diagnosis_id: diagnosis.id, study_type: 'mri' });
    if (row['Pet Scane'] === 'Yes') imagingTypes.push({ diagnosis_id: diagnosis.id, study_type: 'pet_scan' });
    if (row['U/Sound'] === 'Yes') imagingTypes.push({ diagnosis_id: diagnosis.id, study_type: 'ultrasound' });
    if (row['Mammogram'] === 'Yes') imagingTypes.push({ diagnosis_id: diagnosis.id, study_type: 'mammogram' });
    if (row['Bone Scane'] === 'Yes') imagingTypes.push({ diagnosis_id: diagnosis.id, study_type: 'bone_scan' });
    if (row['Echo'] === 'Yes') imagingTypes.push({ diagnosis_id: diagnosis.id, study_type: 'echocardiogram' });
  }

  // Treatment plan (if diagnosis exists AND has any treatment data)
  const hasTreatmentPlan = diagnosis && (
    row['Plan'] || row['Surgery'] || row['Radical'] || row['Pallative'] ||
    row['Neo ADJ'] || row['ADJ'] || row['Induction Chemo']
  );

  const treatmentPlan = hasTreatmentPlan ? {
    id: randomUUID(),
    diagnosis_id: diagnosis.id,
    plan_type: row['Plan'] || '',
    surgery_planned: normalizeYesNoToDb(row['Surgery']),
    radical_surgery: normalizeYesNoToDb(row['Radical']),
    palliative_surgery: normalizeYesNoToDb(row['Pallative']),
    neoadjuvant_chemo: normalizeYesNoToDb(row['Neo ADJ']),
    adjuvant_chemo: normalizeYesNoToDb(row['ADJ']),
    induction_chemo: normalizeYesNoToDb(row['Induction Chemo'])
  } : null;

  return {
    patient,
    vitals,
    history,
    habits,
    diagnosis,
    pathology,
    biomarkers,
    previousTreatments,
    imagingStudies: imagingTypes,
    treatmentPlan
  };
}

/**
 * Helper functions for data normalization
 */

function parseDate(dateStr) {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function normalizeSex(sex) {
  if (!sex) return null;
  const s = sex.toString().toUpperCase();
  if (s === 'M' || s === 'MALE') return 'Male';
  if (s === 'F' || s === 'FEMALE') return 'Female';
  if (s === 'O' || s === 'OTHER') return 'Other';
  return null;
}

function normalizeBloodGroup(bg) {
  if (!bg) return null;
  const valid = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const normalized = bg.toString().toUpperCase();
  return valid.includes(normalized) ? normalized : null;
}

function normalizeHabitStatus(val) {
  if (!val) return 'Never';
  const v = val.toString().toLowerCase();
  if (v === 'current' || v === 'yes' || v === 'y') return 'Current';
  if (v === 'former') return 'Former';
  return 'Never';
}

function normalizeRecurrence(val) {
  if (!val) return null;
  const v = val.toString().toLowerCase();
  if (v === 'yes' || v === 'y') return 'Yes';
  if (v === 'no' || v === 'n') return 'No';
  return val;
}

function normalizeBiomarker(val) {
  if (!val) return null;
  const v = val.toString().toLowerCase();
  if (v === 'positive' || v === '+' || v === 'pos') return 'Positive';
  if (v === 'negative' || v === '-' || v === 'neg') return 'Negative';
  return val;
}

function normalizeYesNoToDb(val) {
  if (!val) return 'No';
  const v = val.toString().toLowerCase();
  if (v === 'yes' || v === 'y') return 'Yes';
  return 'No';
}

/**
 * Import a single patient from Excel row
 */
async function importPatient(row) {
  const data = mapExcelRowToDb(row);

  try {
    // Insert patient
    await run(`
      INSERT INTO patients (
        id, registration_number, registration_date, full_name, age, sex,
        phone, cnic, marital_status, education, language, territory,
        children_count, sibling_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      data.patient.id,
      data.patient.registration_number,
      data.patient.registration_date,
      data.patient.full_name,
      data.patient.age,
      data.patient.sex,
      data.patient.phone,
      data.patient.cnic,
      data.patient.marital_status,
      data.patient.education,
      data.patient.language,
      data.patient.territory,
      data.patient.children_count,
      data.patient.sibling_count
    );

    // Insert vitals
    await run(`
      INSERT INTO patient_vitals (id, patient_id, height_cm, weight_kg, blood_group)
      VALUES (?, ?, ?, ?, ?)
    `,
      data.vitals.id,
      data.vitals.patient_id,
      data.vitals.height_cm,
      data.vitals.weight_kg,
      data.vitals.blood_group
    );

    // Insert history
    await run(`
      INSERT INTO patient_history (id, patient_id, presenting_complaint, comorbidities, family_cancer_history)
      VALUES (?, ?, ?, ?, ?)
    `,
      data.history.id,
      data.history.patient_id,
      data.history.presenting_complaint,
      data.history.comorbidities,
      data.history.family_cancer_history
    );

    // Insert habits
    await run(`
      INSERT INTO patient_habits (
        id, patient_id, smoking_status, smoking_quantity,
        pan_use, pan_quantity, gutka_use, gutka_quantity,
        naswar_use, naswar_quantity, alcohol_use, alcohol_quantity,
        other_habits, quit_period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      data.habits.id,
      data.habits.patient_id,
      data.habits.smoking_status,
      data.habits.smoking_quantity,
      data.habits.pan_use,
      data.habits.pan_quantity,
      data.habits.gutka_use,
      data.habits.gutka_quantity,
      data.habits.naswar_use,
      data.habits.naswar_quantity,
      data.habits.alcohol_use,
      data.habits.alcohol_quantity,
      data.habits.other_habits,
      data.habits.quit_period
    );

    // Insert diagnosis if exists
    if (data.diagnosis) {
      await run(`
        INSERT INTO cancer_diagnoses (id, patient_id, cancer_type, stage, grade, who_classification, diagnosis_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        data.diagnosis.id,
        data.diagnosis.patient_id,
        data.diagnosis.cancer_type,
        data.diagnosis.stage,
        data.diagnosis.grade,
        data.diagnosis.who_classification,
        data.diagnosis.diagnosis_date
      );

      // Insert pathology
      if (data.pathology) {
        await run(`
          INSERT INTO pathology_reports (
            id, diagnosis_id, report_date, pathological_stage, tumor_size, depth, margins,
            lvi, pni, nodes_recovered, nodes_involved, extra_nodal_extension, surgery_adequacy, recurrence
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          data.pathology.id,
          data.pathology.diagnosis_id,
          null,
          data.pathology.pathological_stage,
          data.pathology.tumor_size,
          data.pathology.depth,
          data.pathology.margins,
          data.pathology.lvi,
          data.pathology.pni,
          data.pathology.nodes_recovered,
          data.pathology.nodes_involved,
          data.pathology.extra_nodal_extension,
          data.pathology.surgery_adequacy,
          data.pathology.recurrence
        );
      }

      // Insert biomarkers
      if (data.biomarkers) {
        await run(`
          INSERT INTO biomarker_tests (
            id, diagnosis_id, test_date, er_status, pr_status, her2_status,
            ki67_percentage, mitosis_count, ihc_markers
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          data.biomarkers.id,
          data.biomarkers.diagnosis_id,
          null,
          data.biomarkers.er_status,
          data.biomarkers.pr_status,
          data.biomarkers.her2_status,
          data.biomarkers.ki67_percentage,
          data.biomarkers.mitosis_count,
          data.biomarkers.ihc_markers
        );
      }

      // Insert previous treatments
      if (data.previousTreatments) {
        await run(`
          INSERT INTO previous_treatments (
            id, diagnosis_id, previous_chemo, previous_radiotherapy,
            previous_targeted_therapy, previous_hormonal, previous_immunotherapy,
            previous_surgery, second_surgery, non_cancer_surgery
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          data.previousTreatments.id,
          data.previousTreatments.diagnosis_id,
          data.previousTreatments.previous_chemo,
          data.previousTreatments.previous_radiotherapy,
          data.previousTreatments.previous_targeted_therapy,
          data.previousTreatments.previous_hormonal,
          data.previousTreatments.previous_immunotherapy,
          data.previousTreatments.previous_surgery,
          data.previousTreatments.second_surgery,
          data.previousTreatments.non_cancer_surgery
        );
      }

      // Insert imaging studies
      for (const imaging of data.imagingStudies) {
        const imagingId = randomUUID();
        await run(`
          INSERT INTO imaging_studies (id, diagnosis_id, study_type, study_date)
          VALUES (?, ?, ?, ?)
        `, imagingId, imaging.diagnosis_id, imaging.study_type, null);
      }

      // Insert treatment plan
      if (data.treatmentPlan) {
        await run(`
          INSERT INTO treatment_plans (
            id, diagnosis_id, plan_type, surgery_planned, radical_surgery,
            palliative_surgery, neoadjuvant_chemo, adjuvant_chemo, induction_chemo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          data.treatmentPlan.id,
          data.treatmentPlan.diagnosis_id,
          data.treatmentPlan.plan_type,
          data.treatmentPlan.surgery_planned,
          data.treatmentPlan.radical_surgery,
          data.treatmentPlan.palliative_surgery,
          data.treatmentPlan.neoadjuvant_chemo,
          data.treatmentPlan.adjuvant_chemo,
          data.treatmentPlan.induction_chemo
        );
      }
    }

    return {
      success: true,
      patient_id: data.patient.id,
      registration_number: data.patient.registration_number,
      name: data.patient.full_name
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Import patients from Excel file
 *
 * @param {Buffer} fileBuffer - Excel file buffer
 * @param {Function} progressCallback - Callback for progress updates
 * @returns {Promise<Object>} Import result with stats
 */
export async function importPatientsFromExcel(fileBuffer, progressCallback = null) {
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  try {
    // Parse Excel file
    const rows = parseExcelFile(fileBuffer);
    const totalRows = rows.length;

    if (totalRows === 0) {
      throw new Error('Excel file is empty');
    }

    // Process each row
    for (let i = 0; i < totalRows; i++) {
      const row = rows[i];

      // Skip rows without patient name
      if (!row['Name & Sur Name']) {
        continue;
      }

      const result = await importPatient(row);

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        errors.push({
          row: i + 1,
          name: row['Name & Sur Name'],
          error: result.error
        });
      }

      // Report progress
      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: totalRows,
          successCount,
          errorCount,
          percent: Math.round(((i + 1) / totalRows) * 100)
        });
      }
    }

    const duration = Date.now() - startTime;

    // Log the import
    await createImportLog({
      filename: 'import.xlsx',
      totalRows,
      successCount,
      errorCount,
      duration: `${duration}ms`,
      status: 'completed'
    });

    return {
      success: true,
      stats: {
        total: totalRows,
        successCount,
        errorCount,
        duration: `${duration}ms`
      },
      errors: errors.slice(0, 10) // Return first 10 errors
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    await createImportLog({
      filename: 'import.xlsx',
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
      duration: `${duration}ms`,
      status: 'failed',
      error: error.message
    });

    throw error;
  }
}

export default {
  importPatientsFromExcel,
  parseExcelFile,
  mapExcelRowToDb
};
