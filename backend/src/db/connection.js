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
      notes TEXT,
      report_date DATETIME,
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
    console.log('Reports tables verified/created');
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
    }
  } catch (e) {
    console.error('Error adding history columns:', e.message);
  }

  // Migrate PatientAddictions table - rename Since to QuitPeriod, make Frequency TEXT
  try {
    const addictionsColumns = db.exec("PRAGMA table_info(PatientAddictions)");
    if (addictionsColumns.length > 0) {
      const columns = addictionsColumns[0].values.map(v => v[1]);
      // Check if we still have the old Since column
      if (columns.includes('Since') && !columns.includes('QuitPeriod')) {
        db.run('ALTER TABLE PatientAddictions ADD COLUMN QuitPeriod TEXT');
        // Copy data from Since to QuitPeriod
        db.run('UPDATE PatientAddictions SET QuitPeriod = Since WHERE Since IS NOT NULL');
        // Note: We can't drop columns in SQLite, but we'll ignore Since in the app
        console.log('Migrated Since column to QuitPeriod in PatientAddictions');
      }
      // Add QuitPeriod column if it doesn't exist
      if (!columns.includes('QuitPeriod')) {
        db.run('ALTER TABLE PatientAddictions ADD COLUMN QuitPeriod TEXT');
        console.log('Added QuitPeriod column to PatientAddictions');
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

  // Recreate vw_patient_detail view with CancerType field
  try {
    // Check if view has CancerType column
    const viewInfo = db.exec("PRAGMA table_info(vw_patient_detail)");
    let hasCancerType = false;
    if (viewInfo.length > 0) {
      const columns = viewInfo[0].values.map(v => v[1]);
      hasCancerType = columns.includes('CancerType');
    }

    if (!hasCancerType) {
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
            WHEN p.BrainTumor IS NOT NULL AND p.BrainTumor != '' THEN 'brain'
            WHEN p.HeadAndNeck IS NOT NULL AND p.HeadAndNeck != '' THEN 'head/neck'
            WHEN p.BreastCancer IS NOT NULL AND p.BreastCancer != '' THEN 'breast'
            WHEN p.Genitourinary IS NOT NULL AND p.Genitourinary != '' THEN 'genitourinary'
            WHEN p.Gyneacological IS NOT NULL AND p.Gyneacological != '' THEN 'gynecological'
            WHEN p.LungsCancer IS NOT NULL AND p.LungsCancer != '' THEN 'lungs'
            WHEN p.GITumor IS NOT NULL AND p.GITumor != '' THEN 'gi/gastro'
            WHEN p.SkinTumor IS NOT NULL AND p.SkinTumor != '' THEN 'skin'
            WHEN p.Hematological IS NOT NULL AND p.Hematological != '' THEN 'hematological/blood'
            WHEN p.Sarcoma IS NOT NULL AND p.Sarcoma != '' THEN 'sarcoma'
            WHEN p.Carcinoma IS NOT NULL AND p.Carcinoma != '' THEN 'carcinoma'
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
      console.log('Recreated vw_patient_detail view with CancerType field');
    }
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
