// Admin Authentication Module – Supabase Auth
// Handles login, logout, and auth checks for admin pages

import { getSupabaseClient, isSupabaseConfigured } from './supabase-config.js';

const LOGIN_PATH = '/admin-login';

// Check if user is authenticated (Supabase session)
export async function isAuthenticated() {
    if (!isSupabaseConfigured()) return false;
    const supabase = await getSupabaseClient();
    if (!supabase) return false;
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
}

// No-op; Supabase stores the session after signIn
export function setAuthenticated() {}

// Sign out from Supabase
export async function clearAuthentication() {
    const supabase = await getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
}

// Require authentication; redirect to login if not authenticated. Returns Promise<boolean>.
export async function requireAuth() {
    const ok = await isAuthenticated();
    if (ok) return true;
    const current = window.location.pathname;
    if (!current.includes('admin-login') && !current.includes('admin-signup') && !current.includes('admin-forgot-password') && !current.includes('admin-set-password')) {
        window.location.href = LOGIN_PATH + '?redirect=' + encodeURIComponent(current);
    }
    return false;
}

// ---- Login form (only when #login-form exists, e.g. admin-login.html) ----
if (typeof document !== 'undefined' && document.getElementById('login-form')) {
    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('login-button');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('email') || document.getElementById('username'))?.value?.trim();
        const password = (document.getElementById('password'))?.value;

        if (!email || !password) {
            if (errorEl) { errorEl.textContent = 'Please enter email and password.'; errorEl.style.display = 'block'; }
            return;
        }

        if (!isSupabaseConfigured()) {
            if (errorEl) { errorEl.textContent = 'Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'; errorEl.style.display = 'block'; }
            if (btn) btn.disabled = false;
            return;
        }

        if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
        if (btn) { btn.disabled = true; btn.textContent = 'Logging in...'; }

        const supabase = await getSupabaseClient();
        if (!supabase) {
            if (errorEl) { errorEl.textContent = 'Auth not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel and redeploy.'; errorEl.style.display = 'block'; }
            if (btn) { btn.disabled = false; btn.textContent = 'Login'; return; }
        }

        let data, error;
        try {
            const result = await supabase.auth.signInWithPassword({ email, password });
            data = result.data;
            error = result.error;
        } catch (err) {
            const msg = err?.message || String(err);
            if (msg.includes('fetch') || msg.includes('Failed to fetch') || err.name === 'TypeError') {
                if (errorEl) {
                    errorEl.textContent = 'Cannot reach the auth server. Check: (1) Supabase project is not paused (Dashboard → Project Settings), (2) VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel and you redeployed.';
                    errorEl.style.display = 'block';
                }
            } else {
                if (errorEl) { errorEl.textContent = msg || 'Something went wrong.'; errorEl.style.display = 'block'; }
            }
            if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
            return;
        }

        if (error) {
            if (errorEl) { errorEl.textContent = error.message || 'Invalid email or password.'; errorEl.style.display = 'block'; }
            if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
            if (document.getElementById('password')) document.getElementById('password').value = '';
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/admin';
        window.location.href = redirect;
    });
}
