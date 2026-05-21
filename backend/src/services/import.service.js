/**
 * Import Service - New Schema (PascalCase/Integer)
 *
 * Handles importing patient data from Excel format to the Patient table.
 * Simplified version for new denormalized schema.
 *
 * @module import.service
 */

import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { run, get } from '../db/query.js';
import { createImportLog } from '../utils/log-writer.js';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Parse Excel file to JSON
 */
function parseExcelFile(buffer) {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  return data;
}

/**
 * Parse date from Excel
 */
function parseDate(value) {
  if (!value) return null;
  if (typeof value === 'number') {
    // Excel date serial
    const date = new Date((value - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Normalize sex/gender value
 */
function normalizeSex(value) {
  if (!value) return null;
  const val = String(value).trim().toUpperCase();
  if (val === 'M' || val === 'MALE') return 'Male';
  if (val === 'F' || val === 'FEMALE') return 'Female';
  return val;
}

/**
 * Normalize blood group - returns lookup value
 */
function normalizeBloodGroup(value) {
  if (!value) return null;
  const val = String(value).trim().toUpperCase();
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (validGroups.includes(val)) return val;
  return null;
}

/**
 * Get lookup ID from lookup table by value
 */
async function getLookupId(tableName, valueField, value) {
  if (!value) return null;
  try {
    const result = await get(`SELECT ID FROM ${tableName} WHERE ${valueField} = ? LIMIT 1`, value);
    return result ? result.ID : null;
  } catch (error) {
    console.warn(`Lookup failed for ${tableName}.${valueField} = ${value}:`, error.message);
    return null;
  }
}

/**
 * Map Excel row to Patient table structure
 */
async function mapExcelRowToPatient(row) {
  // Get lookup IDs
  const bloodGroupId = await getLookupId('BloodGroups', 'BloodGroup', normalizeBloodGroup(row['Blood Group']));
  const hospitalId = await getLookupId('Hospitals', 'Hospitals', row['Hospital']);
  const occupationId = await getLookupId('Occupation', 'Occupation', row['Occupation']);
  const qualificationsId = await getLookupId('Qualifications', 'QLevel', row['Education']);
  const motherTongueId = await getLookupId('MotherTongue', 'MotherTongue', row['Language']);
  const districtId = await getLookupId('District', 'District', row['Territory']);

  const patient = {
    RegistrationNo: row['Reg No'] || `REG-${Date.now()}`,
    RegistrationDate: parseDate(row['Reg. Date']),
    PatientName: row['Name & Sur Name'] || '',
    Age: row['Age'] ? parseInt(row['Age']) || null : null,
    Gender: normalizeSex(row['Sex']),
    ContactNo: row['Contact No'] || '',
    CNICNo: row['CNIC NO'] || '',
    MaritalStatus: row['Marital Status'] || '',
    NoOfChidren: row['Children'] ? parseInt(row['Children']) || 0 : 0,
    NoOfSibling: row['Sibling'] ? parseInt(row['Sibling']) || 0 : 0,
    Height: row['Height'] ? parseFloat(row['Height']) || null : null,
    Weight: row['Weight'] ? parseFloat(row['Weight']) || null : null,
    BloodGroup: bloodGroupId,
    Educated: 0,
    Qualifications: qualificationsId,
    Occupation: occupationId,
    MotherTongue: motherTongueId,
    PlaceOfBirth: districtId,
    Hospital: hospitalId,
    DoctorName: row['Doctor Name'] || '',
    ExaminationDate: parseDate(row['Examination Date']),
    // Cancer type fields - map from Excel
    BrainTumor: row['Type of Cancer']?.toLowerCase().includes('brain') ? row['Type of Cancer'] : '',
    HeadAndNeck: row['Type of Cancer']?.toLowerCase().includes('head') || row['Type of Cancer']?.toLowerCase().includes('neck') ? row['Type of Cancer'] : '',
    BreastCancer: row['Type of Cancer']?.toLowerCase().includes('breast') ? row['Type of Cancer'] : '',
    Genitourinary: row['Type of Cancer']?.toLowerCase().includes('genito') ? row['Type of Cancer'] : '',
    Gyneacological: row['Type of Cancer']?.toLowerCase().includes('gyn') ? row['Type of Cancer'] : '',
    LungsCancer: row['Type of Cancer']?.toLowerCase().includes('lung') ? row['Type of Cancer'] : '',
    GITumor: row['Type of Cancer']?.toLowerCase().includes('gi') ? row['Type of Cancer'] : '',
    SkinTumor: row['Type of Cancer']?.toLowerCase().includes('skin') ? row['Type of Cancer'] : '',
    Hematological: row['Type of Cancer']?.toLowerCase().includes('hemato') ? row['Type of Cancer'] : '',
    Sarcoma: row['Type of Cancer']?.toLowerCase().includes('sarcoma') ? row['Type of Cancer'] : '',
    Carcinoma: row['Type of Cancer'] || '',
    // Staging
    Grade: row['Grade'] || '',
    TNM: row['T'] || '',
    NodesInvolved: row['N'] || '',
    Metastasis: row['M'] || '',
    // Treatments
    SurgicalProcedure: row['Surgery'] || '',
    SurgicalDate: parseDate(row['Surgery Date']),
    ChemoRegimen: row['Chemotherapy'] || '',
    Cycles: row['Cycles'] || '',
    RadioTherapy: row['Radiotherapy'] || '',
    Dose: row['Rad'] || '',
    // Previous treatments
    PreviousTreatment: row['Previous Chemo'] || row['Previous RT'] ? 'Yes' : '',
    TreatedBefore: (row['Previous Chemo'] || row['Previous RT']) ? 1 : 0,
    // History
    PresentAddress: row['History'] || '',
    MedicalTreatmentSpecify: row['DM - HTN/IHD - HCV/HBV - Others'] || '',
    // Outcome
    OutComeOfTreatment: row['Outcome'] || '',
    FollowUp: (row['Follow Up'] === 'Y' || row['Follow Up'] === 'Yes') ? 1 : 0
  };

  return patient;
}

/**
 * Create addictions records from Excel row
 */
async function createAddictionsForPatient(patientId, row) {
  const addictions = [];

  // Map habit columns to addiction types
  const habitMappings = [
    { column: 'Smoking', name: 'Smoking', quantity: 'Quantity' },
    { column: 'Pan', name: 'Pan', quantity: 'Quantity2' },
    { column: 'Gutka', name: 'Gutka', quantity: 'Quantity3' },
    { column: 'Naswar', name: 'Naswar', quantity: 'Quantity4' },
    { column: 'Alcohol', name: 'Alcohol', quantity: 'Quantity5' }
  ];

  for (const habit of habitMappings) {
    const value = row[habit.column];
    if (value && value !== 'Never' && value !== 'N' && value !== 'No') {
      const addictionId = await getLookupId('Addictions', 'Addiction', habit.name);
      if (addictionId) {
        await run(
          `INSERT INTO PatientAddictions (PatientID, AddictionID) VALUES (?, ?)`,
          patientId, addictionId
        );
        addictions.push(habit.name);
      }
    }
  }

  // Others habit
  if (row['Others'] && row['Others'].trim()) {
    const addictionId = await getLookupId('Addictions', 'Addiction', 'Other');
    if (addictionId) {
      await run(
        `INSERT INTO PatientAddictions (PatientID, AddictionID) VALUES (?, ?)`,
        patientId, addictionId
      );
      addictions.push('Other');
    }
  }

  return addictions;
}

/**
 * Create family history record from Excel row
 */
async function createFamilyHistoryForPatient(patientId, row) {
  const familyHistory = row['Family History of Cancer'];
  if (!familyHistory || !familyHistory.trim()) return null;

  // Try to find matching disease and relation
  const diseaseId = await getLookupId('Diseases', 'Diseases', familyHistory);
  if (diseaseId) {
    await run(
      `INSERT INTO FamilyHistory (PatientID, Diseas, Relation) VALUES (?, ?, NULL)`,
      patientId, diseaseId
    );
    return familyHistory;
  }

  return null;
}

/**
 * Import patients from Excel buffer
 */
export async function importPatientsFromExcel(buffer, userId = null) {
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  try {
    const rows = parseExcelFile(buffer);
    createImportLog(`Processing ${rows.length} rows from Excel file`, userId);

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];

        // Check if patient already exists by registration number
        const regNo = row['Reg No'];
        if (regNo) {
          const existing = await get('SELECT PatientID FROM Patient WHERE RegistrationNo = ?', regNo);
          if (existing) {
            createImportLog(`Skipped row ${i + 1}: Patient with Reg No ${regNo} already exists`, userId);
            continue;
          }
        }

        // Map and create patient
        const patient = await mapExcelRowToPatient(row);

        // Build insert query dynamically
        const fields = [];
        const placeholders = [];
        const values = [];

        for (const [key, value] of Object.entries(patient)) {
          if (value !== null && value !== undefined && value !== '') {
            fields.push(key);
            placeholders.push('?');
            values.push(value);
          }
        }

        if (fields.length === 0) {
          errors.push(`Row ${i + 1}: No valid fields to insert`);
          errorCount++;
          continue;
        }

        const query = `INSERT INTO Patient (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
        const result = await run(query, ...values);
        const patientId = result.lastInsertRowid;

        // Create related records
        await createAddictionsForPatient(patientId, row);
        await createFamilyHistoryForPatient(patientId, row);

        successCount++;
        createImportLog(`Imported patient ${patientId}: ${patient.PatientName}`, userId);

      } catch (error) {
        errorCount++;
        const errorMsg = `Row ${i + 1}: ${error.message}`;
        errors.push(errorMsg);
        createImportLog(errorMsg, userId);
        console.error(errorMsg);
      }
    }

    const duration = Date.now() - startTime;
    const stats = {
      totalCount: rows.length,
      successCount: successCount,
      errorCount: errorCount,
      duration
    };

    createImportLog(`Import complete: ${successCount} succeeded, ${errorCount} failed in ${duration}ms`, userId);
    return { stats, errors };

  } catch (error) {
    createImportLog(`Import failed: ${error.message}`, userId);
    throw error;
  }
}

/**
 * Get import status
 */
export async function getImportStatus() {
  try {
    const totalPatients = await get('SELECT COUNT(*) as count FROM Patient');
    const recentImports = await get(`
      SELECT COUNT(*) as count
      FROM Patient
      WHERE datetime(RegistrationDate) > datetime('now', '-1 hour')
    `);

    return {
      totalPatients: totalPatients.count,
      recentImports: recentImports.count,
      lastImport: await get('SELECT RegistrationDate FROM Patient ORDER BY RegistrationDate DESC LIMIT 1')
    };
  } catch (error) {
    return {
      totalPatients: 0,
      recentImports: 0,
      lastImport: null,
      error: error.message
    };
  }
}

export default {
  importPatientsFromExcel,
  getImportStatus
};
