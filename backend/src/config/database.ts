import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database;

export async function initDB() {
  const dbPath = path.join(__dirname, '../../../database/claimdesk.sqlite');
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  await db.exec('PRAGMA foreign_keys = ON;');
  console.log('✅ Connected to SQLite database');
}

function parseRowJson(row: any) {
  if (!row || typeof row !== 'object') return row;
  const jsonKeys = ['document_paths', 'priority_reason', 'metadata'];
  for (const key of jsonKeys) {
    if (typeof row[key] === 'string') {
      try {
        row[key] = JSON.parse(row[key]);
      } catch {
        // Keep as string if parsing fails
      }
    }
  }
  return row;
}

export const query = async (text: string, params: any[] = []) => {
  if (!db) await initDB();
  
  // Convert Postgres $1, $2 to SQLite ?
  let sqliteText = text.replace(/\$\d+/g, '?');
  
  const isSelectOrReturning = /^\s*(SELECT|INSERT|UPDATE|DELETE)[\s\S]*\bRETURNING\b/i.test(sqliteText) || /^\s*SELECT\b/i.test(sqliteText);
  
  try {
    if (isSelectOrReturning) {
      const rows = await db.all(sqliteText, params);
      const parsedRows = (rows || []).map(parseRowJson);
      return { rows: parsedRows, rowCount: parsedRows.length };
    } else {
      const result = await db.run(sqliteText, params);
      return { rows: [], rowCount: result.changes };
    }
  } catch (err) {
    console.error('SQLite query error:', err, 'Query:', sqliteText);
    throw err;
  }
};
