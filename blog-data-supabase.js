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

// Save post to Supabase
export async function savePostToSupabase(postData) {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;
    
    try {
        // Prepare post data (exclude tags, handle separately)
        const { tag_slugs, tags, ...postPayload } = postData;
        
        // Upsert post
        const { data, error } = await supabase
            .from('blog_posts')
            .upsert(postPayload, { onConflict: 'id' })
            .select()
            .single();
        
        if (error) {
            console.error('Error saving post to Supabase:', error);
            return null;
        }
        
        // Handle tags if provided
        if (tag_slugs && tag_slugs.length > 0) {
            // Delete existing tags
            await supabase
                .from('blog_post_tags')
                .delete()
                .eq('post_id', data.id);
            
            // Insert new tags
            const tagRelations = tag_slugs.map(tagId => ({
                post_id: data.id,
                tag_id: tagId
            }));
            
            if (tagRelations.length > 0) {
                await supabase
                    .from('blog_post_tags')
                    .insert(tagRelations);
            }
        }
        
        return data;
    } catch (error) {
        console.error('Error saving post to Supabase:', error);
        return null;
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

// Upload image to Supabase Storage (bucket: blog-images, folder: blog/)
const BLOG_IMAGES_BUCKET = 'blog-images';
const BLOG_IMAGES_FOLDER = 'blog';

export async function uploadBlogImage(file) {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;
    try {
        const ext = (file.name.match(/\.([^.]+)$/) || [])[1] || 'jpg';
        const path = `${BLOG_IMAGES_FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { data, error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).upload(path, file, { upsert: false });
        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }
        const { data: urlData } = supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(data.path);
        return urlData?.publicUrl || null;
    } catch (e) {
        console.error('uploadBlogImage:', e);
        return null;
    }
}

export async function listBlogImages(limit = 80) {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];
    try {
        const { data, error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).list(BLOG_IMAGES_FOLDER, { limit, sortBy: { column: 'name', order: 'desc' } });
        if (error) {
            console.error('Error listing blog images:', error);
            return [];
        }
        const files = (data || []).filter(f => f.name && f.name !== '.emptyFolderPlaceholder');
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
