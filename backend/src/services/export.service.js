/**
 * Export Service - New Schema (PascalCase/Integer)
 *
 * Handles exporting patient data from Patient table to Excel format.
 *
 * @module export.service
 */

import { all, get } from '../db/query.js';
import { DB_TO_EXCEL_MAPPING } from '../utils/excel.mapper.js';
import { createExportLog } from '../utils/log-writer.js';
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Fetch all patients from Patient view (with lookup names resolved)
 */
async function fetchAllPatientsForExport() {
  const patients = await all(`
    SELECT
      p.*,
      bg.BloodGroup AS BloodGroupName,
      h.Hospitals AS HospitalName,
      q.QLevel AS QualificationName,
      o.Occupation AS OccupationName,
      d.District AS PlaceOfBirthName
    FROM vw_patient_detail p
    LEFT JOIN BloodGroups bg ON p.BloodGroup = bg.ID
    LEFT JOIN Hospitals h ON p.Hospital = h.ID
    LEFT JOIN Qualifications q ON p.Qualifications = q.ID
    LEFT JOIN Occupation o ON p.Occupation = o.ID
    LEFT JOIN District d ON p.PlaceOfBirth = d.ID
    ORDER BY p.RegistrationDate DESC
  `);

  return patients;
}

/**
 * Map patient database row to Excel format
 */
function mapPatientToExcelRow(patient) {
  return {
    'Reg No': patient.RegistrationNo || '',
    'Reg. Date': formatExcelDate(patient.RegistrationDate),
    'Name & Sur Name': patient.PatientName || '',
    'Age': patient.Age || '',
    'Sex': formatGenderForExcel(patient.Gender),
    'Marital Status': patient.MaritalStatus || '',
    'Children': patient.NoOfChidren || 0,
    'Sibling': patient.NoOfSibling || 0,
    'Language': patient.MotherTongueName || '',
    'Territory': patient.PlaceOfBirthName || '',
    'Contact No': patient.ContactNo || '',
    'CNIC NO': patient.CNICNo || '',
    'Education': patient.QualificationName || '',
    'Height': patient.Height || '',
    'Weight': patient.Weight || '',
    'Blood Group': patient.BloodGroupName || '',
    'Doctor Name': patient.DoctorName || '',
    'Examination Date': formatExcelDate(patient.ExaminationDate),
    'Type of Cancer': determineCancerType(patient),
    'Stage': patient.StatingTest || '',
    'Grade': patient.Grade || '',
    'T': patient.TNM || '',
    'N': patient.NodesInvolved || '',
    'M': patient.Metastasis || '',
    'Surgery': patient.SurgicalProcedure || '',
    'Surgery Date': formatExcelDate(patient.SurgicalDate),
    'Chemotherapy': patient.ChemoRegimen || '',
    'Cycles': patient.Cycles || '',
    'Radiotherapy': patient.Dose || '',
    'Previous Chemo': patient.PreviousTreatment || '',
    'Outcome': patient.OutComeOfTreatment || '',
    'Follow Up': patient.FollowUp ? 'Y' : 'N',
    'Hospital': patient.HospitalName || ''
  };
}

/**
 * Format gender for Excel output
 */
function formatGenderForExcel(gender) {
  if (!gender) return '';
  if (gender === 'Male') return 'M';
  if (gender === 'Female') return 'F';
  return gender;
}

/**
 * Format date for Excel
 */
function formatExcelDate(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

/**
 * Determine cancer type from patient flags
 */
function determineCancerType(patient) {
  if (patient.BrainTumor) return 'Brain Tumor';
  if (patient.HeadAndNeck) return 'Head & Neck Cancer';
  if (patient.BreastCancer) return 'Breast Cancer';
  if (patient.Genitourinary) return 'Genitourinary';
  if (patient.Gyneacological) return 'Gynecological';
  if (patient.LungsCancer) return 'Lung Cancer';
  if (patient.GITumor) return 'GI Tumor';
  if (patient.SkinTumor) return 'Skin Cancer';
  if (patient.Hematological) return 'Hematological';
  if (patient.Sarcoma) return 'Sarcoma';
  if (patient.Carcinoma) return patient.Carcinoma;
  return '';
}

/**
 * Export all patients to Excel
 */
export async function exportPatientsToExcel(userId = null) {
  const startTime = Date.now();

  try {
    createExportLog('Starting patient export', userId);

    const patients = await fetchAllPatientsForExport();

    if (patients.length === 0) {
      createExportLog('No patients to export', userId);
      throw new Error('No patients found to export');
    }

    // Map patients to Excel rows
    const excelRows = patients.map(mapPatientToExcelRow);

    // Create workbook
    const worksheet = xlsx.utils.json_to_sheet(excelRows);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Reg No
      { wch: 12 }, // Reg Date
      { wch: 25 }, // Name
      { wch: 6 },  // Age
      { wch: 6 },  // Sex
      { wch: 12 }, // Marital Status
      { wch: 8 },  // Children
      { wch: 8 },  // Sibling
      { wch: 15 }, // Language
      { wch: 15 }, // Territory
      { wch: 15 }, // Contact No
      { wch: 15 }, // CNIC
      { wch: 15 }, // Education
      { wch: 8 },  // Height
      { wch: 8 },  // Weight
      { wch: 12 }, // Blood Group
      { wch: 20 }, // Doctor
      { wch: 12 }, // Exam Date
      { wch: 20 }, // Cancer Type
      { wch: 12 }, // Stage
      { wch: 10 }, // Grade
      { wch: 8 },  // T
      { wch: 8 },  // N
      { wch: 8 },  // M
      { wch: 20 }, // Surgery
      { wch: 12 }, // Surgery Date
      { wch: 20 }, // Chemo
      { wch: 10 }, // Cycles
      { wch: 15 }, // Radiotherapy
      { wch: 15 }, // Previous Chemo
      { wch: 15 }, // Outcome
      { wch: 8 },  // Follow Up
      { wch: 20 }  // Hospital
    ];
    worksheet['!cols'] = colWidths;

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Patients');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `ehr-export-${timestamp}.xlsx`;

    // Write workbook to buffer instead of file
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const duration = Date.now() - startTime;
    createExportLog(`Exported ${patients.length} patients to ${filename} in ${duration}ms`, userId);

    return {
      filename,
      buffer,
      count: patients.length,
      duration
    };

  } catch (error) {
    createExportLog(`Export failed: ${error.message}`, userId);
    throw error;
  }
}

/**
 * Get export status
 */
export async function getExportStatus() {
  try {
    const totalPatients = await get('SELECT COUNT(*) as count FROM Patient');
    const todayCount = await get(`
      SELECT COUNT(*) as count
      FROM Patient
      WHERE date(RegistrationDate) = date('now')
    `);

    return {
      totalPatients: totalPatients.count,
      todayRegistrations: todayCount.count,
      format: 'xlsx',
      columns: 31, // Number of columns in export
      description: 'Excel export with all patient demographics'
    };
  } catch (error) {
    return {
      totalPatients: 0,
      todayRegistrations: 0,
      format: 'xlsx',
      columns: 31,
      description: 'Excel export with all patient demographics',
      error: error.message
    };
  }
}

export default {
  exportPatientsToExcel,
  getExportStatus
};
