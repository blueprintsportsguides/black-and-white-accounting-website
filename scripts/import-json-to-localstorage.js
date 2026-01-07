/**
 * Import JSON file directly into localStorage
 * Run this in browser console or as a script tag
 */

import { savePost, saveCategory, saveTag, getCategories, getTags, getAllPosts } from '../blog-data.js';

async function importFromJSON(jsonData) {
    const stats = {
        postsImported: 0,
        postsUpdated: 0,
        categoriesCreated: 0,
        tagsCreated: 0,
        errors: []
    };

    console.log('Starting import...');
    console.log(`Posts: ${jsonData.posts?.length || 0}`);
    console.log(`Categories: ${jsonData.categories?.length || 0}`);
    console.log(`Tags: ${jsonData.tags?.length || 0}`);

    // Import categories
    console.log('Importing categories...');
    const existingCategories = getCategories();
    const existingCategorySlugs = new Set(existingCategories.map(c => c.slug));

    for (const cat of jsonData.categories || []) {
        if (!existingCategorySlugs.has(cat.slug)) {
            saveCategory(cat);
            stats.categoriesCreated++;
            console.log(`Created category: ${cat.name}`);
        }
    }

    // Import tags
    console.log('Importing tags...');
    const existingTags = getTags();
    const existingTagSlugs = new Set(existingTags.map(t => t.slug));

    for (const tag of jsonData.tags || []) {
        if (!existingTagSlugs.has(tag.slug)) {
            saveTag(tag);
            stats.tagsCreated++;
            console.log(`Created tag: ${tag.name}`);
        }
    }

    // Map category slugs to IDs
    const allCategories = getCategories();
    const categoryMap = new Map();
    allCategories.forEach(cat => {
        categoryMap.set(cat.slug, cat.id);
    });

    // Map tag slugs to IDs
    const allTags = getTags();
    const tagMap = new Map();
    allTags.forEach(tag => {
        tagMap.set(tag.slug, tag.id);
    });

    // Import posts
    console.log('Importing posts...');
    const existingPosts = getAllPosts();
    const existingLegacyIds = new Set(existingPosts.map(p => p.legacy_wp_id).filter(Boolean));

    for (const post of jsonData.posts || []) {
        try {
            // Convert category slug to ID
            if (post.category_slug) {
                post.category_id = categoryMap.get(post.category_slug) || null;
            }

            // Convert tag slugs to IDs
            if (post.tag_slugs && Array.isArray(post.tag_slugs)) {
                post.tags = post.tag_slugs
                    .map(slug => tagMap.get(slug))
                    .filter(id => id !== undefined);
            }

            // Check if updating existing
            const isUpdate = existingLegacyIds.has(post.legacy_wp_id);
            
            savePost(post);
            
            if (isUpdate) {
                stats.postsUpdated++;
                console.log(`Updated: ${post.title}`);
            } else {
                stats.postsImported++;
                console.log(`Imported: ${post.title}`);
            }
        } catch (error) {
            stats.errors.push({ post: post.title, error: error.message });
            console.error(`Error importing "${post.title}": ${error.message}`);
        }
    }

    console.log('\n=== IMPORT COMPLETE ===');
    console.log(`Posts imported: ${stats.postsImported}`);
    console.log(`Posts updated: ${stats.postsUpdated}`);
    console.log(`Categories created: ${stats.categoriesCreated}`);
    console.log(`Tags created: ${stats.tagsCreated}`);
    console.log(`Errors: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
        console.log('\nErrors:');
        stats.errors.forEach(err => {
            console.log(`  - ${err.post}: ${err.error}`);
        });
    }

    return stats;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.importWordPressJSON = importFromJSON;
}

export { importFromJSON };

