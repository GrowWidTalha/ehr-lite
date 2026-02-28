/**
 * Query Helper for sql.js
 * Provides a more familiar API for database operations
 */

import { getConnection, saveDatabase } from './connection.js';

/**
 * Execute a SELECT query and return all rows as objects
 */
export async function all(query, ...params) {
  const db = await getConnection();

  try {
    const result = db.exec(query, params);

    if (result.length === 0) {
      return [];
    }

    const { columns, values } = result[0];
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  } catch (error) {
    console.error('Query error:', error.message);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Execute a SELECT query and return the first row
 */
export async function get(query, ...params) {
  const rows = await all(query, ...params);
  return rows[0] || null;
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 * Returns { changes: number, lastInsertRowid: number }
 */
export async function run(query, ...params) {
  const db = await getConnection();

  try {
    // sql.js doesn't return run results the same way
    // We need to get changes info before and after
    const beforeResult = db.exec('SELECT total_changes() as tc');
    const beforeChanges = beforeResult.length > 0 ? beforeResult[0].values[0][0] : 0;

    db.run(query, params);

    const afterResult = db.exec('SELECT total_changes() as tc, last_insert_rowid() as lid');
    const afterChanges = afterResult.length > 0 ? afterResult[0].values[0][0] : 0;
    const lastId = afterResult.length > 0 ? afterResult[0].values[0][1] : 0;

    const result = {
      changes: afterChanges - beforeChanges,
      lastInsertRowid: lastId
    };

    // Auto-save after writes
    saveDatabase();

    return result;
  } catch (error) {
    console.error('Run error:', error.message);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Prepare a statement for repeated execution
 */
export async function prepare(query) {
  const db = await getConnection();

  return {
    get(...params) {
      try {
        const result = db.exec(query, params);
        if (result.length === 0) return null;

        const { columns, values } = result[0];
        const obj = {};
        columns.forEach((col, i) => {
          obj[col] = values[0][i];
        });
        return obj;
      } catch (error) {
        return null;
      }
    },

    all(...params) {
      try {
        const result = db.exec(query, params);
        if (result.length === 0) return [];

        const { columns, values } = result[0];
        return values.map(row => {
          const obj = {};
          columns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
      } catch (error) {
        return [];
      }
    },

    run(...params) {
      try {
        const before = db.exec('SELECT total_changes() as tc');
        const beforeChanges = before.length > 0 ? before[0].values[0][0] : 0;

        db.run(query, params);

        const after = db.exec('SELECT total_changes() as tc, last_insert_rowid() as lid');
        const afterChanges = after.length > 0 ? after[0].values[0][0] : 0;
        const lastId = after.length > 0 ? after[0].values[0][1] : 0;

        saveDatabase();
        return {
          changes: afterChanges - beforeChanges,
          lastInsertRowid: lastId
        };
      } catch (error) {
        console.error('Prepared run error:', error.message);
        return { changes: 0, lastInsertRowid: 0 };
      }
    }
  };
}

/**
 * Execute raw SQL (for schema initialization)
 */
export async function exec(sql) {
  const db = await getConnection();
  db.run(sql);
  saveDatabase();
}

export default { all, get, run, prepare, exec };
