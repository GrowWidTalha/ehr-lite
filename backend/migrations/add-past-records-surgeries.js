// Migration: Add Past Records and Past Surgeries tables
const fs = require('fs');
const path = require('path');
const { runMigrations } = require('./migrate');

async function addPastRecordsAndSurgeries() {
  const db = require('../src/db/connection').getDb();

  console.log('Running migration: Add Past Records and Past Surgeries tables...');

  try {
    // Enable foreign keys
    db.exec('PRAGMA foreign_keys = ON');

    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'add-past-records-surgeries.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    db.exec(sql);

    console.log('✅ Migration completed successfully');
    console.log('Created tables: PastRecords, PastSurgeries');

    return { success: true };
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run migration if executed directly
if (require.main === module) {
  addPastRecordsAndSurgeries()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { addPastRecordsAndSurgeries };
