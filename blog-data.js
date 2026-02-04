// Blog Data Storage and Management
// Priority: Supabase (when configured) > JSON file > localStorage
// Supabase provides centralized storage; import via /admin/import-json-to-supabase

import { isSupabaseConfigured } from './supabase-config.js';
import * as supabaseFunctions from './blog-data-supabase.js';

const STORAGE_KEY = 'baw_blog_posts';
const CATEGORIES_KEY = 'baw_blog_categories';
const TAGS_KEY = 'baw_blog_tags';
const JSON_SOURCE = '/data/blog-posts.json';
const DATA_LOADED_KEY = 'baw_data_loaded_from_json';

// Cache for loaded data
let dataCache = {
    posts: null,
    categories: null,
    tags: null
};

// Load data from Supabase (when configured). When Supabase has posts, merge in any from JSON that aren't in Supabase so imported posts don't disappear.
async function loadDataFromSupabase() {
    if (!isSupabaseConfigured()) return false;
    try {
        const [posts, categories, tags] = await Promise.all([
            supabaseFunctions.loadPostsFromSupabase(),
            supabaseFunctions.loadCategoriesFromSupabase(),
            supabaseFunctions.loadTagsFromSupabase()
        ]);
        if (!posts || !Array.isArray(posts)) return false;
        
        const supabasePosts = posts.map(p => ({ ...p, tags: p.tags || p.tag_slugs || [] }));
        const supabaseIds = new Set(supabasePosts.map(p => p.id));
        const supabaseLegacyIds = new Set(supabasePosts.map(p => p.legacy_wp_id).filter(Boolean));
        
        // If Supabase has posts, merge in any from JSON that aren't already in Supabase (so imported blogs don't disappear)
        if (supabasePosts.length > 0) {
            try {
                const res = await fetch(JSON_SOURCE);
                if (res.ok) {
                    const json = await res.json();
                    const raw = json.posts || [];
                    for (const p of raw) {
                        const id = p.id || p.legacy_wp_id || p.slug;
                        if (!id || supabaseIds.has(id) || supabaseLegacyIds.has(String(p.legacy_wp_id))) continue;
                        const category_id = p.category_id || (p.category_slug && json.categories?.length ? (json.categories.find(c => (c.slug || c.id) === p.category_slug)?.id) : null) || p.category_slug;
                        supabasePosts.push({
                            ...p,
                            id: id,
                            category_id: category_id || null,
                            tags: p.tags || p.tag_slugs || []
                        });
                        supabaseIds.add(id);
                        if (p.legacy_wp_id) supabaseLegacyIds.add(String(p.legacy_wp_id));
                    }
                }
            } catch (_) {}
        }
        
        dataCache.posts = supabasePosts;
        dataCache.categories = (categories && Array.isArray(categories)) ? categories : [];
        dataCache.tags = (tags && Array.isArray(tags)) ? tags : [];
        if (dataCache.categories.length === 0) initDefaultCategories();
        if (dataCache.tags.length === 0) initDefaultTags();
        return supabasePosts.length > 0;
    } catch (error) {
        console.warn('Error loading data from Supabase:', error);
        return false;
    }
}

// Load data from JSON file (fallback when Supabase not configured or failed)
async function loadDataFromJSON() {
    try {
        const response = await fetch(JSON_SOURCE);
        if (!response.ok) {
            console.warn('Could not load blog data from JSON file, using localStorage fallback');
            return false;
        }
        const jsonData = await response.json();
        const rawPosts = jsonData.posts || [];

        // Normalize: ensure id, category_id, tags for each post
        const posts = rawPosts.map(p => {
            const id = p.id || p.legacy_wp_id || p.slug || generateId();
            let category_id = p.category_id;
            if (!category_id && p.category_slug && jsonData.categories?.length) {
                const cat = jsonData.categories.find(c => (c.slug || c.id) === p.category_slug);
                if (cat) category_id = cat.id;
            }
            if (!category_id && p.category_slug) category_id = p.category_slug;
            return {
                ...p,
                id,
                category_id: category_id || null,
                tags: p.tags || p.tag_slugs || []
            };
        });

        dataCache.posts = posts;
        dataCache.categories = jsonData.categories && jsonData.categories.length > 0 ? jsonData.categories : [];
        dataCache.tags = jsonData.tags && jsonData.tags.length > 0 ? jsonData.tags : [];

        if (dataCache.posts.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataCache.posts));
        }
        if (dataCache.categories.length > 0) {
            localStorage.setItem(CATEGORIES_KEY, JSON.stringify(dataCache.categories));
        }
        if (dataCache.tags.length > 0) {
            localStorage.setItem(TAGS_KEY, JSON.stringify(dataCache.tags));
        }
        if (dataCache.categories.length === 0) initDefaultCategories();
        if (dataCache.tags.length === 0) initDefaultTags();

        localStorage.setItem(DATA_LOADED_KEY, 'true');
        return true;
    } catch (error) {
        console.warn('Error loading blog data from JSON:', error);
        return false;
    }
}

// Initialize: Supabase first (when configured), then JSON, then localStorage
let initializationPromise = null;
function ensureDataLoaded() {
    if (!initializationPromise) {
        initializationPromise = (async () => {
            let loaded = false;
            if (isSupabaseConfigured()) {
                loaded = await loadDataFromSupabase();
            }
            if (!loaded) {
                loaded = await loadDataFromJSON();
            }
            if (!loaded) {
                const localPosts = localStorage.getItem(STORAGE_KEY);
                const localCategories = localStorage.getItem(CATEGORIES_KEY);
                const localTags = localStorage.getItem(TAGS_KEY);
                if (localPosts) dataCache.posts = JSON.parse(localPosts);
                if (localCategories) dataCache.categories = JSON.parse(localCategories);
                if (localTags) dataCache.tags = JSON.parse(localTags);
            }
            if (!dataCache.posts) dataCache.posts = [];
            if (!dataCache.categories || dataCache.categories.length === 0) {
                initDefaultCategories();
            }
            if (!dataCache.tags || dataCache.tags.length === 0) {
                initDefaultTags();
            }
        })();
    }
    return initializationPromise;
}

// Reset and reload (e.g. after Import JSON to Supabase) so next ensureDataLoaded() fetches again
export function resetDataCache() {
    initializationPromise = null;
    dataCache.posts = null;
    dataCache.categories = null;
    dataCache.tags = null;
}

// Initialize default categories if none exist
function initDefaultCategories() {
    const existing = getCategoriesSyncInternal();
    if (existing.length === 0) {
        const defaults = [
            { id: 'tax', name: 'Tax', slug: 'tax' },
            { id: 'accounts', name: 'Accounts', slug: 'accounts' },
            { id: 'advisory', name: 'Advisory', slug: 'advisory' },
            { id: 'business', name: 'Business', slug: 'business' },
            { id: 'news', name: 'News', slug: 'news' }
        ];
        dataCache.categories = defaults;
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaults));
        return defaults;
    }
    return existing;
}

// Initialize default tags if none exist
function initDefaultTags() {
    const existing = getTagsSyncInternal();
    if (existing.length === 0) {
        const defaults = [
            { id: 'self-assessment', name: 'Self Assessment', slug: 'self-assessment' },
            { id: 'vat', name: 'VAT', slug: 'vat' },
            { id: 'corporation-tax', name: 'Corporation Tax', slug: 'corporation-tax' },
            { id: 'planning', name: 'Planning', slug: 'planning' },
            { id: 'compliance', name: 'Compliance', slug: 'compliance' }
        ];
        dataCache.tags = defaults;
        localStorage.setItem(TAGS_KEY, JSON.stringify(defaults));
        return defaults;
    }
    return existing;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Calculate reading time (average 200 words per minute)
function calculateReadingTime(content) {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes;
}

// Generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Ensure unique slug
function ensureUniqueSlug(slug, excludeId = null) {
    const posts = getAllPostsSyncInternal();
    let uniqueSlug = slug;
    let counter = 1;
    
    while (posts.some(p => p.slug === uniqueSlug && p.id !== excludeId)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }
    
    return uniqueSlug;
}

// Internal synchronous getters (use cache or localStorage)
function getAllPostsSyncInternal() {
    if (dataCache.posts !== null) {
        return dataCache.posts;
    }
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function getCategoriesSyncInternal() {
    if (dataCache.categories !== null) {
        return dataCache.categories;
    }
    const data = localStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
}

function getTagsSyncInternal() {
    if (dataCache.tags !== null) {
        return dataCache.tags;
    }
    const data = localStorage.getItem(TAGS_KEY);
    return data ? JSON.parse(data) : [];
}

// Main exported functions (sync - data loads in background automatically)
export function getAllPosts() {
    ensureDataLoaded(); // Trigger background load (non-blocking)
    return getAllPostsSyncInternal();
}

export function getPublishedPosts() {
    ensureDataLoaded(); // Trigger background load (non-blocking)
    return getAllPostsSyncInternal().filter(post => post.status === 'published');
}

export function getPostById(id) {
    ensureDataLoaded(); // Trigger background load (non-blocking)
    const posts = getAllPostsSyncInternal();
    return posts.find(p => p.id === id);
}

export function getPostBySlug(slug) {
    ensureDataLoaded(); // Trigger background load (non-blocking)
    const posts = getAllPostsSyncInternal();
    return posts.find(p => p.slug === slug && p.status === 'published');
}

// Exported sync versions for explicit use
export function getAllPostsSync() {
    return getAllPostsSyncInternal();
}

export function getPublishedPostsSync() {
    return getAllPostsSyncInternal().filter(post => post.status === 'published');
}

export function getPostByIdSync(id) {
    const posts = getAllPostsSyncInternal();
    return posts.find(p => p.id === id);
}

export function getPostBySlugSync(slug) {
    const posts = getAllPostsSyncInternal();
    return posts.find(p => p.slug === slug && p.status === 'published');
}

// Get categories (sync - uses cache/localStorage)
export function getCategories() {
    return getCategoriesSyncInternal();
}

// Exported sync version
export function getCategoriesSync() {
    return getCategoriesSyncInternal();
}

// Get tags (sync - uses cache/localStorage)
export function getTags() {
    return getTagsSyncInternal();
}

// Exported sync version
export function getTagsSync() {
    return getTagsSyncInternal();
}

// Save post (to Supabase if configured, otherwise localStorage)
export async function savePost(postData) {
    const posts = getAllPostsSyncInternal();
    const now = new Date().toISOString();
    
    // Check for existing post by ID
    let existingIndex = -1;
    if (postData.id) {
        existingIndex = posts.findIndex(p => p.id === postData.id);
    }
    
    // Check for existing post by legacy_wp_id (for imports)
    if (existingIndex === -1 && postData.legacy_wp_id) {
        existingIndex = posts.findIndex(p => p.legacy_wp_id === postData.legacy_wp_id);
    }
    
    let savedPost;
    
    if (existingIndex >= 0) {
        // Update existing
        savedPost = {
            ...posts[existingIndex],
            ...postData,
            updated_at: now
        };
        // Preserve original ID if updating by legacy_wp_id
        if (postData.legacy_wp_id && !postData.id) {
            savedPost.id = savedPost.id || generateId();
        }
        posts[existingIndex] = savedPost;
    } else {
        // Create new
        const slug = ensureUniqueSlug(postData.slug || generateSlug(postData.title));
        savedPost = {
            id: postData.id || generateId(),
            ...postData,
            slug,
            reading_time_minutes: calculateReadingTime(postData.content || ''),
            created_at: postData.created_at || now,
            updated_at: now
        };
        posts.push(savedPost);
    }
    
    // Update cache and localStorage
    dataCache.posts = posts;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    
    // When Supabase is configured, save must succeed there or we throw (so user sees error, not fake success)
    if (isSupabaseConfigured()) {
        try {
            const result = await supabaseFunctions.savePostToSupabase(savedPost);
            if (!result) {
                throw new Error('Failed to save to database. Check the browser console for details.');
            }
            const idx = posts.findIndex(p => p.id === result.id);
            if (idx >= 0) {
                posts[idx] = { ...posts[idx], ...result };
                dataCache.posts = posts;
            }
            return result;
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            throw error;
        }
    }
    
    return savedPost;
}

// Delete post (from Supabase if configured, and localStorage)
export async function deletePost(id) {
    const posts = getAllPostsSyncInternal();
    const filtered = posts.filter(p => p.id !== id);
    dataCache.posts = filtered;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Also delete from Supabase if configured
    if (isSupabaseConfigured()) {
        try {
            await supabaseFunctions.deletePostFromSupabase(id);
        } catch (error) {
            console.error('Error deleting from Supabase:', error);
        }
    }
    
    return true;
}

// Save category
export function saveCategory(categoryData) {
    const categories = getCategoriesSyncInternal();
    
    if (categoryData.id) {
        const index = categories.findIndex(c => c.id === categoryData.id);
        if (index === -1) throw new Error('Category not found');
        categories[index] = { ...categories[index], ...categoryData };
    } else {
        const slug = categoryData.slug || generateSlug(categoryData.name);
        categories.push({
            id: generateId(),
            name: categoryData.name,
            slug: ensureUniqueSlug(slug, categoryData.id)
        });
    }
    
    dataCache.categories = categories;
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return categories;
}

// Save tag
export function saveTag(tagData) {
    const tags = getTagsSyncInternal();
    
    if (tagData.id) {
        const index = tags.findIndex(t => t.id === tagData.id);
        if (index === -1) throw new Error('Tag not found');
        tags[index] = { ...tags[index], ...tagData };
    } else {
        const slug = tagData.slug || generateSlug(tagData.name);
        tags.push({
            id: generateId(),
            name: tagData.name,
            slug: ensureUniqueSlug(slug, tagData.id)
        });
    }
    
    dataCache.tags = tags;
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
    return tags;
}

// Search posts
export function searchPosts(query, filters = {}) {
    let posts = getAllPostsSyncInternal();
    
    // Filter by status
    if (filters.status) {
        posts = posts.filter(p => p.status === filters.status);
    }
    
    // Filter by category
    if (filters.category) {
        posts = posts.filter(p => p.category_id === filters.category);
    }
    
    // Filter by tag
    if (filters.tag) {
        posts = posts.filter(p => p.tags && p.tags.includes(filters.tag));
    }
    
    // Search query
    if (query) {
        const searchLower = query.toLowerCase();
        posts = posts.filter(p => 
            p.title.toLowerCase().includes(searchLower) ||
            p.excerpt.toLowerCase().includes(searchLower) ||
            p.content.toLowerCase().includes(searchLower)
        );
    }
    
    // Sort by published_at (newest first) or created_at
    posts.sort((a, b) => {
        const dateA = a.published_at || a.created_at;
        const dateB = b.published_at || b.created_at;
        return new Date(dateB) - new Date(dateA);
    });
    
    return posts;
}

// Get posts by category
export function getPostsByCategory(categorySlug) {
    const category = getCategoriesSyncInternal().find(c => c.slug === categorySlug);
    if (!category) return [];
    
    return getPublishedPostsSync().filter(p => p.category_id === category.id);
}

// Get posts by tag
export function getPostsByTag(tagSlug) {
    const tag = getTagsSyncInternal().find(t => t.slug === tagSlug);
    if (!tag) return [];
    
    return getPublishedPostsSync().filter(p => p.tags && p.tags.includes(tag.id));
}

// Format date for display
export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Export data to JSON (for downloading and committing to repo)
export function exportToJSON() {
    const data = {
        posts: getAllPostsSyncInternal(),
        categories: getCategoriesSyncInternal(),
        tags: getTagsSyncInternal()
    };
    return JSON.stringify(data, null, 2);
}

// Download JSON file (for admin to update repo)
export function downloadJSON() {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blog-posts.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Collect image URLs from all posts (featured_image_url + img src in content) for image library fallback
export function getImageUrlsFromPosts() {
    const posts = getAllPostsSyncInternal();
    const seen = new Set();
    const out = [];
    for (const p of posts) {
        if (p.featured_image_url && !seen.has(p.featured_image_url)) {
            seen.add(p.featured_image_url);
            out.push(p.featured_image_url);
        }
        if (p.content && typeof p.content === 'string') {
            const re = /<img[^>]+src=["']([^"']+)["']/gi;
            let m;
            while ((m = re.exec(p.content)) !== null) {
                if (m[1] && !seen.has(m[1])) {
                    seen.add(m[1]);
                    out.push(m[1]);
                }
            }
        }
    }
    return out;
}

// Export for use in other modules
export { generateSlug, ensureUniqueSlug, calculateReadingTime, ensureDataLoaded };

// Auto-initialize on module load (non-blocking)
if (typeof window !== 'undefined') {
    ensureDataLoaded();
}