// Supabase Configuration
// Replace these with your actual Supabase project credentials
// Get them from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

export const SUPABASE_CONFIG = {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
};

// Initialize Supabase client (will be loaded dynamically)
let supabaseClient = null;

export async function getSupabaseClient() {
    if (supabaseClient) {
        return supabaseClient;
    }
    
    // Dynamically import Supabase client
    if (typeof window !== 'undefined') {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        
        if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
            console.warn('Supabase not configured. Using localStorage fallback.');
            return null;
        }
        
        supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        return supabaseClient;
    }
    
    return null;
}

// Check if Supabase is configured
export function isSupabaseConfigured() {
    return !!(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
}
