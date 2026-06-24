import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://shivam@localhost:5432/reloop',
});

export default pool;
