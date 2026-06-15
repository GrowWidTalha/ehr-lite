// Seed ReportTypes data
import { run, all } from '../src/db/query.js';

const reportTypes = [
  // Imaging Reports
  { typeCode: 'CT_SCAN', typeName: 'CT Scan', category: 'Imaging', description: 'Computed Tomography scan', displayOrder: 1 },
  { typeCode: 'MRI', typeName: 'MRI', category: 'Imaging', description: 'Magnetic Resonance Imaging', displayOrder: 2 },
  { typeCode: 'PET_SCAN', typeName: 'PET Scan', category: 'Imaging', description: 'Positron Emission Tomography', displayOrder: 3 },
  { typeCode: 'ULTRASOUND', typeName: 'Ultrasound', category: 'Imaging', description: 'Ultrasound imaging', displayOrder: 4 },
  { typeCode: 'MAMMOGRAM', typeName: 'Mammogram', category: 'Imaging', description: 'Breast mammography', displayOrder: 5 },
  { typeCode: 'BONE_SCAN', typeName: 'Bone Scan', category: 'Imaging', description: 'Nuclear bone scan', displayOrder: 6 },
  { typeCode: 'X_RAY', typeName: 'X-Ray', category: 'Imaging', description: 'X-ray imaging', displayOrder: 7 },
  { typeCode: 'ECHOCARDIOGRAM', typeName: 'Echocardiogram', category: 'Imaging', description: 'Heart ultrasound', displayOrder: 8 },
  { typeCode: 'ELECTROCARDIOGRAM', typeName: 'ECG/EKG', category: 'Imaging', description: 'Heart electrical activity', displayOrder: 9 },

  // Pathology Reports
  { typeCode: 'BIOPSY', typeName: 'Biopsy Report', category: 'Pathology', description: 'Tissue biopsy analysis', displayOrder: 10 },
  { typeCode: 'SURGICAL_PATHOLOGY', typeName: 'Surgical Pathology', category: 'Pathology', description: 'Surgical specimen analysis', displayOrder: 11 },
  { typeCode: 'CYTOLOGY', typeName: 'Cytology Report', category: 'Pathology', description: 'Cell analysis (Pap smear, etc.)', displayOrder: 12 },
  { typeCode: 'MOLECULAR', typeName: 'Molecular Pathology', category: 'Pathology', description: 'DNA/RNA analysis', displayOrder: 13 },
  { typeCode: 'IHC_MARKERS', typeName: 'IHC Markers', category: 'Pathology', description: 'Immunohistochemistry markers', displayOrder: 14 },
  { typeCode: 'BONE_MARROW', typeName: 'Bone Marrow Biopsy', category: 'Pathology', description: 'Bone marrow analysis', displayOrder: 15 },

  // Lab Results
  { typeCode: 'BLOOD_WORK', typeName: 'Blood Work', category: 'Lab', description: 'Complete blood count, chemistry', displayOrder: 16 },
  { typeCode: 'TUMOR_MARKERS', typeName: 'Tumor Markers', category: 'Lab', description: 'CEA, CA125, CA19-9, PSA, AFP', displayOrder: 17 },
  { typeCode: 'HORMONE_RECEPTORS', typeName: 'Hormone Receptors', category: 'Lab', description: 'ER, PR status and percentages', displayOrder: 18 },
  { typeCode: 'HER2_TEST', typeName: 'HER2 Testing', category: 'Lab', description: 'HER2/neu status', displayOrder: 19 },
  { typeCode: 'KI67', typeName: 'Ki-67 Index', category: 'Lab', description: 'Proliferation marker', displayOrder: 20 },
  { typeCode: 'GENETIC_TEST', typeName: 'Genetic Testing', category: 'Lab', description: 'EGFR, ALK, KRAS, MSI, PD-L1', displayOrder: 21 },
  { typeCode: 'COAGULATION', typeName: 'Coagulation Profile', category: 'Lab', description: 'PT, INR, APTT', displayOrder: 22 },
  { typeCode: 'LIVER_FUNCTION', typeName: 'Liver Function', category: 'Lab', description: 'LFT: bilirubin, SGPT, SGOT, ALP', displayOrder: 23 },
  { typeCode: 'KIDNEY_FUNCTION', typeName: 'Kidney Function', category: 'Lab', description: 'Renal function tests', displayOrder: 24 },

  // Treatment Reports
  { typeCode: 'CHEMOTHERAPY', typeName: 'Chemotherapy Record', category: 'Treatment', description: 'Chemo regimen and cycles', displayOrder: 25 },
  { typeCode: 'RADIOTHERAPY', typeName: 'Radiotherapy Record', category: 'Treatment', description: 'Radiation dose and fields', displayOrder: 26 },
  { typeCode: 'SURGICAL_REPORT', typeName: 'Surgical Report', category: 'Treatment', description: 'Operative report', displayOrder: 27 },
  { typeCode: 'TARGETED_THERAPY', typeName: 'Targeted Therapy', category: 'Treatment', description: 'TKI and targeted agents', displayOrder: 28 },
  { typeCode: 'IMMUNOTHERAPY', typeName: 'Immunotherapy', category: 'Treatment', description: 'Immunotherapy records', displayOrder: 29 },
  { typeCode: 'HORMONE_THERAPY', typeName: 'Hormone Therapy', category: 'Treatment', description: 'Hormonal treatment records', displayOrder: 30 },

  // Clinical Documents
  { typeCode: 'CONSULTATION', typeName: 'Consultation Note', category: 'Clinical', description: 'Specialist consultation', displayOrder: 31 },
  { typeCode: 'DISCHARGE_SUMMARY', typeName: 'Discharge Summary', category: 'Clinical', description: 'Hospital discharge summary', displayOrder: 32 },
  { typeCode: 'PROGRESS_NOTE', typeName: 'Progress Note', category: 'Clinical', description: 'Clinical progress notes', displayOrder: 33 },
  { typeCode: 'REFERRAL', typeName: 'Referral Letter', category: 'Clinical', description: 'Doctor referral letter', displayOrder: 34 },

  // Other
  { typeCode: 'GENERAL', typeName: 'General Report', category: 'Other', description: 'Other medical reports', displayOrder: 35 },
];

async function seedReportTypes() {
  console.log('Seeding ReportTypes...');

  try {
    for (const { typeCode, typeName, category, description, displayOrder } of reportTypes) {
      await run(
        'INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder, IsActive) VALUES (?, ?, ?, ?, ?, 1)',
        typeCode, typeName, category, description, displayOrder
      );
    }

    const count = await all('SELECT COUNT(*) as count FROM ReportTypes');
    console.log(`✅ Inserted ${count[0].count} report types`);

    console.log('\nReport Types by Category:');
    const categories = await all('SELECT Category, COUNT(*) as count FROM ReportTypes GROUP BY Category ORDER BY Category');
    for (const cat of categories) {
      console.log(`  ${cat.Category}: ${cat.count} types`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding report types:', error.message);
    process.exit(1);
  }
}

seedReportTypes();
