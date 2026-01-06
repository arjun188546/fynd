// API Configuration with runtime detection
const getApiUrl = () => {
    // Check if we're in production (deployed on Render)
    if (window.location.hostname.includes('render.com') ||
        window.location.hostname.includes('onrender.com')) {
        // Production: Use the backend service URL
        return 'https://fyndfeed.onrender.com';
    }

    // Development: Use localhost
    return 'http://localhost:3001';
};

const API_URL = getApiUrl();

console.log('🌐 [API CONFIG] Environment:', window.location.hostname);
console.log('🔗 [API CONFIG] Backend URL:', API_URL);

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
