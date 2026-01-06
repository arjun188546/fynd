import dotenv from 'dotenv';
import pool from './db';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

async function migrate() {
    const client = await pool.connect();

    try {
        console.log('\n🔄 [MIGRATION] Starting database migration...');

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        let schema = fs.readFileSync(schemaPath, 'utf-8');

        // Hash admin password
        const adminPasswordHash = await bcrypt.hash('admin@boo', 10);
        schema = schema.replace('$2b$10$YourHashedPasswordHere', adminPasswordHash);

        // Execute schema
        await client.query(schema);

        console.log('✅ [MIGRATION] Database schema created successfully');
        console.log('✅ [MIGRATION] Admin user created (email: admin@email.com)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ [MIGRATION] Migration failed:', error);
        process.exit(1);
    } finally {
        client.release();
    }
}

migrate();
