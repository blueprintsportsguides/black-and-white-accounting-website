// Blog Data Storage and Management
// Primary: Supabase (when configured)
// Fallback: localStorage + JSON file

import { getSupabaseClient, isSupabaseConfigured } from './supabase-config.js';

const STORAGE_KEY = 'baw_blog_posts';
const CATEGORIES_KEY = 'baw_blog_categories';
const TAGS_KEY = 'baw_blog_tags';
const JSON_SOURCE = '/data/blog-posts.json';

// Cache for loaded data
let dataCache = {
    posts: null,
    categories: null,
    tags: null,
    loaded: false
};

// ============================================
// SUPABASE DATA FUNCTIONS
// ============================================

async function loadPostsFromSupabase() {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;
    
    try {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('published_at', { ascending: false, nullsFirst: false });
        
        if (error) {
            console.error('Error loading posts from Supabase:', error);
            return null;
        }
        
        // Also load tags for each post
        const postsWithTags = await Promise.all(
            (data || []).map(async (post) => {
                const { data: tagData } = await supabase
                    .from('blog_post_tags')
                    .select('tag_id')
                    .eq('post_id', post.id);
                
                return {
                    ...post,
                    tags: tagData?.map(t => t.tag_id) || []
                };
            })
        );
        
        return postsWithTags;
    } catch (error) {
        console.error('Error loading posts from Supabase:', error);
        return null;
    }
}

async function loadCategoriesFromSupabase() {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;
    
    try {
        const { data, error } = await supabase
            .from('blog_categories')
            .select('*')
            .order('name');
        
        if (error) {
            console.error('Error loading categories from Supabase:', error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Error loading categories from Supabase:', error);
        return null;
    }
}

async function loadTagsFromSupabase() {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;
    
    try {
        const { data, error } = await supabase
            .from('blog_tags')
            .select('*')
            .order('name');
        
        if (error) {
            console.error('Error loading tags from Supabase:', error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Error loading tags from Supabase:', error);
        return null;
    }
}

async function savePostToSupabase(postData) {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;
    
    try {
        // Prepare post data (exclude tags, handle separately)
        const { tags, tag_slugs, ...postPayload } = postData;
        
        // Ensure we have an ID
        if (!postPayload.id) {
            postPayload.id = generateId();
        }
        
        // Set timestamps
        const now = new Date().toISOString();
        postPayload.updated_at = now;
        if (!postPayload.created_at) {
            postPayload.created_at = now;
        }
        
        // Calculate reading time
        if (postPayload.content) {
            postPayload.reading_time_minutes = calculateReadingTime(postPayload.content);
        }
        
        // Upsert post
        const { data, error } = await supabase
            .from('blog_posts')
            .upsert(postPayload, { onConflict: 'id' })
            .select()
            .single();
        
        if (error) {
            console.error('Error saving post to Supabase:', error);
            throw new Error(error.message || 'Failed to save post to database');
        }
        
        // Handle tags if provided
        const tagIds = tags || tag_slugs || [];
        if (tagIds.length >= 0) {
            // Delete existing tags
            await supabase
                .from('blog_post_tags')
                .delete()
                .eq('post_id', data.id);
            
            // Insert new tags
            if (tagIds.length > 0) {
                const tagRelations = tagIds.map(tagId => ({
                    post_id: data.id,
                    tag_id: tagId
                }));
                
                await supabase
                    .from('blog_post_tags')
                    .insert(tagRelations);
            }
        }
        
        // Update cache
        if (dataCache.posts) {
            const index = dataCache.posts.findIndex(p => p.id === data.id);
            const postWithTags = { ...data, tags: tagIds };
            if (index >= 0) {
                dataCache.posts[index] = postWithTags;
            } else {
                dataCache.posts.unshift(postWithTags);
            }
        }
        
        return { ...data, tags: tagIds };
    } catch (error) {
        console.error('Error saving post to Supabase:', error);
        throw error;
    }
}

async function deletePostFromSupabase(postId) {
    const supabase = await getSupabaseClient();
    if (!supabase) return false;
    
    try {
        // Delete tags first
        await supabase
            .from('blog_post_tags')
            .delete()
            .eq('post_id', postId);
        
        // Delete post
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', postId);
        
        if (error) {
            console.error('Error deleting post from Supabase:', error);
            return false;
        }
        
        // Update cache
        if (dataCache.posts) {
            dataCache.posts = dataCache.posts.filter(p => p.id !== postId);
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting post from Supabase:', error);
        return false;
    }
}

// ============================================
// LOCAL STORAGE FALLBACK FUNCTIONS
// ============================================

async function loadDataFromJSON() {
    try {
        const response = await fetch(JSON_SOURCE);
        if (!response.ok) {
            console.warn('Could not load blog data from JSON file');
            return false;
        }
        const jsonData = await response.json();
        
        dataCache.posts = jsonData.posts || [];
        dataCache.categories = jsonData.categories || [];
        dataCache.tags = jsonData.tags || [];
        
        // Store in localStorage as cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataCache.posts));
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(dataCache.categories));
        localStorage.setItem(TAGS_KEY, JSON.stringify(dataCache.tags));
        
        return true;
    } catch (error) {
        console.warn('Error loading blog data from JSON:', error);
        return false;
    }
}

function loadFromLocalStorage() {
    const posts = localStorage.getItem(STORAGE_KEY);
    const categories = localStorage.getItem(CATEGORIES_KEY);
    const tags = localStorage.getItem(TAGS_KEY);
    
    if (posts) dataCache.posts = JSON.parse(posts);
    if (categories) dataCache.categories = JSON.parse(categories);
    if (tags) dataCache.tags = JSON.parse(tags);
}

function saveToLocalStorage() {
    if (dataCache.posts) localStorage.setItem(STORAGE_KEY, JSON.stringify(dataCache.posts));
    if (dataCache.categories) localStorage.setItem(CATEGORIES_KEY, JSON.stringify(dataCache.categories));
    if (dataCache.tags) localStorage.setItem(TAGS_KEY, JSON.stringify(dataCache.tags));
}

// ============================================
// MAIN DATA LOADING
// ============================================

let initPromise = null;

export async function ensureDataLoaded() {
    if (dataCache.loaded) return true;
    
    if (!initPromise) {
        initPromise = (async () => {
            // Try Supabase first if configured
            if (isSupabaseConfigured()) {
                console.log('Loading data from Supabase...');
                const [posts, categories, tags] = await Promise.all([
                    loadPostsFromSupabase(),
                    loadCategoriesFromSupabase(),
                    loadTagsFromSupabase()
                ]);
                
                if (posts !== null) {
                    dataCache.posts = posts;
                    dataCache.categories = categories || [];
                    dataCache.tags = tags || [];
                    dataCache.loaded = true;
                    console.log(`Loaded ${posts.length} posts from Supabase`);
                    
                    // Initialize defaults if empty
                    if (dataCache.categories.length === 0) {
                        dataCache.categories = getDefaultCategories();
                    }
                    if (dataCache.tags.length === 0) {
                        dataCache.tags = getDefaultTags();
                    }
                    
                    return true;
                }
                console.warn('Supabase load failed, falling back to JSON/localStorage');
            }
            
            // Fallback: Try JSON file
            const jsonLoaded = await loadDataFromJSON();
            if (!jsonLoaded) {
                // Last resort: localStorage
                loadFromLocalStorage();
            }
            
            // Initialize defaults
            if (!dataCache.posts) dataCache.posts = [];
            if (!dataCache.categories || dataCache.categories.length === 0) {
                dataCache.categories = getDefaultCategories();
            }
            if (!dataCache.tags || dataCache.tags.length === 0) {
                dataCache.tags = getDefaultTags();
            }
            
            dataCache.loaded = true;
            return true;
        })();
    }
    
    return initPromise;
}

// Force reload from source (useful after external changes)
export async function reloadData() {
    dataCache.loaded = false;
    initPromise = null;
    return ensureDataLoaded();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function calculateReadingTime(content) {
    if (!content) return 5;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

export function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function ensureUniqueSlug(slug, excludeId = null) {
    const posts = dataCache.posts || [];
    let uniqueSlug = slug;
    let counter = 1;
    
    while (posts.some(p => p.slug === uniqueSlug && p.id !== excludeId)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }
    
    return uniqueSlug;
}

function getDefaultCategories() {
    return [
        { id: 'tax', name: 'Tax', slug: 'tax' },
        { id: 'accounts', name: 'Accounts', slug: 'accounts' },
        { id: 'advisory', name: 'Advisory', slug: 'advisory' },
        { id: 'business', name: 'Business', slug: 'business' },
        { id: 'news', name: 'News', slug: 'news' }
    ];
}

function getDefaultTags() {
    return [
        { id: 'self-assessment', name: 'Self Assessment', slug: 'self-assessment' },
        { id: 'vat', name: 'VAT', slug: 'vat' },
        { id: 'corporation-tax', name: 'Corporation Tax', slug: 'corporation-tax' },
        { id: 'planning', name: 'Planning', slug: 'planning' },
        { id: 'compliance', name: 'Compliance', slug: 'compliance' }
    ];
}

export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// ============================================
// DATA ACCESS FUNCTIONS (ASYNC)
// ============================================

export async function getAllPosts() {
    await ensureDataLoaded();
    return dataCache.posts || [];
}

export async function getPublishedPosts() {
    await ensureDataLoaded();
    return (dataCache.posts || []).filter(post => post.status === 'published');
}

export async function getPostById(id) {
    await ensureDataLoaded();
    return (dataCache.posts || []).find(p => p.id === id);
}

export async function getPostBySlug(slug) {
    await ensureDataLoaded();
    return (dataCache.posts || []).find(p => p.slug === slug && p.status === 'published');
}

export async function getCategories() {
    await ensureDataLoaded();
    return dataCache.categories || [];
}

export async function getTags() {
    await ensureDataLoaded();
    return dataCache.tags || [];
}

// ============================================
// SYNC VERSIONS (use cached data, trigger load)
// ============================================

export function getAllPostsSync() {
    ensureDataLoaded(); // Trigger load in background
    return dataCache.posts || [];
}

export function getPublishedPostsSync() {
    ensureDataLoaded();
    return (dataCache.posts || []).filter(post => post.status === 'published');
}

export function getPostByIdSync(id) {
    ensureDataLoaded();
    return (dataCache.posts || []).find(p => p.id === id);
}

export function getPostBySlugSync(slug) {
    ensureDataLoaded();
    return (dataCache.posts || []).find(p => p.slug === slug && p.status === 'published');
}

export function getCategoriesSync() {
    ensureDataLoaded();
    return dataCache.categories || [];
}

export function getTagsSync() {
    ensureDataLoaded();
    return dataCache.tags || [];
}

// ============================================
// SAVE/DELETE FUNCTIONS
// ============================================

export async function savePost(postData) {
    await ensureDataLoaded();
    
    // Use Supabase if configured
    if (isSupabaseConfigured()) {
        return savePostToSupabase(postData);
    }
    
    // Fallback to localStorage
    const posts = dataCache.posts || [];
    const now = new Date().toISOString();
    
    let existingIndex = -1;
    if (postData.id) {
        existingIndex = posts.findIndex(p => p.id === postData.id);
    }
    
    if (existingIndex >= 0) {
        posts[existingIndex] = {
            ...posts[existingIndex],
            ...postData,
            updated_at: now
        };
    } else {
        const slug = ensureUniqueSlug(postData.slug || generateSlug(postData.title));
        const newPost = {
            id: generateId(),
            ...postData,
            slug,
            reading_time_minutes: calculateReadingTime(postData.content || ''),
            created_at: postData.created_at || now,
            updated_at: now
        };
        posts.unshift(newPost);
    }
    
    dataCache.posts = posts;
    saveToLocalStorage();
    return existingIndex >= 0 ? posts[existingIndex] : posts[0];
}

export async function deletePost(id) {
    await ensureDataLoaded();
    
    // Use Supabase if configured
    if (isSupabaseConfigured()) {
        return deletePostFromSupabase(id);
    }
    
    // Fallback to localStorage
    dataCache.posts = (dataCache.posts || []).filter(p => p.id !== id);
    saveToLocalStorage();
    return true;
}

// Save category (to Supabase if configured, otherwise localStorage)
export async function saveCategory(categoryData) {
    await ensureDataLoaded();
    
    const supabase = await getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
        try {
            const payload = {
                id: categoryData.id || generateId(),
                name: categoryData.name,
                slug: categoryData.slug || generateSlug(categoryData.name),
                description: categoryData.description || null
            };
            
            const { data, error } = await supabase
                .from('blog_categories')
                .upsert(payload, { onConflict: 'id' })
                .select()
                .single();
            
            if (error) {
                console.error('Error saving category to Supabase:', error);
                throw error;
            }
            
            // Update cache
            if (dataCache.categories) {
                const index = dataCache.categories.findIndex(c => c.id === data.id);
                if (index >= 0) {
                    dataCache.categories[index] = data;
                } else {
                    dataCache.categories.push(data);
                }
            }
            
            return data;
        } catch (error) {
            console.error('Error saving category:', error);
            throw error;
        }
    }
    
    // Fallback to localStorage
    const categories = dataCache.categories || [];
    const slug = categoryData.slug || generateSlug(categoryData.name);
    
    if (categoryData.id) {
        const index = categories.findIndex(c => c.id === categoryData.id);
        if (index >= 0) {
            categories[index] = { ...categories[index], ...categoryData };
        }
    } else {
        categories.push({
            id: generateId(),
            name: categoryData.name,
            slug: slug,
            description: categoryData.description || null
        });
    }
    
    dataCache.categories = categories;
    saveToLocalStorage();
    return categories[categories.length - 1];
}

// Save tag (to Supabase if configured, otherwise localStorage)
export async function saveTag(tagData) {
    await ensureDataLoaded();
    
    const supabase = await getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
        try {
            const payload = {
                id: tagData.id || generateId(),
                name: tagData.name,
                slug: tagData.slug || generateSlug(tagData.name)
            };
            
            const { data, error } = await supabase
                .from('blog_tags')
                .upsert(payload, { onConflict: 'id' })
                .select()
                .single();
            
            if (error) {
                console.error('Error saving tag to Supabase:', error);
                throw error;
            }
            
            // Update cache
            if (dataCache.tags) {
                const index = dataCache.tags.findIndex(t => t.id === data.id);
                if (index >= 0) {
                    dataCache.tags[index] = data;
                } else {
                    dataCache.tags.push(data);
                }
            }
            
            return data;
        } catch (error) {
            console.error('Error saving tag:', error);
            throw error;
        }
    }
    
    // Fallback to localStorage
    const tags = dataCache.tags || [];
    const slug = tagData.slug || generateSlug(tagData.name);
    
    if (tagData.id) {
        const index = tags.findIndex(t => t.id === tagData.id);
        if (index >= 0) {
            tags[index] = { ...tags[index], ...tagData };
        }
    } else {
        tags.push({
            id: generateId(),
            name: tagData.name,
            slug: slug
        });
    }
    
    dataCache.tags = tags;
    saveToLocalStorage();
    return tags[tags.length - 1];
}

// ============================================
// SEARCH AND FILTER
// ============================================

export async function searchPosts(query, filters = {}) {
    await ensureDataLoaded();
    
    let posts = filters.includeAll 
        ? (dataCache.posts || [])
        : (dataCache.posts || []).filter(p => p.status === 'published');
    
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
            (p.title && p.title.toLowerCase().includes(searchLower)) ||
            (p.excerpt && p.excerpt.toLowerCase().includes(searchLower)) ||
            (p.content && p.content.toLowerCase().includes(searchLower))
        );
    }
    
    // Sort by published_at or created_at (newest first)
    posts.sort((a, b) => {
        const dateA = a.published_at || a.created_at;
        const dateB = b.published_at || b.created_at;
        return new Date(dateB) - new Date(dateA);
    });
    
    return posts;
}

export async function getPostsByCategory(categorySlug) {
    await ensureDataLoaded();
    const category = (dataCache.categories || []).find(c => c.slug === categorySlug);
    if (!category) return [];
    
    return (dataCache.posts || []).filter(p => p.category_id === category.id && p.status === 'published');
}

export async function getPostsByTag(tagSlug) {
    await ensureDataLoaded();
    const tag = (dataCache.tags || []).find(t => t.slug === tagSlug);
    if (!tag) return [];
    
    return (dataCache.posts || []).filter(p => p.tags && p.tags.includes(tag.id) && p.status === 'published');
}

// ============================================
// IMAGE UTILITIES
// ============================================

export function getImageUrlsFromPosts() {
    const posts = dataCache.posts || [];
    const urls = new Set();
    
    posts.forEach(post => {
        if (post.featured_image_url) {
            urls.add(post.featured_image_url);
        }
        // Extract images from content
        const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
        let match;
        while ((match = imgRegex.exec(post.content || '')) !== null) {
            urls.add(match[1]);
        }
    });
    
    return Array.from(urls);
}

// ============================================
// EXPORT/DOWNLOAD (for backup purposes)
// ============================================

export function exportToJSON() {
    const data = {
        posts: dataCache.posts || [],
        categories: dataCache.categories || [],
        tags: dataCache.tags || []
    };
    return JSON.stringify(data, null, 2);
}

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

// Auto-initialize on module load
if (typeof window !== 'undefined') {
    ensureDataLoaded();
}
