import supabase from './supabase';
import bcrypt from 'bcryptjs';

// User database operations using Supabase
export const userDb = {
    // Find user by email
    async findByEmail(email: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            console.error('[SUPABASE] Error finding user:', error);
        }
        return data;
    },

    // Find user by ID
    async findById(id: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('[SUPABASE] Error finding user by ID:', error);
        }
        return data;
    },

    // Create new user
    async create(user: {
        id: string;
        email: string;
        name: string;
        password?: string;
        googleId?: string;
        role: 'user' | 'admin';
    }) {
        const { data, error } = await supabase
            .from('users')
            .insert([{
                id: user.id,
                email: user.email.toLowerCase(),
                name: user.name,
                password: user.password,
                google_id: user.googleId,
                role: user.role
            }])
            .select()
            .single();

        if (error) {
            console.error('[SUPABASE] Error creating user:', error);
            throw error;
        }
        return data;
    },

    // Verify password
    async verifyPassword(email: string, password: string) {
        const user = await this.findByEmail(email);
        if (!user || !user.password) {
            return null;
        }
        const isValid = await bcrypt.compare(password, user.password);
        return isValid ? user : null;
    }
};

// Feedback database operations using Supabase
export const feedbackDb = {
    // Create new feedback submission
    async create(feedback: {
        id: string;
        userId: string;
        name?: string;
        email?: string;
        rating: number;
        review: string;
        aiSummary: string;
        recommendedActions: string[];
        userResponse: string;
    }) {
        const { data, error } = await supabase
            .from('feedback_submissions')
            .insert([{
                id: feedback.id,
                user_id: feedback.userId,
                name: feedback.name,
                email: feedback.email,
                rating: feedback.rating,
                review: feedback.review,
                ai_summary: feedback.aiSummary,
                recommended_actions: feedback.recommendedActions,
                user_response: feedback.userResponse
            }])
            .select()
            .single();

        if (error) {
            console.error('[SUPABASE] Error creating feedback:', error);
            throw error;
        }
        return data;
    },

    // Get all feedback submissions
    async getAll() {
        const { data, error } = await supabase
            .from('feedback_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[SUPABASE] Error fetching feedback:', error);
            return [];
        }

        // Convert snake_case to camelCase for frontend
        return (data || []).map(row => ({
            id: row.id,
            userId: row.user_id,
            name: row.name,
            email: row.email,
            rating: row.rating,
            review: row.review,
            aiSummary: row.ai_summary,
            recommendedActions: row.recommended_actions,
            userResponse: row.user_response,
            createdAt: row.created_at
        }));
    },

    // Get feedback by user ID
    async getByUserId(userId: string) {
        const { data, error } = await supabase
            .from('feedback_submissions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[SUPABASE] Error fetching user feedback:', error);
            return [];
        }

        return (data || []).map(row => ({
            id: row.id,
            userId: row.user_id,
            rating: row.rating,
            review: row.review,
            aiSummary: row.ai_summary,
            recommendedActions: row.recommended_actions,
            userResponse: row.user_response,
            createdAt: row.created_at
        }));
    }
};

// Initialize database (create admin user if not exists)
export async function initializeDatabase() {
    try {
        console.log('🔄 [SUPABASE] Initializing database...');

        // Check if admin exists
        const admin = await userDb.findByEmail('admin@email.com');

        if (!admin) {
            // Create admin user
            const adminPasswordHash = await bcrypt.hash('admin@boo', 10);
            await userDb.create({
                id: 'admin-1',
                email: 'admin@email.com',
                name: 'Admin',
                password: adminPasswordHash,
                role: 'admin'
            });
            console.log('✅ [SUPABASE] Admin user created');
        } else {
            console.log('✅ [SUPABASE] Admin user already exists');
        }
    } catch (error) {
        console.error('❌ [SUPABASE] Initialization error:', error);
    }
}
