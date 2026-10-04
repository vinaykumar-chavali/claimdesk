import { Pool, QueryResult } from 'pg';
import path from 'path';
import { env } from './env';

let pgPool: Pool | null = null;
let sqliteDb: any = null;

const isPostgres = 
  env.DATABASE_ENGINE === 'postgres' || 
  (env.DATABASE_ENGINE === 'auto' && !!env.DATABASE_URL && (env.DATABASE_URL.startsWith('postgres://') || env.DATABASE_URL.startsWith('postgresql://')));

export async function initDB() {
  if (isPostgres) {
    if (!pgPool) {
      const isSSLRequired = env.DATABASE_URL?.includes('sslmode=require') || env.NODE_ENV === 'production';
      pgPool = new Pool({
        connectionString: env.DATABASE_URL,
        ssl: isSSLRequired ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Test connection
      const client = await pgPool.connect();
      client.release();
      console.log('✅ Connected to PostgreSQL database');
    }
  } else {
    if (!sqliteDb) {
      try {
        const sqlite3 = require('sqlite3');
        const { open } = require('sqlite');
        const dbPath = path.resolve(process.cwd(), '../database/claimdesk.sqlite');
        sqliteDb = await open({
          filename: dbPath,
          driver: sqlite3.Database
        });
        await sqliteDb.exec('PRAGMA foreign_keys = ON;');
        console.log('✅ Connected to SQLite database');
      } catch (err: any) {
        console.warn('SQLite fallback unavailable:', err.message);
      }
    }
  }
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

export const query = async (text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> => {
  if (isPostgres) {
    if (!pgPool) await initDB();
    try {
      const result: QueryResult = await pgPool!.query(text, params);
      const parsedRows = (result.rows || []).map(parseRowJson);
      return { rows: parsedRows, rowCount: result.rowCount ?? parsedRows.length };
    } catch (err) {
      console.error('PostgreSQL query error:', err, 'Query:', text);
      throw err;
    }
  } else {
    if (!sqliteDb) await initDB();
    if (!sqliteDb) {
      throw new Error('Database is not connected');
    }
    
    // Convert Postgres $1, $2 to SQLite ?
    let sqliteText = text.replace(/\$\d+/g, '?');
    
    const isSelectOrReturning = /^\s*(SELECT|INSERT|UPDATE|DELETE)[\s\S]*\bRETURNING\b/i.test(sqliteText) || /^\s*SELECT\b/i.test(sqliteText);
    
    try {
      if (isSelectOrReturning) {
        const rows = await sqliteDb.all(sqliteText, params);
        const parsedRows = (rows || []).map(parseRowJson);
        return { rows: parsedRows, rowCount: parsedRows.length };
      } else {
        const result = await sqliteDb.run(sqliteText, params);
        return { rows: [], rowCount: result.changes ?? 0 };
      }
    } catch (err) {
      console.error('SQLite query error:', err, 'Query:', sqliteText);
      throw err;
    }
  }
};
