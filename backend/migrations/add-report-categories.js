// Migration: Add Report Categories
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { run, all, get } from '../src/db/query.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function addReportCategories() {
  console.log('Running migration: Add Report Categories and Types...');

  try {
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'add-report-categories.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon and run each statement
    const statements = sql.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await run(statement);
        } catch (error) {
          // Ignore errors for ALTER TABLE if column already exists
          if (error.message.includes('duplicate column')) {
            console.log('  Column already exists, skipping...');
          } else {
            throw error;
          }
        }
      }
    }

    console.log('✅ Migration completed successfully');
    console.log('Added ReportTypes table with comprehensive report categories');
    console.log('Updated reports table with category, facility, physician fields');
    console.log('Created indexes for better performance');

    return { success: true };
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run migration if executed directly
if (process.argv[1] === 'run') {
  addReportCategories()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { addReportCategories };
