#!/usr/bin/env node

/**
 * Convert WordPress REST import JSON to blog-posts.json format
 * 
 * This script reads the WordPress REST import file and converts it to
 * the format expected by blog-posts.json (with categories and tags extracted)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to convert slug to display name
function slugToName(slug) {
    if (!slug) return '';
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Helper function to ensure unique categories/tags
function createUniqueItems(items, type) {
    const seen = new Map();
    const result = [];
    
    for (const item of items) {
        if (!item.slug || seen.has(item.slug)) continue;
        seen.set(item.slug, true);
        result.push({
            id: item.slug,
            name: item.name || slugToName(item.slug),
            slug: item.slug
        });
    }
    
    return result.sort((a, b) => a.name.localeCompare(b.name));
}

// Main conversion function
function convertWpImportToBlogPosts(inputPath, outputPath) {
    console.log(`Reading WordPress import file: ${inputPath}`);
    const wpData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    if (!wpData.posts || !Array.isArray(wpData.posts)) {
        throw new Error('Invalid WordPress import file: missing posts array');
    }
    
    console.log(`Found ${wpData.posts.length} posts`);
    
    // Extract unique categories and tags from posts
    const categoryMap = new Map();
    const tagMap = new Map();
    
    wpData.posts.forEach(post => {
        // Extract category
        if (post.category_slug) {
            if (!categoryMap.has(post.category_slug)) {
                categoryMap.set(post.category_slug, {
                    slug: post.category_slug,
                    name: slugToName(post.category_slug)
                });
            }
        }
        
        // Extract tags
        if (post.tag_slugs && Array.isArray(post.tag_slugs)) {
            post.tag_slugs.forEach(tagSlug => {
                if (tagSlug && !tagMap.has(tagSlug)) {
                    tagMap.set(tagSlug, {
                        slug: tagSlug,
                        name: slugToName(tagSlug)
                    });
                }
            });
        }
    });
    
    // Convert to arrays
    const categories = Array.from(categoryMap.values());
    const tags = Array.from(tagMap.values());
    
    console.log(`Extracted ${categories.length} unique categories`);
    console.log(`Extracted ${tags.length} unique tags`);
    
    // Build the output structure
    const output = {
        posts: wpData.posts,
        categories: createUniqueItems(categories, 'category'),
        tags: createUniqueItems(tags, 'tag')
    };
    
    // Write to output file
    console.log(`Writing to: ${outputPath}`);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    
    console.log('✓ Conversion complete!');
    console.log(`  - Posts: ${output.posts.length}`);
    console.log(`  - Categories: ${output.categories.length}`);
    console.log(`  - Tags: ${output.tags.length}`);
}

// Run the conversion
const inputFile = path.join(__dirname, '../data/wp-rest-import-2026-01-07T13-30-19.json');
const outputFile = path.join(__dirname, '../data/blog-posts.json');

try {
    convertWpImportToBlogPosts(inputFile, outputFile);
    process.exit(0);
} catch (error) {
    console.error('Error converting file:', error.message);
    process.exit(1);
}
