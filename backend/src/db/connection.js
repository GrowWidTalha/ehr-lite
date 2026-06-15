/**
 * Database Connection
 * SQLite using sql.js (pure JavaScript, no native compilation needed)
 */

import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let SQL = null;
let db = null;
let dbPath = null;

/**
 * Initialize sql.js and load/create database
 */
async function initializeDatabase() {
  if (db) {
    return db;
  }

  // Initialize sql.js
  SQL = await initSqlJs();

  // Set paths - use DATA_DIR from environment if available, otherwise use default
  const dataDir = process.env.DATA_DIR || path.join(path.resolve(__dirname, '../..'), 'data');
  dbPath = path.join(dataDir, 'database.db');

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log(`Database loaded: ${dbPath}`);
  } else {
    db = new SQL.Database();
    console.log(`New database created: ${dbPath}`);
  }

  // Enable foreign keys (sql.js doesn't support PRAGMA directly, run as query)
  db.run('PRAGMA foreign_keys = ON');
  db.run('PRAGMA journal_mode = WAL');

  // Create reports tables if they don't exist
  try {
    db.run(`CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      patient_id INTEGER NOT NULL REFERENCES Patient(PatientID),
      diagnosis_id INTEGER,
      title TEXT,
      report_type TEXT,
      category TEXT DEFAULT 'Other',
      notes TEXT,
      report_date DATETIME,
      facility_name TEXT,
      ordering_physician TEXT,
      clinical_context TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS report_images (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      image_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      caption TEXT,
      sequence INTEGER DEFAULT 0,
      captured_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create ReportTypes table
    db.run(`CREATE TABLE IF NOT EXISTS ReportTypes (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      TypeCode TEXT UNIQUE NOT NULL,
      TypeName TEXT NOT NULL,
      Category TEXT NOT NULL,
      Description TEXT,
      DisplayOrder INTEGER DEFAULT 0,
      IsActive INTEGER DEFAULT 1
    )`);

    // Check if ReportTypes is empty, if so seed it
    const reportTypesCount = db.exec('SELECT COUNT(*) as count FROM ReportTypes');
    if (reportTypesCount.length === 0 || reportTypesCount[0].values[0][0] === 0) {
      console.log('Seeding ReportTypes table...');

      // Use individual INSERT statements for sql.js compatibility
      const insertStatements = [
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('CT_SCAN', 'CT Scan', 'Imaging', 'Computed Tomography scan', 1)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('MRI', 'MRI', 'Imaging', 'Magnetic Resonance Imaging', 2)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('PET_SCAN', 'PET Scan', 'Imaging', 'Positron Emission Tomography', 3)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('ULTRASOUND', 'Ultrasound', 'Imaging', 'Ultrasound imaging', 4)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('MAMMOGRAM', 'Mammogram', 'Imaging', 'Breast mammography', 5)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('BONE_SCAN', 'Bone Scan', 'Imaging', 'Nuclear bone scan', 6)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('X_RAY', 'X-Ray', 'Imaging', 'X-ray imaging', 7)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('ECHOCARDIOGRAM', 'Echocardiogram', 'Imaging', 'Heart ultrasound', 8)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('ELECTROCARDIOGRAM', 'ECG/EKG', 'Imaging', 'Heart electrical activity', 9)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('BIOPSY', 'Biopsy Report', 'Pathology', 'Tissue biopsy analysis', 10)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('SURGICAL_PATHOLOGY', 'Surgical Pathology', 'Pathology', 'Surgical specimen analysis', 11)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('CYTOLOGY', 'Cytology Report', 'Pathology', 'Cell analysis (Pap smear, etc.)', 12)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('MOLECULAR', 'Molecular Pathology', 'Pathology', 'DNA/RNA analysis', 13)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('IHC_MARKERS', 'IHC Markers', 'Pathology', 'Immunohistochemistry markers', 14)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('BONE_MARROW', 'Bone Marrow Biopsy', 'Pathology', 'Bone marrow analysis', 15)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('BLOOD_WORK', 'Blood Work', 'Lab', 'Complete blood count, chemistry', 16)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('TUMOR_MARKERS', 'Tumor Markers', 'Lab', 'CEA, CA125, CA19-9, PSA, AFP', 17)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('HORMONE_RECEPTORS', 'Hormone Receptors', 'Lab', 'ER, PR status and percentages', 18)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('HER2_TEST', 'HER2 Testing', 'Lab', 'HER2/neu status', 19)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('KI67', 'Ki-67 Index', 'Lab', 'Proliferation marker', 20)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('GENETIC_TEST', 'Genetic Testing', 'Lab', 'EGFR, ALK, KRAS, MSI, PD-L1', 21)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('COAGULATION', 'Coagulation Profile', 'Lab', 'PT, INR, APTT', 22)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('LIVER_FUNCTION', 'Liver Function', 'Lab', 'LFT: bilirubin, SGPT, SGOT, ALP', 23)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('KIDNEY_FUNCTION', 'Kidney Function', 'Lab', 'Renal function tests', 24)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('CHEMOTHERAPY', 'Chemotherapy Record', 'Treatment', 'Chemo regimen and cycles', 25)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('RADIOTHERAPY', 'Radiotherapy Record', 'Treatment', 'Radiation dose and fields', 26)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('SURGICAL_REPORT', 'Surgical Report', 'Treatment', 'Operative report', 27)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('TARGETED_THERAPY', 'Targeted Therapy', 'Treatment', 'TKI and targeted agents', 28)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('IMMUNOTHERAPY', 'Immunotherapy', 'Treatment', 'Immunotherapy records', 29)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('HORMONE_THERAPY', 'Hormone Therapy', 'Treatment', 'Hormonal treatment records', 30)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('CONSULTATION', 'Consultation Note', 'Clinical', 'Specialist consultation', 31)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('DISCHARGE_SUMMARY', 'Discharge Summary', 'Clinical', 'Hospital discharge summary', 32)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('PROGRESS_NOTE', 'Progress Note', 'Clinical', 'Clinical progress notes', 33)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('REFERRAL', 'Referral Letter', 'Clinical', 'Doctor referral letter', 34)",
        "INSERT OR IGNORE INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES ('GENERAL', 'General Report', 'Other', 'Other medical reports', 35)"
      ];

      insertStatements.forEach(statement => {
        try {
          db.run(statement);
        } catch (error) {
          // Ignore duplicates
        }
      });

      // Create indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_reporttypes_category ON ReportTypes(Category)');
      db.run('CREATE INDEX IF NOT EXISTS idx_reporttypes_code ON ReportTypes(TypeCode)');

      const count = db.exec('SELECT COUNT(*) as count FROM ReportTypes');
      console.log(`✅ Seeded ${count[0].values[0][0]} report types`);
    }

    console.log('Reports tables verified/created');

    // Add missing columns to reports table if they don't exist
    try {
      const reportsColumns = db.exec("PRAGMA table_info(reports)");
      if (reportsColumns.length > 0) {
        const columns = reportsColumns[0].values.map(v => v[1]);

        if (!columns.includes('category')) {
          db.run('ALTER TABLE reports ADD COLUMN category TEXT DEFAULT "Other"');
          console.log('Added category column to reports table');
        }
        if (!columns.includes('facility_name')) {
          db.run('ALTER TABLE reports ADD COLUMN facility_name TEXT');
          console.log('Added facility_name column to reports table');
        }
        if (!columns.includes('ordering_physician')) {
          db.run('ALTER TABLE reports ADD COLUMN ordering_physician TEXT');
          console.log('Added ordering_physician column to reports table');
        }
        if (!columns.includes('clinical_context')) {
          db.run('ALTER TABLE reports ADD COLUMN clinical_context TEXT');
          console.log('Added clinical_context column to reports table');
        }
      }
    } catch (e) {
      console.error('Error adding columns to reports table:', e.message);
    }
  } catch (e) {
    console.error('Error creating reports tables:', e.message);
  }

  // Add history columns to Patient table if they don't exist
  try {
    const patientColumns = db.exec("PRAGMA table_info(Patient)");
    if (patientColumns.length > 0) {
      const columns = patientColumns[0].values.map(v => v[1]);
      if (!columns.includes('PresentingComplaint')) {
        db.run('ALTER TABLE Patient ADD COLUMN PresentingComplaint TEXT');
        console.log('Added PresentingComplaint column to Patient table');
      }
      if (!columns.includes('Comorbidities')) {
        db.run('ALTER TABLE Patient ADD COLUMN Comorbidities TEXT');
        console.log('Added Comorbidities column to Patient table');
      }
      if (!columns.includes('FamilyCancerHistory')) {
        db.run('ALTER TABLE Patient ADD COLUMN FamilyCancerHistory TEXT');
        console.log('Added FamilyCancerHistory column to Patient table');
      }
      if (!columns.includes('StAge')) {
        db.run('ALTER TABLE Patient ADD COLUMN StAge TEXT');
        console.log('Added StAge column to Patient table');
      }
      // Add diagnosis biomarker and treatment columns
      if (!columns.includes('WHOClassification')) {
        db.run('ALTER TABLE Patient ADD COLUMN WHOClassification TEXT');
        console.log('Added WHOClassification column to Patient table');
      }
      if (!columns.includes('ERStatus')) {
        db.run('ALTER TABLE Patient ADD COLUMN ERStatus TEXT');
        console.log('Added ERStatus column to Patient table');
      }
      if (!columns.includes('ERPercent')) {
        db.run('ALTER TABLE Patient ADD COLUMN ERPercent TEXT');
        console.log('Added ERPercent column to Patient table');
      }
      if (!columns.includes('PRStatus')) {
        db.run('ALTER TABLE Patient ADD COLUMN PRStatus TEXT');
        console.log('Added PRStatus column to Patient table');
      }
      if (!columns.includes('PRPercent')) {
        db.run('ALTER TABLE Patient ADD COLUMN PRPercent TEXT');
        console.log('Added PRPercent column to Patient table');
      }
      if (!columns.includes('HER2Status')) {
        db.run('ALTER TABLE Patient ADD COLUMN HER2Status TEXT');
        console.log('Added HER2Status column to Patient table');
      }
      if (!columns.includes('Ki67Percent')) {
        db.run('ALTER TABLE Patient ADD COLUMN Ki67Percent TEXT');
        console.log('Added Ki67Percent column to Patient table');
      }
      if (!columns.includes('StudyType')) {
        db.run('ALTER TABLE Patient ADD COLUMN StudyType TEXT');
        console.log('Added StudyType column to Patient table');
      }
      if (!columns.includes('StudyDate')) {
        db.run('ALTER TABLE Patient ADD COLUMN StudyDate DATETIME');
        console.log('Added StudyDate column to Patient table');
      }
      if (!columns.includes('Findings')) {
        db.run('ALTER TABLE Patient ADD COLUMN Findings TEXT');
        console.log('Added Findings column to Patient table');
      }
      if (!columns.includes('Indication')) {
        db.run('ALTER TABLE Patient ADD COLUMN Indication TEXT');
        console.log('Added Indication column to Patient table');
      }
      if (!columns.includes('PlanType')) {
        db.run('ALTER TABLE Patient ADD COLUMN PlanType TEXT');
        console.log('Added PlanType column to Patient table');
      }
      if (!columns.includes('SurgeryPlanned')) {
        db.run('ALTER TABLE Patient ADD COLUMN SurgeryPlanned TEXT');
        console.log('Added SurgeryPlanned column to Patient table');
      }
      if (!columns.includes('NeoadjuvantChemo')) {
        db.run('ALTER TABLE Patient ADD COLUMN NeoadjuvantChemo TEXT');
        console.log('Added NeoadjuvantChemo column to Patient table');
      }
      if (!columns.includes('Notes')) {
        db.run('ALTER TABLE Patient ADD COLUMN Notes TEXT');
        console.log('Added Notes column to Patient table');
      }
    }
  } catch (e) {
    console.error('Error adding history columns:', e.message);
  }

  // Migrate PatientAddictions table - rename Since to QuitPeriod, make Frequency TEXT
  try {
    const addictionsColumns = db.exec("PRAGMA table_info(PatientAddictions)");
    if (addictionsColumns.length > 0) {
      const columns = addictionsColumns[0].values.map(v => v[1]);

      // Add QuitPeriod column if it doesn't exist
      if (!columns.includes('QuitPeriod')) {
        // Check if we still have the old Since column to migrate from
        if (columns.includes('Since')) {
          db.run('ALTER TABLE PatientAddictions ADD COLUMN QuitPeriod TEXT');
          // Copy data from Since to QuitPeriod
          db.run('UPDATE PatientAddictions SET QuitPeriod = Since WHERE Since IS NOT NULL');
          console.log('Migrated Since column to QuitPeriod in PatientAddictions');
        } else {
          db.run('ALTER TABLE PatientAddictions ADD COLUMN QuitPeriod TEXT');
          console.log('Added QuitPeriod column to PatientAddictions');
        }
      }

      // Add Quit column if it doesn't exist
      if (!columns.includes('Quit')) {
        db.run('ALTER TABLE PatientAddictions ADD COLUMN Quit TEXT');
        console.log('Added Quit column to PatientAddictions');
      }
    }
  } catch (e) {
    console.error('Error migrating PatientAddictions:', e.message);
  }

  // Recreate vw_patient_detail view with CancerType field (always recreate to ensure correct logic)
  try {
    db.run('DROP VIEW IF EXISTS vw_patient_detail');
    db.run(`
      CREATE VIEW vw_patient_detail AS
      SELECT
        p.*,
        bg.BloodGroup AS BloodGroupName,
        q.QLevel AS QualificationName,
        o.Occupation AS OccupationName,
        mt.MotherTongue AS MotherTongueName,
        d.District AS PlaceOfBirthName,
        sp.Sports AS SportsName,
        h.Hospitals AS HospitalName,
        CASE
          WHEN p.BrainTumor IS NOT NULL AND p.BrainTumor != '' THEN p.BrainTumor
          WHEN p.HeadAndNeck IS NOT NULL AND p.HeadAndNeck != '' THEN p.HeadAndNeck
          WHEN p.BreastCancer IS NOT NULL AND p.BreastCancer != '' THEN p.BreastCancer
          WHEN p.Genitourinary IS NOT NULL AND p.Genitourinary != '' THEN p.Genitourinary
          WHEN p.Gyneacological IS NOT NULL AND p.Gyneacological != '' THEN p.Gyneacological
          WHEN p.LungsCancer IS NOT NULL AND p.LungsCancer != '' THEN p.LungsCancer
          WHEN p.GITumor IS NOT NULL AND p.GITumor != '' THEN p.GITumor
          WHEN p.SkinTumor IS NOT NULL AND p.SkinTumor != '' THEN p.SkinTumor
          WHEN p.Hematological IS NOT NULL AND p.Hematological != '' THEN p.Hematological
          WHEN p.Sarcoma IS NOT NULL AND p.Sarcoma != '' THEN p.Sarcoma
          WHEN p.Carcinoma IS NOT NULL AND p.Carcinoma != '' THEN p.Carcinoma
          ELSE NULL
        END AS CancerType
      FROM Patient p
      LEFT JOIN BloodGroups bg ON p.BloodGroup = bg.ID
      LEFT JOIN Qualifications q ON p.Qualifications = q.ID
      LEFT JOIN Occupation o ON p.Occupation = o.ID
      LEFT JOIN MotherTongue mt ON p.MotherTongue = mt.ID
      LEFT JOIN District d ON p.PlaceOfBirth = d.ID
      LEFT JOIN Sports sp ON p.Sports = sp.ID
      LEFT JOIN Hospitals h ON p.Hospital = h.ID
    `);
    console.log('Recreated vw_patient_detail view (returns actual cancer values, not categories)');
  } catch (e) {
    console.error('Error recreating view:', e.message);
  }

  return db;
}

/**
 * Get or create database connection
 */
export async function getConnection() {
  if (db) {
    return db;
  }
  return await initializeDatabase();
}

/**
 * Save database to disk
 * Call this after making changes
 */
export function saveDatabase() {
  if (db && dbPath) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

/**
 * Close database (not really needed for sql.js, but for consistency)
 */
export function closeConnection() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

/**
 * Get database statistics
 */
export async function getStats() {
  const connection = await getConnection();

  try {
    const tablesResult = connection.exec(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `);

    // sql.js returns { columns: [...], values: [[...]] }
    const tableNames = tablesResult.length > 0 && tablesResult[0].values
      ? tablesResult[0].values.map(row => row[0])
      : [];

    const stats = {
      path: dbPath,
      tables: tableNames.length,
      tableStats: {}
    };

    for (const name of tableNames) {
      try {
        const countResult = connection.exec(`SELECT COUNT(*) as count FROM ${name}`);
        if (countResult.length > 0 && countResult[0].values) {
          stats.tableStats[name] = countResult[0].values[0][0];
        } else {
          stats.tableStats[name] = 0;
        }
      } catch (e) {
        stats.tableStats[name] = 0;
      }
    }

    return stats;
  } catch (error) {
    return {
      path: dbPath,
      tables: 0,
      tableStats: {},
      error: error.message
    };
  }
}

// Auto-save on interval (every 5 seconds)
let saveInterval = null;
export function startAutoSave() {
  if (saveInterval) return;
  saveInterval = setInterval(() => {
    saveDatabase();
  }, 5000);
}

export function stopAutoSave() {
  if (saveInterval) {
    clearInterval(saveInterval);
    saveInterval = null;
  }
}

// Graceful shutdown
process.on('exit', () => {
  saveDatabase();
});

process.on('SIGINT', () => {
  closeConnection();
  stopAutoSave();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeConnection();
  stopAutoSave();
  process.exit(0);
});
