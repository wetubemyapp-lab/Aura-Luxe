import { PGlite } from '@electric-sql/pglite';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.resolve(process.cwd(), 'data/pgdata');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const pg = new PGlite(DB_DIR);

export async function initDatabase() {
  console.log('Initializing Universal Business Platform OS Database...');

  // Load new core schema
  const schemaPath = path.resolve(process.cwd(), 'server/db/schema.sql');
  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    
    for (const stmt of statements) {
        await pg.exec(stmt);
    }
  } catch (e) {
    console.error('Error executing schema:', e);
    throw e;
  }

  console.log('PostgreSQL database engine & relational schemas verified.');
}

export async function logAuditEvent(params: {
  business_id?: number;
  user_id?: number | null;
  user_name?: string | null;
  user_role?: string | null;
  action: string;
  entity_type: string;
  entity_id?: number | null;
  details?: any;
  ip_address?: string;
}) {
  try {
    await pg.query(
      `INSERT INTO audit_logs (business_id, user_id, user_name, user_role, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        params.business_id || 1,
        params.user_id || null,
        params.user_name || 'System',
        params.user_role || 'system',
        params.action,
        params.entity_type,
        params.entity_id || null,
        JSON.stringify(params.details || {}),
        params.ip_address || '127.0.0.1'
      ]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
