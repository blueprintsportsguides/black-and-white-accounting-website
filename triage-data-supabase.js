/**
 * Triage System - Supabase data layer
 * Uses profiles (auth users), triage_categories, triage_entries.
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabase-config.js';

function toIso(date) {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Ensure current user has a profile. Call after getSession.
 * @param {{ id: string, email?: string, user_metadata?: { full_name?: string } }} user
 */
export async function ensureProfile(user) {
  if (!user?.id || !isSupabaseConfigured()) return;
  const supabase = await getSupabaseClient();
  if (!supabase) return;
  const display = user.user_metadata?.full_name || user.email || 'User';
  await supabase.from('profiles').upsert(
    { id: user.id, email: user.email || null, display_name: display, updated_at: toIso(new Date()) },
    { onConflict: 'id' }
  );
}

/**
 * Get current user from session and ensure profile exists.
 * @returns {Promise<{ id: string, email: string, display_name: string }|null>}
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await getSupabaseClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  await ensureProfile(user);
  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single();
  return {
    id: user.id,
    email: user.email || '',
    display_name: profile?.display_name || user.user_metadata?.full_name || user.email || 'User'
  };
}

/**
 * Team members = all profiles (for Assign To dropdown and filter).
 * @returns {Promise<Array<{ id: string, email: string, display_name: string }>>}
 */
export async function getTeamMembers() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from('profiles').select('id, email, display_name').order('display_name');
  if (error) {
    console.error('getTeamMembers:', error);
    return [];
  }
  return (data || []).map(p => ({ id: p.id, email: p.email || '', display_name: p.display_name || p.email || 'User' }));
}

/**
 * @returns {Promise<string[]>} category names, sorted
 */
export async function getCategories() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from('triage_categories').select('name').order('name');
  if (error) {
    console.error('getCategories:', error);
    return [];
  }
  return (data || []).map(r => r.name).filter(Boolean);
}

/**
 * @param {string} name
 * @returns {Promise<boolean>}
 */
export async function addCategory(name) {
  const n = (name || '').trim();
  if (!n || !isSupabaseConfigured()) return false;
  const supabase = await getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('triage_categories').insert({ name: n });
  if (error) {
    if (error.code === '23505') return false; // unique
    console.error('addCategory:', error);
    return false;
  }
  return true;
}

/**
 * Map DB row to UI shape (assigned_to_name, created_by_name, category, etc.)
 */
function mapEntry(row) {
  return {
    id: row.id,
    clientName: row.client_name,
    businessName: row.business_name || '',
    clientPhone: row.client_phone || '',
    clientEmail: row.client_email || '',
    description: row.description,
    importance: row.importance,
    assignedTo: row.assigned_to_name || '',
    assigned_to_id: row.assigned_to_id || null,
    status: row.status,
    deadline: row.deadline || '',
    notes: row.notes || '',
    category: row.category_name || '',
    category_id: row.category_id || null,
    confirmation1: !!row.confirmation1,
    confirmation2: !!row.confirmation2,
    confirmation3: !!row.confirmation3,
    createdBy: row.created_by_name || '',
    createdByEmail: row.created_by_email || '',
    created_by_id: row.created_by_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at || null
  };
}

/**
 * Active entries (archived_at IS NULL).
 * @returns {Promise<Array>}
 */
export async function getTriageEntries() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('triage_entries')
    .select(`
      id, client_name, business_name, client_phone, client_email, description, importance,
      assigned_to_id, status, deadline, notes, category_id, confirmation1, confirmation2, confirmation3,
      created_by_id, created_at, updated_at, archived_at,
      assigned:profiles!assigned_to_id(display_name, email),
      created:profiles!created_by_id(display_name, email),
      cat:triage_categories!category_id(name)
    `)
    .is('archived_at', null)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getTriageEntries:', error);
    return [];
  }
  return (data || []).map(row => {
    const a = row.assigned;
    const c = row.created;
    const cat = row.cat;
    return mapEntry({
      ...row,
      assigned_to_name: (Array.isArray(a) ? a[0] : a)?.display_name || (Array.isArray(a) ? a[0] : a)?.email,
      created_by_name: (Array.isArray(c) ? c[0] : c)?.display_name || (Array.isArray(c) ? c[0] : c)?.email,
      created_by_email: (Array.isArray(c) ? c[0] : c)?.email,
      category_name: (Array.isArray(cat) ? cat[0] : cat)?.name
    });
  });
}

/**
 * Archived entries (archived_at IS NOT NULL).
 * @returns {Promise<Array>}
 */
export async function getArchivedTriage() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('triage_entries')
    .select(`
      id, client_name, business_name, client_phone, client_email, description, importance,
      assigned_to_id, status, deadline, notes, category_id, confirmation1, confirmation2, confirmation3,
      created_by_id, created_at, updated_at, archived_at,
      assigned:profiles!assigned_to_id(display_name, email),
      created:profiles!created_by_id(display_name, email),
      cat:triage_categories!category_id(name)
    `)
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false });
  if (error) {
    console.error('getArchivedTriage:', error);
    return [];
  }
  return (data || []).map(row => {
    const a = row.assigned;
    const c = row.created;
    const cat = row.cat;
    return mapEntry({
      ...row,
      assigned_to_name: (Array.isArray(a) ? a[0] : a)?.display_name || (Array.isArray(a) ? a[0] : a)?.email,
      created_by_name: (Array.isArray(c) ? c[0] : c)?.display_name || (Array.isArray(c) ? c[0] : c)?.email,
      created_by_email: (Array.isArray(c) ? c[0] : c)?.email,
      category_name: (Array.isArray(cat) ? cat[0] : cat)?.name
    });
  });
}

/**
 * @param {object} t - UI shape (clientName, businessName, ... assigned_to_id, category_id, etc.)
 * @param {string} createdById
 * @returns {Promise<{ id: string }|null>}
 */
export async function createTriage(t, createdById) {
  if (!isSupabaseConfigured() || !createdById) return null;
  const supabase = await getSupabaseClient();
  if (!supabase) return null;
  let cid = t.category_id || null;
  if (!cid && (t.category || '').trim()) cid = await resolveCategoryId(t.category.trim(), true);
  const row = {
    client_name: t.clientName || '',
    business_name: t.businessName || null,
    client_phone: t.clientPhone || null,
    client_email: t.clientEmail || null,
    description: t.description || '',
    importance: t.importance || 'medium',
    assigned_to_id: t.assigned_to_id || null,
    status: t.status || 'open',
    deadline: t.deadline ? toIso(t.deadline) : null,
    notes: t.notes || null,
    category_id: cid,
    confirmation1: !!t.confirmation1,
    confirmation2: !!t.confirmation2,
    confirmation3: !!t.confirmation3,
    created_by_id: createdById
  };
  const { data, error } = await supabase.from('triage_entries').insert(row).select('id').single();
  if (error) {
    console.error('createTriage:', error);
    return null;
  }
  return { id: data.id };
}

/**
 * @param {string} id
 * @param {object} t - UI shape, partial ok
 * @returns {Promise<boolean>}
 */
export async function updateTriage(id, t) {
  if (!id || !isSupabaseConfigured()) return false;
  const supabase = await getSupabaseClient();
  if (!supabase) return false;
  let cid = null;
  if (t.category_id != null && t.category_id !== '') cid = t.category_id;
  else if ((t.category || '').trim()) cid = await resolveCategoryId(t.category.trim(), true);
  const row = {};
  if (t.clientName !== undefined) row.client_name = t.clientName;
  if (t.businessName !== undefined) row.business_name = t.businessName || null;
  if (t.clientPhone !== undefined) row.client_phone = t.clientPhone || null;
  if (t.clientEmail !== undefined) row.client_email = t.clientEmail || null;
  if (t.description !== undefined) row.description = t.description;
  if (t.importance !== undefined) row.importance = t.importance;
  if (t.assigned_to_id !== undefined) row.assigned_to_id = t.assigned_to_id || null;
  if (t.status !== undefined) row.status = t.status;
  if (t.deadline !== undefined) row.deadline = t.deadline ? toIso(t.deadline) : null;
  if (t.notes !== undefined) row.notes = t.notes || null;
  if ('category' in t || 'category_id' in t) row.category_id = cid;
  if (t.confirmation1 !== undefined) row.confirmation1 = !!t.confirmation1;
  if (t.confirmation2 !== undefined) row.confirmation2 = !!t.confirmation2;
  if (t.confirmation3 !== undefined) row.confirmation3 = !!t.confirmation3;
  row.updated_at = toIso(new Date());
  const { error } = await supabase.from('triage_entries').update(row).eq('id', id);
  if (error) {
    console.error('updateTriage:', error);
    return false;
  }
  return true;
}

/**
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteTriage(id) {
  if (!id || !isSupabaseConfigured()) return false;
  const supabase = await getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('triage_entries').delete().eq('id', id);
  if (error) {
    console.error('deleteTriage:', error);
    return false;
  }
  return true;
}

/**
 * Set archived_at = now().
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function archiveTriage(id) {
  if (!id || !isSupabaseConfigured()) return false;
  const supabase = await getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('triage_entries').update({ archived_at: toIso(new Date()), updated_at: toIso(new Date()) }).eq('id', id);
  if (error) {
    console.error('archiveTriage:', error);
    return false;
  }
  return true;
}

/**
 * Resolve category name to id. If not found and createIfMissing, insert.
 * @param {string} name
 * @param {boolean} createIfMissing
 * @returns {Promise<string|null>}
 */
export async function resolveCategoryId(name, createIfMissing = false) {
  const n = (name || '').trim();
  if (!n) return null;
  const supabase = await getSupabaseClient();
  if (!supabase) return null;
  let { data } = await supabase.from('triage_categories').select('id').eq('name', n).maybeSingle();
  if (data?.id) return data.id;
  if (createIfMissing) {
    const { data: ins } = await supabase.from('triage_categories').insert({ name: n }).select('id').single();
    return ins?.id || null;
  }
  return null;
}
