// Supabase Configuration
// Get credentials from: https://app.supabase.com/project/YOUR_PROJECT/settings/api
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel (and .env.local for local dev). Redeploy after changing.

function normalizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const u = url.trim();
    if (!u) return '';
    return u.startsWith('http://') || u.startsWith('https://') ? u : 'https://' + u;
}

function getConfig() {
    const fromEnv = {
        url: import.meta.env.VITE_SUPABASE_URL || '',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    };
    if (typeof window !== 'undefined' && window.__SUPABASE_URL__ != null) {
        fromEnv.url = window.__SUPABASE_URL__;
    }
    if (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__ != null) {
        fromEnv.anonKey = window.__SUPABASE_ANON_KEY__;
    }
    return {
        url: normalizeUrl(fromEnv.url),
        anonKey: (fromEnv.anonKey || '').trim()
    };
}

export const SUPABASE_CONFIG = getConfig();

// Initialize Supabase client (loaded dynamically)
let supabaseClient = null;

export async function getSupabaseClient() {
    if (supabaseClient) {
        return supabaseClient;
    }

    if (typeof window === 'undefined') return null;

    const config = getConfig();
    if (!config.url || !config.anonKey) {
        console.warn('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (e.g. in Vercel env vars).');
        return null;
    }
    if (!config.url.includes('supabase.co') && !config.url.includes('supabase.com')) {
        console.warn('Supabase URL should be your project URL, e.g. https://YOUR_REF.supabase.co');
    }

    try {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        supabaseClient = createClient(config.url, config.anonKey);
        return supabaseClient;
    } catch (e) {
        console.error('Supabase client failed to load:', e);
        return null;
    }
}

export function isSupabaseConfigured() {
    const config = getConfig();
    return !!(config.url && config.anonKey);
}
