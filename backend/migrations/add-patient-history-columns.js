/**
 * Migration: Add missing Patient table columns
 *
 * This migration adds the following columns to the Patient table:
 * - StAge
 * - PresentingComplaint
 * - Comorbidities
 * - FamilyCancerHistory
 * - WHOClassification
 * - ERStatus, ERPercent
 * - PRStatus, PRPercent
 * - HER2Status, Ki67Percent
 * - StudyType, StudyDate, Findings, Indication
 * - PlanType, SurgeryPlanned, NeoadjuvantChemo
 */

import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'database.db')
  : path.resolve(__dirname, '../data/database.db');

if (!fs.existsSync(dbPath)) {
  console.log('Database not found. Run migrate.js first.');
  process.exit(1);
}

const SQL = await initSqlJs();
const buffer = fs.readFileSync(dbPath);
const db = new SQL.Database(buffer);

db.run('PRAGMA foreign_keys = ON');

// Columns to add
const columnsToAdd = [
  'StAge TEXT',
  'PresentingComplaint TEXT',
  'Comorbidities TEXT',
  'FamilyCancerHistory TEXT',
  'WHOClassification TEXT',
  'ERStatus TEXT',
  'ERPercent TEXT',
  'PRStatus TEXT',
  'PRPercent TEXT',
  'HER2Status TEXT',
  'Ki67Percent TEXT',
  'StudyType TEXT',
  'StudyDate DATETIME',
  'Findings TEXT',
  'Indication TEXT',
  'PlanType TEXT',
  'SurgeryPlanned TEXT',
  'NeoadjuvantChemo TEXT'
];

// Get existing columns
const tableInfo = await all('PRAGMA table_info(Patient)');
const existingColumns = tableInfo.map(col => col.name);

console.log('Existing Patient table columns:', existingColumns.length);

// Add missing columns
let added = 0;
for (const columnDef of columnsToAdd) {
  const columnName = columnDef.split(' ')[0];

  if (existingColumns.includes(columnName)) {
    console.log(`⏭️  Column ${columnName} already exists, skipping`);
    continue;
  }

  try {
    db.run(`ALTER TABLE Patient ADD COLUMN ${columnDef}`);
    console.log(`✅ Added column: ${columnName}`);
    added++;
  } catch (error) {
    console.error(`❌ Error adding ${columnName}:`, error.message);
  }
}

// Save
const data = db.export();
fs.writeFileSync(dbPath, Buffer.from(data));
db.close();

console.log(`\nDone — ${added} columns added to Patient table`);
console.log(`Saved to: ${dbPath}`);

// Helper function to run queries
async function all(query, ...params) {
  const stmt = db.prepare(query);
  stmt.bind([...params]);
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row);
  }
  stmt.free();
  return results;
}
