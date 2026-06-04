// Migration: Add Past Records and Past Surgeries tables
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { run } from '../src/db/query.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function addPastRecordsAndSurgeries() {
  console.log('Running migration: Add Past Records and Past Surgeries tables...');

  try {
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'add-past-records-surgeries.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon and run each statement
    const statements = sql.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await run(statement);
      }
    }

    console.log('✅ Migration completed successfully');
    console.log('Created tables: PastRecords, PastSurgeries');
    console.log('Created indexes: idx_pastrecords_patient, idx_pastsurgeries_patient, idx_pastsurgeries_cancer');

    return { success: true };
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run migration if executed directly
if (process.argv[1] === 'run') {
  addPastRecordsAndSurgeries()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { addPastRecordsAndSurgeries };
