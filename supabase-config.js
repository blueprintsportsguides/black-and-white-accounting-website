// Supabase Configuration
// Replace these with your actual Supabase project credentials
// Get them from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

// IMPORTANT: Set your Supabase credentials here for static HTML sites
// For Vercel deployment, you can also set these as environment variables
// and use the /api/config endpoint pattern
const HARDCODED_URL = 'https://hapkzfobjmhpcdzzyzgd.supabase.co';
const HARDCODED_ANON_KEY = ''; // ADD YOUR ANON KEY HERE

// Try multiple methods to get config
function getConfig() {
    // Method 1: Check if Vite env vars are available (for Vite builds)
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            const url = import.meta.env.VITE_SUPABASE_URL;
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
            if (url && key) {
                return { url, anonKey: key };
            }
        }
    } catch (e) {
        // import.meta not available
    }
    
    // Method 2: Check window global (can be set by script tag)
    if (typeof window !== 'undefined' && window.SUPABASE_CONFIG) {
        if (window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey) {
            return window.SUPABASE_CONFIG;
        }
    }
    
    // Method 3: Use hardcoded values
    if (HARDCODED_URL && HARDCODED_ANON_KEY) {
        return { url: HARDCODED_URL, anonKey: HARDCODED_ANON_KEY };
    }
    
    return { url: '', anonKey: '' };
}

export const SUPABASE_CONFIG = getConfig();

// Initialize Supabase client (will be loaded dynamically)
let supabaseClient = null;

export async function getSupabaseClient() {
    if (supabaseClient) {
        return supabaseClient;
    }
    
    // Dynamically import Supabase client
    if (typeof window !== 'undefined') {
        // Re-check config in case it was set after initial load
        const config = getConfig();
        
        if (!config.url || !config.anonKey) {
            console.warn('Supabase not configured. Add your anon key to supabase-config.js');
            console.warn('Your Supabase URL appears to be:', HARDCODED_URL);
            return null;
        }
        
        try {
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            supabaseClient = createClient(config.url, config.anonKey);
            console.log('Supabase client initialized successfully');
            return supabaseClient;
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            return null;
        }
    }
    
    return null;
}

// Check if Supabase is configured
export function isSupabaseConfigured() {
    const config = getConfig();
    return !!(config.url && config.anonKey);
}
