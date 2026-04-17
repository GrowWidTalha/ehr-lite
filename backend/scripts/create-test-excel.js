#!/usr/bin/env node

/**
 * Create Test Excel File
 * Generates a sample Onco-format Excel file for testing the import script
 */

import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllExcelColumns } from '../src/utils/excel.mapper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Sample patient data with all 82 columns
const samplePatients = [
  {
    // Demographics (13 columns)
    'Reg No': 'REG-2026-001',
    'Reg. Date': '2026-01-15',
    'Name & Sur Name': 'Ahmed Khan',
    'Age': 45,
    'Sex': 'M',
    'Marital Status': 'M',
    'Children': 2,
    'Sibling': 3,
    'Language': 'Urdu',
    'Territory': 'Punjab',
    'Contact No': '+92-300-1234567',
    'CNIC NO': '12345-6789012-3',
    'Education': 'Graduate',

    // Vitals (3 columns)
    'Height': 170,
    'Weight': 75,
    'Blood Group': 'B+',

    // History (3 columns)
    'History': 'Patient presented with complaints of persistent cough',
    'DM - HTN/IHD - HCV/HBV - Others': 'Diabetes Mellitus Type 2',
    'Family History of Cancer': 'Father - Lung Cancer',

    // Habits (12 columns)
    'Smoking': 'Yes',
    'Quantity': '20 cigarettes/day for 15 years',
    'Pan': 'No',
    'Quantity2': '',
    'Gutka': 'No',
    'Quantity3': '',
    'Naswar': 'No',
    'Quantity4': '',
    'Alcohol': 'No',
    'Quantity5': '',
    'Others': '',
    'Quit Period': '2 years',

    // Diagnosis (4 columns)
    'Type of Cancer': 'Lung Carcinoma',
    'Stage': 'Stage-3',
    'Grade': 'Grade-2',
    'WHO': 3,

    // Previous Treatments (8 columns)
    'Previous Chemo': 'Yes',
    'Previous RT': 'No',
    'Previous Targeted / TKI Therapy': 'No',
    'Previous HT': 'No',
    'Previous IT': 'No',
    'Surgery Other Than Cancer': 'No',
    'Previous Surgery': 'Lobectomy performed 3 months ago',
    '2nd Surgery': '',

    // Pathology (12 columns)
    'Pathological Stage': 'pT3N1M0',
    'Tumor Size': '4.5 cm',
    'Depth': 'Full thickness',
    'Margins': 'Clear',
    'LVI': 'Present',
    'PNI': 'Absent',
    'Nodes Recover': 15,
    'Nodes Involved': 3,
    'Extra Node Ext': 'Absent',
    'Adequate.  Inadequate Surgery': 'Adequate',
    'Recurence': 'No',

    // Biomarkers (6 columns)
    'ER': 'N/A',
    'PR': 'N/A',
    'Her2-U': 'Negative',
    'Ki-67': 45,
    'Mitosis/10HPF': 8,
    'IHC Markers / Tumor Markers': 'TTF-1 Positive',

    // Imaging (8 columns)
    'Ct Scane': 'Yes',
    'MRI': 'No',
    'Pet Scane': 'Yes',
    'U/Sound': 'No',
    'Mammogram': 'N/A',
    'Bone Scane': 'Yes',
    'Echo': 'No',
    'BSC': 'No',

    // Treatment Plan (12 columns)
    'Plan': 'Adjuvant Chemoradiation',
    'Surgery': 'No',
    'Radical': 'No',
    'Pallative': 'No',
    'Neo ADJ': 'No',
    'ADJ': 'Yes',
    'Induction Chemo': 'No',
    'Chemotherapy': 'Cisplatin + Etoposide',
    'Hormonal Therapy': '',
    'Targeted Therapy / TKI': '',
    'Radio Therapy': '60 Gy in 30 fractions',
    'Brachy Therapy': '',
    'Immuno Theray': 'Pembrolizumab'
  },
  {
    // Demographics
    'Reg No': 'REG-2026-002',
    'Reg. Date': '2026-02-10',
    'Name & Sur Name': 'Fatima Bibi',
    'Age': 38,
    'Sex': 'F',
    'Marital Status': 'M',
    'Children': 3,
    'Sibling': 4,
    'Language': 'Urdu',
    'Territory': 'Sindh',
    'Contact No': '+92-301-7654321',
    'CNIC NO': '54321-0987654-1',
    'Education': 'Intermediate',

    // Vitals
    'Height': 158,
    'Weight': 62,
    'Blood Group': 'O+',

    // History
    'History': 'Discovered breast lump during self-examination',
    'DM - HTN/IHD - HCV/HBV - Others': 'Hypertension',
    'Family History of Cancer': 'Mother - Breast Cancer',

    // Habits
    'Smoking': 'No',
    'Quantity': '',
    'Pan': 'No',
    'Quantity2': '',
    'Gutka': 'Yes',
    'Quantity3': '5 years daily use',
    'Naswar': 'No',
    'Quantity4': '',
    'Alcohol': 'No',
    'Quantity5': '',
    'Others': '',
    'Quit Period': '6 months',

    // Diagnosis
    'Type of Cancer': 'Breast Carcinoma',
    'Stage': 'Stage-2',
    'Grade': 'Grade-3',
    'WHO': 2,

    // Previous Treatments
    'Previous Chemo': 'No',
    'Previous RT': 'No',
    'Previous Targeted / TKI Therapy': 'No',
    'Previous HT': 'No',
    'Previous IT': 'No',
    'Surgery Other Than Cancer': 'No',
    'Previous Surgery': '',
    '2nd Surgery': '',

    // Pathology
    'Pathological Stage': 'pT2N0M0',
    'Tumor Size': '2.8 cm',
    'Depth': 'Not applicable',
    'Margins': 'Clear',
    'LVI': 'Absent',
    'PNI': 'Absent',
    'Nodes Recover': 20,
    'Nodes Involved': 0,
    'Extra Node Ext': 'N/A',
    'Adequate.  Inadequate Surgery': 'Adequate',
    'Recurence': 'N/A',

    // Biomarkers
    'ER': 'Positive',
    'PR': 'Positive',
    'Her2-U': 'Negative',
    'Ki-67': 25,
    'Mitosis/10HPF': 5,
    'IHC Markers / Tumor Markers': '',

    // Imaging
    'Ct Scane': 'Yes',
    'MRI': 'Yes',
    'Pet Scane': 'No',
    'U/Sound': 'Yes',
    'Mammogram': 'Yes',
    'Bone Scane': 'No',
    'Echo': 'No',
    'BSC': 'No',

    // Treatment Plan
    'Plan': 'Surgery followed by chemotherapy and radiation',
    'Surgery': 'Yes',
    'Radical': 'No',
    'Pallative': 'No',
    'Neo ADJ': 'Yes',
    'ADJ': 'Yes',
    'Induction Chemo': 'No',
    'Chemotherapy': 'AC x 4 followed by Paclitaxel x 12',
    'Hormonal Therapy': 'Tamoxifen',
    'Targeted Therapy / TKI': '',
    'Radio Therapy': '50 Gy in 25 fractions',
    'Brachy Therapy': '',
    'Immuno Theray': ''
  },
  {
    // Third patient with minimal data (testing optional fields)
    'Reg No': 'REG-2026-003',
    'Reg. Date': '2026-03-01',
    'Name & Sur Name': 'Rashid Ali',
    'Age': 52,
    'Sex': 'M',

    // Minimal other data
    'Type of Cancer': 'Head and Neck Squamous Cell Carcinoma',
    'Stage': 'Stage-4',
  }
];

// Create workbook
const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(samplePatients);

// Add sheet to workbook
xlsx.utils.book_append_sheet(wb, ws, 'Patients');

// Save file
const outputPath = path.resolve(__dirname, '../../data/test-patients.xlsx');
xlsx.writeFile(wb, outputPath);

console.log('Test Excel file created:');
console.log(`  Path: ${outputPath}`);
console.log(`  Columns: ${Object.keys(samplePatients[0]).length}`);
console.log(`  Rows: ${samplePatients.length}`);
console.log('\nRequired columns included:');
const requiredColumns = ['Name & Sur Name', 'Age', 'Sex'];
requiredColumns.forEach(col => console.log(`  ✓ ${col}`));

console.log('\nSample data:');
console.log(`  1. Ahmed Khan - 45M - Lung Carcinoma Stage-3`);
console.log(`  2. Fatima Bibi - 38F - Breast Carcinoma Stage-2`);
console.log(`  3. Rashid Ali - 52M - HNSCC Stage-4`);
