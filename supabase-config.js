// Supabase Configuration
// Environment variables are set in Vercel dashboard
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

// Get config from Vite environment variables (injected at build time)
function getConfig() {
    let url = '';
    let anonKey = '';
    
    // Try Vite env vars (works during Vite build)
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            url = import.meta.env.VITE_SUPABASE_URL || '';
            anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        }
    } catch (e) {
        // import.meta not available
    }
    
    // Fallback: check window global (can be set by script tag if needed)
    if ((!url || !anonKey) && typeof window !== 'undefined' && window.SUPABASE_CONFIG) {
        url = window.SUPABASE_CONFIG.url || url;
        anonKey = window.SUPABASE_CONFIG.anonKey || anonKey;
    }
    
    return { url, anonKey };
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
        const config = getConfig();
        
        if (!config.url || !config.anonKey) {
            console.warn('Supabase not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars.');
            return null;
        }
        
        try {
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            supabaseClient = createClient(config.url, config.anonKey);
            console.log('Supabase client initialized');
            return supabaseClient;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
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
