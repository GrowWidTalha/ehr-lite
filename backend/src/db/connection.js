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

  // Set paths
  const projectRoot = path.resolve(__dirname, '../..');
  const dataDir = path.join(projectRoot, 'data');
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
