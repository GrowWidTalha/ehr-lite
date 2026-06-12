// Migration: Create ReportTypes table and insert data
import { run, all } from '../src/db/query.js';
import { saveDatabase } from '../src/db/connection.js';

async function createReportTypes() {
  console.log('Creating ReportTypes table...');

  try {
    // Create table
    await run(`
      CREATE TABLE IF NOT EXISTS ReportTypes (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        TypeCode TEXT UNIQUE NOT NULL,
        TypeName TEXT NOT NULL,
        Category TEXT NOT NULL,
        Description TEXT,
        DisplayOrder INTEGER DEFAULT 0,
        IsActive INTEGER DEFAULT 1
      )
    `);
    console.log('✅ ReportTypes table created');

    // Insert report types
    const reportTypes = [
      ['CT_SCAN', 'CT Scan', 'Imaging', 'Computed Tomography scan', 1],
      ['MRI', 'MRI', 'Imaging', 'Magnetic Resonance Imaging', 2],
      ['PET_SCAN', 'PET Scan', 'Imaging', 'Positron Emission Tomography', 3],
      ['ULTRASOUND', 'Ultrasound', 'Imaging', 'Ultrasound imaging', 4],
      ['MAMMOGRAM', 'Mammogram', 'Imaging', 'Breast mammography', 5],
      ['BONE_SCAN', 'Bone Scan', 'Imaging', 'Nuclear bone scan', 6],
      ['X_RAY', 'X-Ray', 'Imaging', 'X-ray imaging', 7],
      ['ECHOCARDIOGRAM', 'Echocardiogram', 'Imaging', 'Heart ultrasound', 8],
      ['ELECTROCARDIOGRAM', 'ECG/EKG', 'Imaging', 'Heart electrical activity', 9],
      ['BIOPSY', 'Biopsy Report', 'Pathology', 'Tissue biopsy analysis', 10],
      ['SURGICAL_PATHOLOGY', 'Surgical Pathology', 'Pathology', 'Surgical specimen analysis', 11],
      ['CYTOLOGY', 'Cytology Report', 'Pathology', 'Cell analysis (Pap smear, etc.)', 12],
      ['MOLECULAR', 'Molecular Pathology', 'Pathology', 'DNA/RNA analysis', 13],
      ['IHC_MARKERS', 'IHC Markers', 'Pathology', 'Immunohistochemistry markers', 14],
      ['BONE_MARROW', 'Bone Marrow Biopsy', 'Pathology', 'Bone marrow analysis', 15],
      ['BLOOD_WORK', 'Blood Work', 'Lab', 'Complete blood count, chemistry', 16],
      ['TUMOR_MARKERS', 'Tumor Markers', 'Lab', 'CEA, CA125, CA19-9, PSA, AFP', 17],
      ['HORMONE_RECEPTORS', 'Hormone Receptors', 'Lab', 'ER, PR status and percentages', 18],
      ['HER2_TEST', 'HER2 Testing', 'Lab', 'HER2/neu status', 19],
      ['KI67', 'Ki-67 Index', 'Lab', 'Proliferation marker', 20],
      ['GENETIC_TEST', 'Genetic Testing', 'Lab', 'EGFR, ALK, KRAS, MSI, PD-L1', 21],
      ['COAGULATION', 'Coagulation Profile', 'Lab', 'PT, INR, APTT', 22],
      ['LIVER_FUNCTION', 'Liver Function', 'Lab', 'LFT: bilirubin, SGPT, SGOT, ALP', 23],
      ['KIDNEY_FUNCTION', 'Kidney Function', 'Lab', 'Renal function tests', 24],
      ['CHEMOTHERAPY', 'Chemotherapy Record', 'Treatment', 'Chemo regimen and cycles', 25],
      ['RADIOTHERAPY', 'Radiotherapy Record', 'Treatment', 'Radiation dose and fields', 26],
      ['SURGICAL_REPORT', 'Surgical Report', 'Treatment', 'Operative report', 27],
      ['TARGETED_THERAPY', 'Targeted Therapy', 'Treatment', 'TKI and targeted agents', 28],
      ['IMMUNOTHERAPY', 'Immunotherapy', 'Treatment', 'Immunotherapy records', 29],
      ['HORMONE_THERAPY', 'Hormone Therapy', 'Treatment', 'Hormonal treatment records', 30],
      ['CONSULTATION', 'Consultation Note', 'Clinical', 'Specialist consultation', 31],
      ['DISCHARGE_SUMMARY', 'Discharge Summary', 'Clinical', 'Hospital discharge summary', 32],
      ['PROGRESS_NOTE', 'Progress Note', 'Clinical', 'Clinical progress notes', 33],
      ['REFERRAL', 'Referral Letter', 'Clinical', 'Doctor referral letter', 34],
      ['GENERAL', 'General Report', 'Other', 'Other medical reports', 35],
    ];

    for (const [TypeCode, TypeName, Category, Description, DisplayOrder] of reportTypes) {
      try {
        await run(
          'INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES (?, ?, ?, ?, ?)',
          TypeCode, TypeName, Category, Description, DisplayOrder
        );
      } catch (error) {
        // Ignore duplicates
      }
    }

    const count = await all('SELECT COUNT(*) as count FROM ReportTypes');
    console.log(`✅ Inserted ${count[0].count} report types`);

    // Create indexes
    await run('CREATE INDEX IF NOT EXISTS idx_reporttypes_category ON ReportTypes(Category)');
    await run('CREATE INDEX IF NOT EXISTS idx_reporttypes_code ON ReportTypes(TypeCode)');
    console.log('✅ Created indexes for ReportTypes');

    // Update reports table
    try {
      await run('ALTER TABLE reports ADD COLUMN category TEXT DEFAULT "Other"');
      console.log('✅ Added category column to reports');
    } catch (error) {
      console.log('  Category column already exists');
    }

    try {
      await run('ALTER TABLE reports ADD COLUMN facility_name TEXT');
      console.log('✅ Added facility_name column to reports');
    } catch (error) {
      console.log('  facility_name column already exists');
    }

    try {
      await run('ALTER TABLE reports ADD COLUMN ordering_physician TEXT');
      console.log('✅ Added ordering_physician column to reports');
    } catch (error) {
      console.log('  ordering_physician column already exists');
    }

    try {
      await run('ALTER TABLE reports ADD COLUMN clinical_context TEXT');
      console.log('✅ Added clinical_context column to reports');
    } catch (error) {
      console.log('  clinical_context column already exists');
    }

    await run('CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category)');
    await run('CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type)');
    await run('CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(report_date)');
    console.log('✅ Created indexes for reports');

    console.log('\n✅ Migration completed successfully!');

    // Save database to disk
    saveDatabase();
    console.log('✅ Database saved to disk');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Run migration
createReportTypes()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

export { createReportTypes };
