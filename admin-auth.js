// Admin Authentication Module
// This file handles login and authentication checks for admin pages

const ADMIN_SESSION_KEY = 'baw_admin_authenticated';
const ADMIN_SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

// Get credentials from environment variables
// Vite will replace these at build time with actual values from .env files or Vercel env vars
const ADMIN_USERNAME = (import.meta.env.VITE_ADMIN_USERNAME || 'admin').trim();
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD || '').trim();

// Debug: Log what values we're using (remove in production if needed)
// Note: In production build, these will be replaced with actual values
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  console.log('Admin auth loaded - username length:', ADMIN_USERNAME.length, 'password length:', ADMIN_PASSWORD.length);
}

// Check if user is authenticated
export function isAuthenticated() {
    const authData = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!authData) return false;
    
    try {
        const { timestamp } = JSON.parse(authData);
        const now = Date.now();
        
        // Check if session has expired
        if (now - timestamp > ADMIN_SESSION_TIMEOUT) {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
            return false;
        }
        
        return true;
    } catch (e) {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        return false;
    }
}

// Set authentication status
export function setAuthenticated() {
    const authData = {
        timestamp: Date.now()
    };
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(authData));
}

// Clear authentication
export function clearAuthentication() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

// Verify credentials
export function verifyCredentials(username, password) {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    // Debug logging (remove in production)
    if (typeof window !== 'undefined') {
        console.log('Verifying credentials:', {
            providedUsername: trimmedUsername,
            providedPasswordLength: trimmedPassword.length,
            expectedUsername: ADMIN_USERNAME,
            expectedPasswordLength: ADMIN_PASSWORD.length,
            usernameMatch: trimmedUsername === ADMIN_USERNAME,
            passwordMatch: trimmedPassword === ADMIN_PASSWORD
        });
    }
    
    return trimmedUsername === ADMIN_USERNAME && trimmedPassword === ADMIN_PASSWORD;
}

// Require authentication - redirect to login if not authenticated
export function requireAuth() {
    if (!isAuthenticated()) {
        const currentPath = window.location.pathname;
        const loginPath = '/admin-login.html';
        
        // Only redirect if we're not already on the login page
        if (!currentPath.includes('admin-login.html')) {
            window.location.href = loginPath + '?redirect=' + encodeURIComponent(currentPath);
        }
        return false;
    }
    return true;
}

// Handle login form submission
if (document.getElementById('login-form')) {
    const loginForm = document.getElementById('login-form');
    const errorDiv = document.getElementById('login-error');
    const loginButton = document.getElementById('login-button');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Hide previous errors
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        
        // Disable button during check
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';
        
        // Verify credentials
        if (verifyCredentials(username, password)) {
            setAuthenticated();
            
            // Get redirect URL or default to admin blog
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect') || '/admin/blog.html';
            
            // Redirect to admin area
            window.location.href = redirect;
        } else {
            // Show error
            errorDiv.textContent = 'Invalid username or password';
            errorDiv.style.display = 'block';
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
            
            // Clear password field
            document.getElementById('password').value = '';
        }
    });
}

// Auto-check authentication on admin pages
// This runs automatically if the script is loaded on an admin page
// For admin pages, import this module and call requireAuth() at the top of your page script

