import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables BEFORE creating pool
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ [DATABASE] Connected to PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ [DATABASE] Unexpected error:', err);
});

export default pool;
