// Blog Data Storage and Management
// Uses localStorage for persistence (can be migrated to IndexedDB or backend later)

const STORAGE_KEY = 'baw_blog_posts';
const CATEGORIES_KEY = 'baw_blog_categories';
const TAGS_KEY = 'baw_blog_tags';

// Initialize default categories if none exist
function initDefaultCategories() {
    const existing = getCategories();
    if (existing.length === 0) {
        const defaults = [
            { id: 'tax', name: 'Tax', slug: 'tax' },
            { id: 'accounts', name: 'Accounts', slug: 'accounts' },
            { id: 'advisory', name: 'Advisory', slug: 'advisory' },
            { id: 'business', name: 'Business', slug: 'business' },
            { id: 'news', name: 'News', slug: 'news' }
        ];
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaults));
        return defaults;
    }
    return existing;
}

// Initialize default tags if none exist
function initDefaultTags() {
    const existing = getTags();
    if (existing.length === 0) {
        const defaults = [
            { id: 'self-assessment', name: 'Self Assessment', slug: 'self-assessment' },
            { id: 'vat', name: 'VAT', slug: 'vat' },
            { id: 'corporation-tax', name: 'Corporation Tax', slug: 'corporation-tax' },
            { id: 'planning', name: 'Planning', slug: 'planning' },
            { id: 'compliance', name: 'Compliance', slug: 'compliance' }
        ];
        localStorage.setItem(TAGS_KEY, JSON.stringify(defaults));
        return defaults;
    }
    return existing;
}

// Initialize on first load
initDefaultCategories();
initDefaultTags();

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
    const posts = getAllPosts();
    let uniqueSlug = slug;
    let counter = 1;
    
    while (posts.some(p => p.slug === uniqueSlug && p.id !== excludeId)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }
    
    return uniqueSlug;
}

// Get all posts
export function getAllPosts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Get published posts only
export function getPublishedPosts() {
    return getAllPosts().filter(post => post.status === 'published');
}

// Get post by ID
export function getPostById(id) {
    const posts = getAllPosts();
    return posts.find(p => p.id === id);
}

// Get post by slug
export function getPostBySlug(slug) {
    const posts = getAllPosts();
    return posts.find(p => p.slug === slug && p.status === 'published');
}

// Save post
export function savePost(postData) {
    const posts = getAllPosts();
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
    
    if (existingIndex >= 0) {
        // Update existing
        posts[existingIndex] = {
            ...posts[existingIndex],
            ...postData,
            updated_at: now
        };
        // Preserve original ID if updating by legacy_wp_id
        if (postData.legacy_wp_id && !postData.id) {
            posts[existingIndex].id = posts[existingIndex].id || generateId();
        }
    } else {
        // Create new
        const slug = ensureUniqueSlug(postData.slug || generateSlug(postData.title));
        const newPost = {
            id: generateId(),
            ...postData,
            slug,
            reading_time_minutes: calculateReadingTime(postData.content || ''),
            created_at: postData.created_at || now,
            updated_at: now
        };
        posts.push(newPost);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return existingIndex >= 0 ? posts[existingIndex] : posts[posts.length - 1];
}

// Delete post
export function deletePost(id) {
    const posts = getAllPosts();
    const filtered = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
}

// Get categories
export function getCategories() {
    const data = localStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
}

// Save category
export function saveCategory(categoryData) {
    const categories = getCategories();
    
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
    
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return categories;
}

// Get tags
export function getTags() {
    const data = localStorage.getItem(TAGS_KEY);
    return data ? JSON.parse(data) : [];
}

// Save tag
export function saveTag(tagData) {
    const tags = getTags();
    
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
    
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
    return tags;
}

// Search posts
export function searchPosts(query, filters = {}) {
    let posts = filters.status ? getAllPosts() : getPublishedPosts();
    
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
    const category = getCategories().find(c => c.slug === categorySlug);
    if (!category) return [];
    
    return getPublishedPosts().filter(p => p.category_id === category.id);
}

// Get posts by tag
export function getPostsByTag(tagSlug) {
    const tag = getTags().find(t => t.slug === tagSlug);
    if (!tag) return [];
    
    return getPublishedPosts().filter(p => p.tags && p.tags.includes(tag.id));
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

// Export for use in other modules
export { generateSlug, ensureUniqueSlug, calculateReadingTime };

