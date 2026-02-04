// Supabase Blog Data Functions
// These functions handle all Supabase operations for blog data

import { getSupabaseClient, isSupabaseConfigured } from './supabase-config.js';

// Load all posts from Supabase
export async function loadPostsFromSupabase() {
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
                    tag_slugs: tagData?.map(t => t.tag_id) || []
                };
            })
        );
        
        return postsWithTags;
    } catch (error) {
        console.error('Error loading posts from Supabase:', error);
        return null;
    }
}

// Load categories from Supabase
export async function loadCategoriesFromSupabase() {
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

// Load tags from Supabase
export async function loadTagsFromSupabase() {
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

// Table columns for blog_posts (so we don't send extra fields)
const BLOG_POST_COLUMNS = [
    'id', 'legacy_wp_id', 'legacy_wp_url', 'title', 'slug', 'excerpt', 'content',
    'status', 'published_at', 'created_at', 'updated_at', 'author_name', 'category_id',
    'featured_image_url', 'featured_image_alt', 'meta_title', 'meta_description', 'reading_time_minutes'
];

// Save post to Supabase
export async function savePostToSupabase(postData) {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;
    
    try {
        const { tag_slugs, tags, ...rest } = postData;
        const tagIds = tags && tags.length > 0 ? tags : (tag_slugs || []);
        
        // Build payload with only table columns and ensure required fields
        const now = new Date().toISOString();
        const postPayload = {};
        for (const key of BLOG_POST_COLUMNS) {
            if (rest[key] !== undefined && rest[key] !== null) {
                postPayload[key] = rest[key];
            }
        }
        if (!postPayload.id) postPayload.id = rest.id || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
        if (!postPayload.updated_at) postPayload.updated_at = now;
        if (!postPayload.created_at) postPayload.created_at = postPayload.created_at || now;
        if (postPayload.content != null && (postPayload.reading_time_minutes == null || postPayload.reading_time_minutes === 0)) {
            const words = (postPayload.content || '').split(/\s+/).length;
            postPayload.reading_time_minutes = Math.max(1, Math.ceil(words / 200));
        }
        
        const { data, error } = await supabase
            .from('blog_posts')
            .upsert(postPayload, { onConflict: 'id' })
            .select()
            .single();
        
        if (error) {
            console.error('Error saving post to Supabase:', error);
            throw new Error(error.message || 'Database error');
        }
        
        // Sync tags (blog_post_tags)
        await supabase.from('blog_post_tags').delete().eq('post_id', data.id);
        if (Array.isArray(tagIds) && tagIds.length > 0) {
            const { error: tagError } = await supabase.from('blog_post_tags').insert(
                tagIds.map(tagId => ({ post_id: data.id, tag_id: tagId }))
            );
            if (tagError) console.warn('Tag sync warning:', tagError);
        }
        
        return { ...data, tags: tagIds };
    } catch (error) {
        console.error('Error saving post to Supabase:', error);
        throw error instanceof Error ? error : new Error(String(error));
    }
}

// Delete post from Supabase
export async function deletePostFromSupabase(postId) {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;
    
    try {
        // Delete tags first (cascade should handle this, but being explicit)
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
        
        return true;
    } catch (error) {
        console.error('Error deleting post from Supabase:', error);
        return false;
    }
}

// Save category to Supabase
export async function saveCategoryToSupabase(categoryData) {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;
    
    try {
        const { data, error } = await supabase
            .from('blog_categories')
            .upsert(categoryData, { onConflict: 'id' })
            .select()
            .single();
        
        if (error) {
            console.error('Error saving category to Supabase:', error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Error saving category to Supabase:', error);
        return null;
    }
}

// Upload and list from same folder (this folder = image library); bucket: blog-images
const BLOG_IMAGES_BUCKET = 'blog-images';
const BLOG_IMAGES_FOLDER = 'blog';

export async function uploadBlogImage(file) {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;
    try {
        const ext = (file.name.match(/\.([^.]+)$/) || [])[1] || 'jpg';
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
        const path = `${BLOG_IMAGES_FOLDER}/${safeName}`;
        const { data, error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).upload(path, file, {
            upsert: false,
            contentType: file.type || 'image/jpeg'
        });
        if (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
        const { data: urlData } = supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(data.path);
        return urlData?.publicUrl || null;
    } catch (e) {
        console.error('uploadBlogImage:', e);
        throw e;
    }
}

export async function listBlogImages(limit = 200) {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];
    try {
        const { data, error } = await supabase.storage
            .from(BLOG_IMAGES_BUCKET)
            .list(BLOG_IMAGES_FOLDER, { limit, sortBy: { column: 'name', order: 'desc' } });
        if (error) {
            console.error('Error listing blog images:', error);
            return [];
        }
        // Items can be files (no metadata.id = folder) or folders; we want files only
        const files = (data || []).filter(f => f.name && f.name !== '.emptyFolderPlaceholder' && (f.id != null || f.metadata));
        return files.map(f => {
            const path = `${BLOG_IMAGES_FOLDER}/${f.name}`;
            const { data: d } = supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(path);
            return d.publicUrl;
        });
    } catch (e) {
        console.error('listBlogImages:', e);
        return [];
    }
}

// Save tag to Supabase
export async function saveTagToSupabase(tagData) {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;
    
    try {
        const { data, error } = await supabase
            .from('blog_tags')
            .upsert(tagData, { onConflict: 'id' })
            .select()
            .single();
        
        if (error) {
            console.error('Error saving tag to Supabase:', error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Error saving tag to Supabase:', error);
        return null;
    }
}
