// Final seeding script for ReportTypes - with proper timing
import { getConnection, saveDatabase } from './src/db/connection.js';

async function seedReportTypes() {
  console.log('Seeding ReportTypes...');

  try {
    // Get fresh connection
    const db = await getConnection();

    // Create table if not exists
    console.log('Creating ReportTypes table...');
    db.run(`
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

    console.log('Table created/verified');

    // Check existing data
    const checkResult = db.exec("SELECT COUNT(*) as count FROM ReportTypes");
    const existingCount = checkResult.length > 0 ? checkResult[0].values[0][0] : 0;

    if (existingCount >= 35) {
      console.log(`✅ ReportTypes already has ${existingCount} entries - skipping seed`);
      process.exit(0);
    }

    // Insert data
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

    let inserted = 0;
    for (const [TypeCode, TypeName, Category, Description, DisplayOrder] of reportTypes) {
      try {
        db.run('INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder, IsActive) VALUES (?, ?, ?, ?, ?, 1)',
          TypeCode, TypeName, Category, Description, DisplayOrder);
        inserted++;
      } catch (error) {
        // Ignore duplicates
      }
    }

    console.log(`✅ Inserted ${inserted} report types`);

    // Save to disk
    await saveDatabase();
    console.log('✅ Database saved');

    // Verify by reloading
    const { getConnection: getConnection2 } = await import('./src/db/connection.js');
    const db2 = await getConnection2();
    const result = db2.exec('SELECT Category, COUNT(*) as count FROM ReportTypes GROUP BY Category ORDER BY Category');

    if (result.length > 0) {
      console.log('\nReport Types by Category:');
      const { columns, values } = result[0];
      for (const row of values) {
        console.log(`  ${row[0]}: ${row[1]} types`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedReportTypes();
