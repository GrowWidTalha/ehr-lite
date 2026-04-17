#!/usr/bin/env node

/**
 * Excel Patient Data Import Script
 *
 * Imports patient data from Onco-format Excel files (82 columns)
 * into normalized database schema.
 *
 * Usage: node scripts/import-excel.js <path-to-excel-file>
 *
 * Features:
 * - Validates required columns (Name & Sur Name, Age, Sex)
 * - Maps 82 Excel columns to normalized database tables
 * - Interactive prompts for validation errors
 * - Progress indicator during import
 * - Append-only mode (no updates/overwrites)
 * - Creates import log at /data/logs/import-YYYY-MM-DD.json
 */

import xlsx from 'xlsx';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import { getConnection, saveDatabase, run, get, all } from '../src/db/connection.js';
import { EXCEL_COLUMN_MAPPING, getRequiredColumns, validateValue, getAllExcelColumns } from '../src/utils/excel.mapper.js';
import { createImportLog } from '../src/utils/log-writer.js';
import { generateId } from '../src/utils/uuid.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate Excel file structure
 * @param {Object} workbook - XLSX workbook object
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateFileStructure(workbook) {
  const errors = [];

  // Check if workbook has sheets
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    return { valid: false, errors: ['Excel file contains no sheets'] };
  }

  // Get first sheet
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  // Check if sheet has data
  if (!sheet || !sheet['!ref']) {
    return { valid: false, errors: ['First sheet is empty'] };
  }

  // Get header row (first row)
  const range = xlsx.utils.decode_range(sheet['!ref']);
  const headers = [];
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = xlsx.utils.encode_cell({ r: range.s.r, c: col });
    const cell = sheet[cellAddress];
    headers.push(cell ? cell.v : '');
  }

  // Check for required columns
  const requiredColumns = getRequiredColumns();
  const missingColumns = requiredColumns
    .filter(col => !headers.includes(col.columnName))
    .map(col => col.columnName);

  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    headers
  };
}

/**
 * Validate a single row of data
 * @param {Object} row - Row data (column name -> value)
 * @param {number} rowNum - Row number (for error reporting)
 * @returns {Object} { valid: boolean, errors: Array<{column, row, error}> }
 */
function validateRow(row, rowNum) {
  const errors = [];

  for (const [columnName, mapping] of Object.entries(EXCEL_COLUMN_MAPPING)) {
    const value = row[columnName];

    // Check required fields
    if (mapping.required && (value === null || value === undefined || value === '')) {
      errors.push({
        column: columnName,
        row: rowNum,
        error: `Required field is empty`
      });
      continue;
    }

    // Skip validation for empty optional fields
    if (value === null || value === undefined || value === '') {
      continue;
    }

    // Validate value against mapping rules
    const validation = validateValue(value, mapping);
    if (!validation.valid) {
      errors.push({
        column: columnName,
        row: rowNum,
        error: validation.error
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================================================
// CONSOLE PROMPTS
// ============================================================================

/**
 * Create readline interface for interactive prompts
 */
function createReadline() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask user a yes/no question
 * @param {string} question - Question to ask
 * @returns {Promise<boolean>} User's answer
 */
function askYesNo(question) {
  return new Promise((resolve) => {
    const rl = createReadline();
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Ask user to choose from options
 * @param {string} question - Question to ask
 * @param {string[]} options - Available options
 * @returns {Promise<number>} Selected option index
 */
function askChoice(question, options) {
  return new Promise((resolve) => {
    const rl = createReadline();
    console.log(question);
    options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`));
    rl.question(`Enter choice (1-${options.length}): `, (answer) => {
      rl.close();
      const choice = parseInt(answer, 10);
      if (choice >= 1 && choice <= options.length) {
        resolve(choice - 1);
      } else {
        resolve(0); // Default to first option
      }
    });
  });
}

// ============================================================================
// EXCEL TO DATABASE MAPPING
// ============================================================================

/**
 * Parse boolean value from Excel
 * @param {*} value - Value to parse
 * @param {Object} mapping - Column mapping with truthy/falsy values
 * @returns {boolean|null} Parsed boolean or null
 */
function parseBoolean(value, mapping) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const strValue = String(value).trim();
  if (mapping.truthyValues && mapping.truthyValues.includes(strValue)) {
    return 1; // SQLite uses 1/0 for boolean
  }
  if (mapping.falsyValues && mapping.falsyValues.includes(strValue)) {
    return 0;
  }
  return null;
}

/**
 * Convert Excel row to patient data object
 * @param {Object} row - Excel row data
 * @returns {Object} Patient and related data
 */
function mapRowToPatientData(row) {
  const data = {
    patient: {},
    vitals: {},
    history: {},
    habits: {},
    diagnosis: null,
    previousTreatments: [],
    pathology: {},
    biomarker: {},
    imaging: [],
    treatmentPlan: {}
  };

  // Process each column mapping
  for (const [columnName, mapping] of Object.entries(EXCEL_COLUMN_MAPPING)) {
    const value = row[columnName];

    // Skip empty values
    if (value === null || value === undefined || value === '') {
      continue;
    }

    switch (mapping.table) {
      case 'patients':
        data.patient[mapping.field] = value;
        break;

      case 'patient_vitals':
        data.vitals[mapping.field] = value;
        break;

      case 'patient_history':
        data.history[mapping.field] = value;
        break;

      case 'patient_habits':
        if (mapping.type === 'constant') {
          // This is a habit type flag (e.g., "Smoking" column)
          const habitType = mapping.constant;
          const status = value ? 'Current' : 'Never';
          data.habits[`${habitType}_status`] = status;
        } else if (mapping.habitType) {
          // This is a duration field (e.g., "Quantity" for smoking)
          data.habits[`${mapping.habitType}_quantity`] = String(value);
        } else {
          data.habits[mapping.field] = value;
        }
        break;

      case 'cancer_diagnoses':
        if (!data.diagnosis) data.diagnosis = {};
        data.diagnosis[mapping.field] = value;
        break;

      case 'previous_treatments':
        if (mapping.type === 'constant') {
          // This indicates a previous treatment was received
          data.previousTreatments.push({
            treatment_type: mapping.constant,
            received: !!value
          });
        } else {
          // Treatment details
          if (mapping.field === 'surgery_details') {
            data.previousTreatments.push({
              treatment_type: 'surgery',
              details: value,
              field: 'previous_surgery'
            });
          } else if (mapping.field === 'second_surgery_details') {
            data.previousTreatments.push({
              treatment_type: 'surgery',
              details: value,
              field: 'second_surgery'
            });
          }
        }
        break;

      case 'pathology_reports':
        data.pathology[mapping.field] = value;
        break;

      case 'biomarker_tests':
        data.biomarker[mapping.field] = value;
        break;

      case 'imaging_studies':
        if (mapping.type === 'constant') {
          // This is an imaging type flag
          data.imaging.push({
            imaging_type: mapping.constant,
            performed: !!value
          });
        }
        break;

      case 'treatment_plans':
        if (mapping.type === 'boolean') {
          data.treatmentPlan[mapping.field] = parseBoolean(value, mapping);
        } else {
          data.treatmentPlan[mapping.field] = value;
        }
        break;
    }
  }

  return data;
}

/**
 * Create patient with all related records
 * @param {Object} data - Mapped patient data
 * @param {string} patientId - Generated patient ID
 * @returns {Promise<Object>} Created patient
 */
async function createPatientWithRecords(data, patientId) {
  const now = new Date().toISOString();

  // Normalize contact number field (Excel uses "Contact No", DB uses "phone")
  if (data.patient.contact_number && !data.patient.phone) {
    data.patient.phone = data.patient.contact_number;
  }

  // Normalize CNIC field (Excel uses "CNIC NO", DB uses "cnic")
  if (data.patient.cnic_number && !data.patient.cnic) {
    data.patient.cnic = data.patient.cnic_number;
  }

  // 1. Create patient record
  await run(`
    INSERT INTO patients (
      id, registration_number, registration_date,
      full_name, age, sex, phone, cnic,
      marital_status, education, language, territory,
      children_count, sibling_count,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    patientId,
    data.patient.registration_number || null,
    data.patient.registration_date || null,
    data.patient.full_name,
    data.patient.age || null,
    data.patient.sex || null,
    data.patient.phone || null,
    data.patient.cnic || null,
    data.patient.marital_status || null,
    data.patient.education || null,
    data.patient.language || null,
    data.patient.territory || null,
    data.patient.children_count || 0,
    data.patient.sibling_count || 0,
    now,
    now
  );

  // 2. Create vitals record if any vitals data exists
  if (Object.keys(data.vitals).length > 0) {
    const vitalsId = generateId();
    await run(`
      INSERT INTO patient_vitals (id, patient_id, height_cm, weight_kg, blood_group, recorded_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, vitalsId, patientId,
      data.vitals.height_cm || null,
      data.vitals.weight_kg || null,
      data.vitals.blood_group || null,
      now
    );
  }

  // 3. Create history record if any history data exists
  if (Object.keys(data.history).length > 0) {
    const historyId = generateId();
    // Map Excel fields to DB fields
    const medicalHistory = data.history.medical_history || data.history.presenting_complaint;

    await run(`
      INSERT INTO patient_history (id, patient_id, presenting_complaint, comorbidities, family_cancer_history, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, historyId, patientId,
      medicalHistory || null,
      data.history.comorbidities || null,
      data.history.family_cancer_history || null,
      now,
      now
    );
  }

  // 4. Create habits record if any habits data exists
  if (Object.keys(data.habits).length > 0) {
    const habitsId = generateId();
    const habitFields = ['smoking_status', 'smoking_quantity', 'pan_use', 'pan_quantity',
      'gutka_use', 'gutka_quantity', 'naswar_use', 'naswar_quantity',
      'alcohol_use', 'alcohol_quantity', 'other_habits', 'quit_period'];
    const values = [habitsId, patientId];
    const placeholders = ['id', 'patient_id'];

    for (const field of habitFields) {
      if (data.habits[field] !== undefined) {
        placeholders.push(field);
        values.push(data.habits[field]);
      }
    }

    values.push(now, now);
    placeholders.push('created_at', 'updated_at');

    await run(`
      INSERT INTO patient_habits (${placeholders.join(', ')})
      VALUES (${placeholders.map(() => '?').join(', ')})
    `, ...values);
  }

  // 5. Create diagnosis and related records if diagnosis data exists
  let diagnosisId = null;
  if (data.diagnosis && Object.keys(data.diagnosis).length > 0) {
    diagnosisId = generateId();

    await run(`
      INSERT INTO cancer_diagnoses (id, patient_id, cancer_type, stage, grade, who_classification, diagnosis_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, diagnosisId, patientId,
      data.diagnosis.cancer_type || null,
      data.diagnosis.stage || null,
      data.diagnosis.grade || null,
      data.diagnosis.who_classification || null,
      now, // Use current date for diagnosis_date if not specified
      now,
      now
    );

    // 5a. Create previous treatments records
    for (const treatment of data.previousTreatments) {
      if (treatment.received || treatment.details) {
        const treatmentId = generateId();
        if (treatment.field === 'previous_surgery' && treatment.details) {
          await run(`
            INSERT INTO previous_treatments (id, diagnosis_id, previous_surgery, previous_chemo, created_at)
            VALUES (?, ?, ?, 'No', ?)
          `, treatmentId, diagnosisId, treatment.details, now);
        } else if (treatment.field === 'second_surgery' && treatment.details) {
          await run(`
            INSERT INTO previous_treatments (id, diagnosis_id, second_surgery, created_at)
            VALUES (?, ?, ?, ?)
          `, treatmentId, diagnosisId, treatment.details, now);
        } else if (treatment.treatment_type === 'chemotherapy' && treatment.received) {
          await run(`
            INSERT INTO previous_treatments (id, diagnosis_id, previous_chemo, created_at)
            VALUES (?, ?, 'Yes', ?)
          `, treatmentId, diagnosisId, now);
        } else if (treatment.treatment_type === 'radiation_therapy' && treatment.received) {
          await run(`
            INSERT INTO previous_treatments (id, diagnosis_id, previous_radiotherapy, created_at)
            VALUES (?, ?, 'Yes', ?)
          `, treatmentId, diagnosisId, now);
        } else if (treatment.treatment_type === 'targeted_therapy' && treatment.received) {
          await run(`
            INSERT INTO previous_treatments (id, diagnosis_id, previous_targeted_therapy, created_at)
            VALUES (?, ?, 'Yes', ?)
          `, treatmentId, diagnosisId, now);
        } else if (treatment.treatment_type === 'hormonal_therapy' && treatment.received) {
          await run(`
            INSERT INTO previous_treatments (id, diagnosis_id, previous_hormonal, created_at)
            VALUES (?, ?, 'Yes', ?)
          `, treatmentId, diagnosisId, now);
        } else if (treatment.treatment_type === 'immunotherapy' && treatment.received) {
          await run(`
            INSERT INTO previous_treatments (id, diagnosis_id, previous_immunotherapy, created_at)
            VALUES (?, ?, 'Yes', ?)
          `, treatmentId, diagnosisId, now);
        } else if (treatment.treatment_type === 'other_surgery' && treatment.received) {
          await run(`
            INSERT INTO previous_treatments (id, diagnosis_id, non_cancer_surgery, created_at)
            VALUES (?, ?, 'Yes', ?)
          `, treatmentId, diagnosisId, now);
        }
      }
    }

    // 5b. Create pathology report if any pathology data exists
    if (Object.keys(data.pathology).length > 0) {
      const pathologyId = generateId();
      const pathologyFields = ['pathological_stage', 'tumor_size', 'depth', 'margins',
        'lymphovascular_invasion', 'perineural_invasion', 'nodes_recovered', 'nodes_involved',
        'extranodal_extension', 'surgery_adequacy', 'recurrence'];

      await run(`
        INSERT INTO pathology_reports (
          id, diagnosis_id, report_type, pathological_stage, tumor_size, depth, margins,
          lvi, pni, nodes_recovered, nodes_involved, extra_nodal_extension,
          surgery_adequacy, recurrence, created_at
        ) VALUES (?, ?, 'pathology', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, pathologyId, diagnosisId,
        data.pathology.pathological_stage || null,
        data.pathology.tumor_size || null,
        data.pathology.depth || null,
        data.pathology.margins || null,
        data.pathology.lymphovascular_invasion || data.pathology.lvi || null,
        data.pathology.perineural_invasion || data.pathology.pni || null,
        data.pathology.nodes_recovered || null,
        data.pathology.nodes_involved || null,
        data.pathology.extranodal_extension || null,
        data.pathology.surgery_adequacy || null,
        data.pathology.recurrence || null,
        now
      );
    }

    // 5c. Create biomarker test if any biomarker data exists
    if (Object.keys(data.biomarker).length > 0) {
      const biomarkerId = generateId();

      await run(`
        INSERT INTO biomarker_tests (
          id, diagnosis_id, test_type, er_status, pr_status, her2_status,
          ki67_percentage, mitosis_count, ihc_markers, created_at
        ) VALUES (?, ?, 'IHC', ?, ?, ?, ?, ?, ?, ?)
      `, biomarkerId, diagnosisId,
        data.biomarker.er_status || null,
        data.biomarker.pr_status || null,
        data.biomarker.her2_status || null,
        data.biomarker.ki67_percentage || null,
        data.biomarker.mitosis_count || null,
        data.biomarker.other_markers || data.biomarker.ihc_markers || null,
        now
      );
    }

    // 5d. Create imaging studies for each performed imaging
    for (const imaging of data.imaging) {
      if (imaging.performed) {
        const imagingId = generateId();
        await run(`
          INSERT INTO imaging_studies (id, diagnosis_id, study_type, study_date, created_at)
          VALUES (?, ?, ?, ?, ?)
        `, imagingId, diagnosisId, imaging.imaging_type, now, now);
      }
    }

    // 5e. Create treatment plan if any treatment plan data exists
    if (Object.keys(data.treatmentPlan).length > 0) {
      const planId = generateId();

      await run(`
        INSERT INTO treatment_plans (
          id, diagnosis_id, plan_type, surgery_planned, radical_surgery, palliative_surgery,
          neoadjuvant_chemo, adjuvant_chemo, induction_chemo,
          chemotherapy_regimen, hormonal_therapy, targeted_therapy,
          radiation_therapy, brachytherapy, immunotherapy,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, planId, diagnosisId,
        data.treatmentPlan.treatment_plan || data.treatmentPlan.plan_type || null,
        data.treatmentPlan.surgery_planned ?? 0,
        data.treatmentPlan.radical_surgery ?? 0,
        data.treatmentPlan.palliative_care ?? data.treatmentPlan.palliative_surgery ?? 0,
        data.treatmentPlan.neoadjuvant_therapy ?? data.treatmentPlan.neoadjuvant_chemo ?? 0,
        data.treatmentPlan.adjuvant_therapy ?? data.treatmentPlan.adjuvant_chemo ?? 0,
        data.treatmentPlan.induction_chemotherapy ?? data.treatmentPlan.induction_chemo ?? 0,
        data.treatmentPlan.chemotherapy_regimen || data.treatmentPlan.chemotherapy || null,
        data.treatmentPlan.hormonal_therapy || null,
        data.treatmentPlan.targeted_therapy || null,
        data.treatmentPlan.radiation_therapy || data.treatmentPlan.radiotherapy || null,
        data.treatmentPlan.brachytherapy || null,
        data.treatmentPlan.immunotherapy || data.treatmentPlan.immunotherapy || data.treatmentPlan.immunotheray || null,
        now,
        now
      );
    }
  }

  // Return created patient
  return await get(`SELECT * FROM patients WHERE id = ?`, patientId);
}

// ============================================================================
// PROGRESS DISPLAY
// ============================================================================

/**
 * Display progress bar
 * @param {number} current - Current progress
 * @param {number} total - Total items
 * @param {string} label - Progress label
 */
function showProgress(current, total, label = 'Processing') {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filled = Math.round((current / total) * barLength);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  process.stdout.write(`\r${label}: [${bar}] ${percentage}% (${current}/${total})`);

  if (current === total) {
    process.stdout.write('\n');
  }
}

// ============================================================================
// MAIN IMPORT FUNCTION
// ============================================================================

/**
 * Main import function
 * @param {string} filePath - Path to Excel file
 * @returns {Promise<Object>} Import result
 */
async function importExcel(filePath) {
  const startTime = Date.now();

  console.log('\n' + '='.repeat(60));
  console.log('Excel Patient Data Import');
  console.log('='.repeat(60));
  console.log(`File: ${filePath}\n`);

  // 1. Read Excel file
  console.log('Step 1: Reading Excel file...');
  let workbook;
  try {
    workbook = xlsx.readFile(filePath);
  } catch (error) {
    throw new Error(`Failed to read Excel file: ${error.message}`);
  }

  // 2. Validate file structure
  console.log('Step 2: Validating file structure...');
  const structureValidation = validateFileStructure(workbook);
  if (!structureValidation.valid) {
    console.error('\n❌ File structure validation failed:');
    structureValidation.errors.forEach(err => console.error(`  - ${err}`));
    throw new Error('Invalid file structure');
  }
  console.log('✓ File structure valid');
  console.log(`  Found columns: ${structureValidation.headers.length}`);

  // 3. Parse rows
  console.log('\nStep 3: Parsing data rows...');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });
  console.log(`✓ Found ${rows.length} data rows`);

  if (rows.length === 0) {
    throw new Error('No data rows found in Excel file');
  }

  // 4. Validate rows
  console.log('\nStep 4: Validating data rows...');
  const validationErrors = [];
  const validRows = [];

  for (let i = 0; i < rows.length; i++) {
    showProgress(i + 1, rows.length, 'Validating');
    const validation = validateRow(rows[i], i + 2); // +2 for header + 1-indexed

    if (validation.valid) {
      validRows.push({ row: rows[i], index: i });
    } else {
      validationErrors.push(...validation.errors);
    }
  }

  console.log(`\n✓ Validation complete: ${validRows.length} valid, ${validationErrors.length} errors`);

  // 5. Handle validation errors
  if (validationErrors.length > 0) {
    console.log(`\n⚠️  Found ${validationErrors.length} validation errors:`);
    console.log('\nFirst 10 errors:');
    validationErrors.slice(0, 10).forEach(err => {
      console.log(`  Row ${err.row}, Column "${err.column}": ${err.error}`);
    });

    if (validationErrors.length > 10) {
      console.log(`  ... and ${validationErrors.length - 10} more errors`);
    }

    console.log('\nOptions:');
    const choice = await askChoice(
      'How would you like to proceed?',
      [
        'Import only valid rows',
        'Cancel import',
        'View all errors'
      ]
    );

    if (choice === 1) {
      console.log('\n❌ Import cancelled by user');
      return {
        success: false,
        imported: 0,
        failed: 0,
        errors: validationErrors,
        cancelled: true
      };
    }

    if (choice === 2) {
      console.log('\nAll validation errors:');
      validationErrors.forEach(err => {
        console.log(`  Row ${err.row}, Column "${err.column}": ${err.error}`);
      });
      const proceed = await askYesNo('\nProceed with importing only valid rows?');
      if (!proceed) {
        console.log('\n❌ Import cancelled by user');
        return {
          success: false,
          imported: 0,
          failed: 0,
          errors: validationErrors,
          cancelled: true
        };
      }
    }
  }

  if (validRows.length === 0) {
    throw new Error('No valid rows to import');
  }

  // 6. Confirm import
  console.log(`\nStep 5: Ready to import ${validRows.length} patients`);
  const confirmed = await askYesNo('Proceed with import?');
  if (!confirmed) {
    console.log('\n❌ Import cancelled by user');
    return {
      success: false,
      imported: 0,
      failed: 0,
      cancelled: true
    };
  }

  // 7. Import rows
  console.log('\nStep 6: Importing patients...');
  await getConnection(); // Initialize database connection

  const results = {
    imported: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < validRows.length; i++) {
    showProgress(i + 1, validRows.length, 'Importing');

    const { row, index } = validRows[i];
    const patientId = generateId();

    try {
      const data = mapRowToPatientData(row);
      await createPatientWithRecords(data, patientId);
      results.imported++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        row: index + 2,
        error: error.message
      });
    }
  }

  console.log(`\n✓ Import complete: ${results.imported} imported, ${results.failed} failed`);

  // 8. Save database
  console.log('\nStep 7: Saving database...');
  saveDatabase();
  console.log('✓ Database saved');

  // 9. Create import log
  const duration = Date.now() - startTime;
  console.log('\nStep 8: Creating import log...');

  await createImportLog({
    file_path: filePath,
    total_rows: rows.length,
    valid_rows: validRows.length,
    imported: results.imported,
    failed: results.failed,
    validation_errors: validationErrors.length,
    import_errors: results.errors.length,
    duration_ms: duration,
    status: results.failed === 0 ? 'success' : 'partial_success'
  });

  console.log('✓ Import log created');

  // 10. Summary
  console.log('\n' + '='.repeat(60));
  console.log('Import Summary');
  console.log('='.repeat(60));
  console.log(`File: ${path.basename(filePath)}`);
  console.log(`Total rows: ${rows.length}`);
  console.log(`Valid rows: ${validRows.length}`);
  console.log(`Imported: ${results.imported}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log('='.repeat(60) + '\n');

  return {
    success: true,
    ...results,
    total_rows: rows.length,
    valid_rows: validRows.length,
    duration
  };
}

// ============================================================================
// SCRIPT ENTRY POINT
// ============================================================================

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node scripts/import-excel.js <path-to-excel-file>');
    process.exit(1);
  }

  // Resolve file path
  const resolvedPath = path.resolve(process.cwd(), filePath);

  if (require('fs').existsSync(resolvedPath)) {
    try {
      const result = await importExcel(resolvedPath);
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error(`\n❌ Import failed: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.error(`Error: File not found: ${resolvedPath}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

export { importExcel, validateFileStructure, validateRow, mapRowToPatientData };
