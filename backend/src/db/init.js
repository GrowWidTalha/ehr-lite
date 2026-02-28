/**
 * Database Initialization
 * Sets up SQLite database using sql.js and runs schema
 */

import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Paths
const projectRoot = path.resolve(__dirname, '../..');
const dataDir = path.join(projectRoot, 'data');
const dbPath = path.join(dataDir, 'database.db');
const imagesDir = path.join(dataDir, 'patient-images');

// Ensure data directories exist
function ensureDirectories() {
  if (!fs.existsSync(dataDir)) {
    console.log(`Creating data directory: ${dataDir}`);
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(imagesDir)) {
    console.log(`Creating images directory: ${imagesDir}`);
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  return { dataDir, imagesDir };
}

// Read schema SQL
function loadSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  console.log(`Loading schema from: ${schemaPath}`);
  return fs.readFileSync(schemaPath, 'utf-8');
}

// Parse SQL into individual statements
function parseSQL(sql) {
  const statements = [];
  let current = '';
  let inComment = false;

  const lines = sql.split('\n');

  for (let line of lines) {
    // Skip single-line comments
    if (line.trim().startsWith('--')) {
      continue;
    }

    // Handle multi-line comments
    if (line.includes('/*')) {
      inComment = true;
    }
    if (line.includes('*/')) {
      inComment = false;
      continue;
    }
    if (inComment) {
      continue;
    }

    current += line + '\n';

    // Check if line ends with semicolon
    if (line.trim().endsWith(';')) {
      const statement = current.trim();
      if (statement && !statement.startsWith('--')) {
        statements.push(statement);
      }
      current = '';
    }
  }

  // Add remaining content
  if (current.trim()) {
    const statement = current.trim();
    if (statement && !statement.startsWith('--')) {
      statements.push(statement);
    }
  }

  return statements;
}

// Initialize database
async function initDatabase() {
  console.log('='.repeat(60));
  console.log('EHR Lite Database Initialization');
  console.log('='.repeat(60));

  // Create directories
  const { dataDir, imagesDir } = ensureDirectories();
  console.log(`\nData directory: ${dataDir}`);
  console.log(`Images directory: ${imagesDir}`);

  // Initialize sql.js
  console.log('\nInitializing sql.js...');
  const SQL = await initSqlJs();

  // Check if database exists
  let db;
  let tablesAlreadyExist = false;

  if (fs.existsSync(dbPath)) {
    console.log(`Loading existing database: ${dbPath}`);
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);

    // Check if tables already exist
    try {
      const result = db.exec(`SELECT name FROM sqlite_master WHERE type='table' LIMIT 1`);
      if (result.length > 0 && result[0].values.length > 0) {
        tablesAlreadyExist = true;
        console.log('Tables already exist, skipping schema creation...');
      }
    } catch (e) {
      // Database exists but is empty
    }
  } else {
    console.log(`Creating new database: ${dbPath}`);
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  db.run('PRAGMA journal_mode = WAL');

  if (!tablesAlreadyExist) {
    // Load and execute schema
    console.log('\nExecuting schema...');
    const schema = loadSchema();

    // Parse SQL into statements
    const statements = parseSQL(schema);
    console.log(`Parsed ${statements.length} SQL statements`);

    let executed = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      try {
        // Skip empty statements
        if (!statement.trim()) {
          continue;
        }

        // For CREATE TABLE IF NOT EXISTS, check if table exists
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableNameMatch = statement.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
          if (tableNameMatch) {
            const tableName = tableNameMatch[1];
            const existing = db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
            if (existing.length > 0 && existing[0].values.length > 0) {
              skipped++;
              continue;
            }
          }
        }

        // For CREATE VIEW, similar check
        if (statement.toUpperCase().includes('CREATE VIEW')) {
          const viewNameMatch = statement.match(/CREATE\s+VIEW\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
          if (viewNameMatch) {
            const viewName = viewNameMatch[1];
            const existing = db.exec(`SELECT name FROM sqlite_master WHERE type='view' AND name='${viewName}'`);
            if (existing.length > 0 && existing[0].values.length > 0) {
              skipped++;
              continue;
            }
          }
        }

        db.run(statement);
        executed++;

        // Show progress for CREATE statements
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const match = statement.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
          if (match) {
            console.log(`  Created table: ${match[1]}`);
          }
        } else if (statement.toUpperCase().includes('CREATE VIEW')) {
          const match = statement.match(/CREATE\s+VIEW\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
          if (match) {
            console.log(`  Created view: ${match[1]}`);
          }
        }

      } catch (error) {
        errors++;
        console.error(`Error executing statement ${i + 1}: ${error.message}`);
        console.error(`Statement preview: ${statement.substring(0, 100)}...`);
      }
    }

    console.log(`\nExecution summary:`);
    console.log(`  Executed: ${executed} statements`);
    console.log(`  Skipped: ${skipped} statements`);
    console.log(`  Errors: ${errors} statements`);
  }

  // Verify tables created
  const tables = db.exec(`
    SELECT name FROM sqlite_master
    WHERE type='table'
    ORDER BY name
  `);

  console.log(`\nTotal tables: ${tables[0]?.values?.length || 0}`);
  if (tables[0] && tables[0].values) {
    console.log('Tables:', tables[0].values.map(t => t[0]).join(', '));
  }

  // Verify views created
  const views = db.exec(`
    SELECT name FROM sqlite_master
    WHERE type='view'
    ORDER BY name
  `);

  console.log(`\nTotal views: ${views[0]?.values?.length || 0}`);
  if (views[0] && views[0].values) {
    console.log('Views:', views[0].values.map(v => v[0]).join(', '));
  }

  // Get table row counts
  console.log('\nTable row counts:');
  if (tables[0] && tables[0].values) {
    for (const t of tables[0].values) {
      const tableName = t[0];
      try {
        const result = db.exec(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = result[0]?.values[0]?.[0] || 0;
        console.log(`  ${tableName}: ${count} rows`);
      } catch (e) {
        console.log(`  ${tableName}: (error counting)`);
      }
    }
  }

  // Save database
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
  console.log(`\nDatabase saved to: ${dbPath}`);

  db.close();

  console.log('\n' + '='.repeat(60));
  console.log('Database initialization complete!');
  console.log('='.repeat(60));
}

// Run initialization
initDatabase().catch(error => {
  console.error('Initialization failed:', error);
  process.exit(1);
});
