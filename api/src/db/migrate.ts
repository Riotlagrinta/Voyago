import fs from 'fs';
import path from 'path';
import { pool } from '../lib/prisma';

const run = async () => {
  const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  await pool.query(sql);
  console.log('✅ Migration 001 appliquée');
  await pool.end();
};

void run();
