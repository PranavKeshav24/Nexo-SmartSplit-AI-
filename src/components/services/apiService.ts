const BASE_URL = 'http://localhost:4000/api'; // Your backend server is running on port 4000

// Utility function to include headers and authentication
const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('jwtToken'); 

    const headers = {
        'Content-Type': 'application/json',
        // CRITICAL: Adding the Authorization header with the Bearer token
        ...(token && { 'Authorization': `Bearer ${token}` }), 
        ...(options.headers || {}),
    };

    const config: RequestInit = {
        ...options,
        headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (response.status === 401 || response.status === 403) {
        // Handle token expiration/invalid credentials
        console.error("Authentication error. Token invalid or expired.");
        // Optional: clear token and force redirect to login
        // localStorage.removeItem('jwtToken');
        // window.location.href = '/'; 
    }

    return response;
};

// -------------------------------------------------------------
// API Functions for Auth Endpoints
// -------------------------------------------------------------

// 1. LOGIN API (POST /auth/login)
export const loginUser = async (email: string, password: string) => {
    const response = await authenticatedFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    
    if (response.ok && data.token) {
        // SUCCESS: Store the token for future requests
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('username', data.username); // Store username for display
    }
    return { ok: response.ok, message: data.message, username: data.username };
};

// 2. SIGN UP API (POST /auth/register)
export const registerUser = async (username: string, email: string, password: string) => {
    const response = await authenticatedFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    
    return { ok: response.ok, message: data.message };
};