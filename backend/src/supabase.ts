import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ [SUPABASE] Missing SUPABASE_URL or SUPABASE_KEY');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ [SUPABASE] Client initialized');

export default supabase;
