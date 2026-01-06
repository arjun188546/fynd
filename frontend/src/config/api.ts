// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
    // Auth
    ADMIN_LOGIN: `${API_URL}/api/auth/admin/login`,
    REGISTER: `${API_URL}/api/auth/register`,
    LOGOUT: `${API_URL}/api/auth/logout`,
    ME: `${API_URL}/api/auth/me`,

    // Feedback
    SUBMIT_FEEDBACK: `${API_URL}/api/feedback/submit`,
    GET_SUBMISSIONS: `${API_URL}/api/feedback/admin/submissions`,

    // Admin Chat
    ADMIN_CHAT: `${API_URL}/api/admin/chat`,

    // Health
    HEALTH: `${API_URL}/api/health`,
};

export default API_URL;
