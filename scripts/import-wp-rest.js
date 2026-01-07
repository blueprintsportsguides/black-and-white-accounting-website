#!/usr/bin/env node

/**
 * WordPress REST API Import Script
 * Imports published posts from WordPress REST API into the blog system
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuration
const WP_BASE_URL = 'https://blackandwhiteaccounting.co.uk';
const IMAGE_CACHE_DIR = path.join(ROOT_DIR, 'data', 'wp-media-cache');
const IMAGE_STORAGE_DIR = path.join(ROOT_DIR, 'Images', 'blog');
const MAX_RETRIES = 2;
const DOWNLOAD_TIMEOUT = 30000; // 30 seconds
const PER_PAGE = 100;

// Statistics
const stats = {
    totalFetched: 0,
    postsCreated: 0,
    postsUpdated: 0,
    featuredImagesDownloaded: 0,
    inlineImagesDownloaded: 0,
    inlineImagesReplaced: 0,
    failures: []
};

// Data structures
let isDryRun = false;
let limit = null;
let shouldWipe = false;
const imageCache = new Map(); // URL -> stored path

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath) {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

/**
 * Generate hash from URL for cache filename
 */
function hashUrl(url) {
    return crypto.createHash('md5').update(url).digest('hex');
}

/**
 * Get file extension from URL
 */
function getExtension(url) {
    try {
        const urlPath = new URL(url).pathname;
        const ext = path.extname(urlPath).toLowerCase();
        return ext || '.jpg'; // default to jpg
    } catch {
        return '.jpg';
    }
}

/**
 * Download image with retries
 */
async function downloadImage(url, retries = MAX_RETRIES) {
    const cacheKey = hashUrl(url);
    const cachePath = path.join(IMAGE_CACHE_DIR, `${cacheKey}${getExtension(url)}`);
    
    // Check cache first
    try {
        const cached = await fs.readFile(cachePath);
        return { buffer: cached, cached: true };
    } catch {
        // Not in cache, download
    }
    
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT);
            
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; WordPress REST Import Bot)'
                }
            });
            
            clearTimeout(timeout);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const buffer = await response.buffer();
            
            // Save to cache
            await ensureDir(IMAGE_CACHE_DIR);
            await fs.writeFile(cachePath, buffer);
            
            return { buffer, cached: false };
        } catch (error) {
            if (i === retries - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        }
    }
}

/**
 * Store image and return new URL
 */
async function storeImage(originalUrl, filename = null) {
    try {
        // Check if already processed
        if (imageCache.has(originalUrl)) {
            return { storedUrl: imageCache.get(originalUrl), filename, success: true, cached: true };
        }

        if (isDryRun) {
            return { storedUrl: originalUrl, filename: 'dry-run', success: true };
        }
        
        const { buffer } = await downloadImage(originalUrl);
        
        // Generate filename if not provided
        if (!filename) {
            const ext = getExtension(originalUrl);
            const hash = hashUrl(originalUrl);
            filename = `${hash}${ext}`;
        }
        
        // Ensure storage directory exists
        await ensureDir(IMAGE_STORAGE_DIR);
        
        const storagePath = path.join(IMAGE_STORAGE_DIR, filename);
        await fs.writeFile(storagePath, buffer);
        
        // Return relative URL for web
        const storedUrl = `/Images/blog/${filename}`;
        
        // Cache the mapping
        imageCache.set(originalUrl, storedUrl);
        
        return { storedUrl, filename, success: true };
    } catch (error) {
        stats.failures.push({ type: 'image_download', url: originalUrl, error: error.message });
        return { storedUrl: originalUrl, filename: null, success: false, error: error.message };
    }
}

/**
 * Extract images from HTML content
 */
function extractImageUrls(html) {
    const imageUrls = new Set();
    
    if (!html) return Array.from(imageUrls);
    
    // Match <img src="...">
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
        imageUrls.add(match[1]);
    }
    
    // Match srcset URLs
    const srcsetRegex = /srcset=["']([^"']+)["']/gi;
    while ((match = srcsetRegex.exec(html)) !== null) {
        // srcset format: "url1 size1, url2 size2"
        const urls = match[1].split(',').map(s => s.trim().split(/\s+/)[0]);
        urls.forEach(url => {
            if (url) imageUrls.add(url);
        });
    }
    
    return Array.from(imageUrls);
}

/**
 * Replace image URLs in HTML content
 */
async function replaceImageUrls(html) {
    if (!html) return html;
    
    const imageUrls = extractImageUrls(html);
    let updatedHtml = html;
    let replacedCount = 0;
    
    for (const originalUrl of imageUrls) {
        // Skip data URIs and already-local URLs
        if (originalUrl.startsWith('data:') || originalUrl.startsWith('/') || originalUrl.startsWith('./')) {
            continue;
        }
        
        try {
            const result = await storeImage(originalUrl);
            if (result.success && result.storedUrl !== originalUrl) {
                // Replace src
                updatedHtml = updatedHtml.replace(new RegExp(escapeRegex(originalUrl), 'g'), result.storedUrl);
                
                // Replace in srcset
                const srcsetRegex = new RegExp(`(${escapeRegex(originalUrl)})(\\s+\\d+[wx])?`, 'g');
                updatedHtml = updatedHtml.replace(srcsetRegex, (match, url, size) => {
                    return result.storedUrl + (size || '');
                });
                
                replacedCount++;
                if (!result.cached) {
                    stats.inlineImagesDownloaded++;
                }
            }
        } catch (error) {
            // Continue on error, keep original URL
        }
    }
    
    if (replacedCount > 0) {
        stats.inlineImagesReplaced += replacedCount;
    }
    
    return updatedHtml;
}

/**
 * Escape regex special characters
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strip HTML tags and decode entities
 */
function stripHtml(html) {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

/**
 * Generate excerpt from content if missing
 */
function generateExcerpt(content, maxLength = 200) {
    if (!content) return '';
    
    const text = stripHtml(content);
    
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

/**
 * Calculate reading time
 */
function calculateReadingTime(content) {
    if (!content) return 5;
    const text = stripHtml(content);
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(1, Math.ceil(words / 200));
}

/**
 * Get first image URL from HTML content as fallback
 */
function getFirstImageFromContent(html) {
    if (!html) return null;
    
    const imageUrls = extractImageUrls(html);
    if (imageUrls.length > 0) {
        // Return the first image URL, skipping data URIs
        for (const url of imageUrls) {
            if (!url.startsWith('data:')) {
                return url;
            }
        }
    }
    
    return null;
}

/**
 * Fetch featured image from WordPress
 */
async function getFeaturedImage(mediaId, embedded = null) {
    // Try embedded first - WordPress may include empty array even when featured_media is 0
    if (embedded && Array.isArray(embedded) && embedded.length > 0) {
        const media = embedded[0];
        // Check if media object exists and has source_url (not null/undefined)
        if (media && typeof media === 'object' && media.source_url) {
            return {
                url: media.source_url,
                alt: media.alt_text || media.alt || null
            };
        }
    }
    
    // Only try API fetch if we have a valid media ID
    if (mediaId && mediaId !== 0) {
        try {
            const response = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/media/${mediaId}`);
            if (response.ok) {
                const media = await response.json();
                if (media && media.source_url) {
                    return {
                        url: media.source_url,
                        alt: media.alt_text || media.alt || null
                    };
                }
            }
        } catch (error) {
            stats.failures.push({ type: 'featured_image_fetch', id: mediaId, error: error.message });
        }
    }
    
    return { url: null, alt: null };
}

/**
 * Process a WordPress post
 */
async function processPost(post) {
    const wpId = String(post.id);
    const title = stripHtml(post.title?.rendered || post.title || 'Untitled');
    const slug = post.slug || '';
    const excerpt = stripHtml(post.excerpt?.rendered || post.excerpt || '') || generateExcerpt(post.content?.rendered || post.content || '');
    const content = post.content?.rendered || post.content || '';
    const link = post.link || '';
    const dateGmt = post.date_gmt || post.date || new Date().toISOString();
    const date = post.date || dateGmt;
    
    // Get featured image
    const featuredMediaId = post.featured_media || 0;
    // WordPress REST API embeds featured media in _embedded['wp:featuredmedia'] array
    const embeddedMedia = post._embedded?.['wp:featuredmedia'] || null;
    let featuredImageInfo = await getFeaturedImage(featuredMediaId, embeddedMedia);
    
    // Fallback: if no featured image, try to use first image from content
    if (!featuredImageInfo.url || !featuredImageInfo.url.trim()) {
        const firstContentImage = getFirstImageFromContent(content);
        if (firstContentImage) {
            featuredImageInfo = {
                url: firstContentImage,
                alt: null // We don't have alt text for content images
            };
        }
    }
    
    let featuredImageUrl = null;
    let featuredImageAlt = null;
    
    if (featuredImageInfo.url && featuredImageInfo.url.trim()) {
        if (!isDryRun) {
            const result = await storeImage(featuredImageInfo.url);
            featuredImageUrl = result.storedUrl;
            featuredImageAlt = featuredImageInfo.alt;
            if (result.success && !result.cached) {
                stats.featuredImagesDownloaded++;
            }
        } else {
            featuredImageUrl = featuredImageInfo.url;
            featuredImageAlt = featuredImageInfo.alt;
        }
    }
    
    // Process content and replace inline images
    let processedContent = content;
    if (!isDryRun) {
        processedContent = await replaceImageUrls(content);
    }
    
    // Extract categories and tags from embedded data
    const categories = post._embedded?.['wp:term']?.[0] || [];
    const tags = post._embedded?.['wp:term']?.[1] || [];
    
    const categorySlug = categories.length > 0 ? categories[0].slug : null;
    const tagSlugs = tags.map(t => t.slug).filter(Boolean);
    
    // Build post object
    const postData = {
        legacy_wp_id: wpId,
        legacy_wp_url: link,
        title: title,
        slug: slug,
        excerpt: excerpt,
        content: processedContent,
        status: 'published',
        published_at: dateGmt,
        created_at: date,
        updated_at: post.modified_gmt || post.modified || new Date().toISOString(),
        author_name: post._embedded?.author?.[0]?.name || 'Black and White Accounting',
        category_slug: categorySlug,
        tag_slugs: tagSlugs,
        featured_image_url: featuredImageUrl,
        featured_image_alt: featuredImageAlt,
        meta_title: null,
        meta_description: null,
        reading_time_minutes: calculateReadingTime(processedContent)
    };
    
    return postData;
}

/**
 * Fetch all published posts from WordPress
 */
async function fetchAllPosts() {
    const allPosts = [];
    let page = 1;
    let hasMore = true;
    
    console.log('Fetching posts from WordPress REST API...');
    
    while (hasMore) {
        try {
            const url = `${WP_BASE_URL}/wp-json/wp/v2/posts?per_page=${PER_PAGE}&page=${page}&_embed=1&status=publish&orderby=date&order=asc`;
            console.log(`  Fetching page ${page}...`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const posts = await response.json();
            
            if (!Array.isArray(posts) || posts.length === 0) {
                hasMore = false;
                break;
            }
            
            allPosts.push(...posts);
            stats.totalFetched += posts.length;
            
            console.log(`  Found ${posts.length} posts (total: ${allPosts.length})`);
            
            // Apply limit if set
            if (limit && allPosts.length >= limit) {
                allPosts.splice(limit);
                hasMore = false;
                console.log(`  Limit reached: ${limit} posts`);
                break;
            }
            
            // Check if there are more pages
            const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '0');
            if (page >= totalPages || posts.length < PER_PAGE) {
                hasMore = false;
            } else {
                page++;
            }
        } catch (error) {
            console.error(`Error fetching page ${page}:`, error.message);
            stats.failures.push({ type: 'fetch', page, error: error.message });
            hasMore = false;
        }
    }
    
    return allPosts;
}

/**
 * Main import function
 */
async function main() {
    const args = process.argv.slice(2);
    
    isDryRun = args.includes('--dry-run');
    shouldWipe = args.includes('--wipe');
    const doImport = args.includes('--import');
    
    // Parse limit
    const limitArg = args.find(arg => arg.startsWith('--limit='));
    if (limitArg) {
        limit = parseInt(limitArg.split('=')[1]);
    }
    
    if (!doImport && !isDryRun) {
        console.error('Error: Must specify either --dry-run or --import');
        process.exit(1);
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`WordPress REST API Import Script`);
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'IMPORT'}`);
    console.log(`Base URL: ${WP_BASE_URL}`);
    if (limit) console.log(`Limit: ${limit} posts`);
    if (shouldWipe) console.log(`Wipe: Will delete existing imported posts first`);
    console.log(`${'='.repeat(60)}\n`);
    
    try {
        // Ensure directories exist
        await ensureDir(IMAGE_CACHE_DIR);
        await ensureDir(IMAGE_STORAGE_DIR);
        await ensureDir(path.join(ROOT_DIR, 'logs'));
        
        // Fetch posts
        const wpPosts = await fetchAllPosts();
        
        if (wpPosts.length === 0) {
            console.log('No posts found to import.');
            return;
        }
        
        console.log(`\nProcessing ${wpPosts.length} posts...`);
        
        // Process posts
        const processedPosts = [];
        for (let i = 0; i < wpPosts.length; i++) {
            const post = wpPosts[i];
            try {
                const postData = await processPost(post);
                processedPosts.push(postData);
                console.log(`  [${i + 1}/${wpPosts.length}] Processed: ${postData.title}`);
            } catch (error) {
                console.error(`  [${i + 1}/${wpPosts.length}] Error processing post ${post.id}:`, error.message);
                stats.failures.push({ type: 'process', post_id: post.id, error: error.message });
            }
        }
        
        // Generate output filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const outputFile = path.join(ROOT_DIR, 'data', `wp-rest-import-${timestamp}.json`);
        const logFile = path.join(ROOT_DIR, 'logs', `wp-rest-import-${timestamp}.json`);
        
        // Save import data
        if (!isDryRun) {
            const importData = {
                posts: processedPosts,
                categories: [], // Will be created from category_slug
                tags: [] // Will be created from tag_slugs
            };
            await fs.writeFile(outputFile, JSON.stringify(importData, null, 2));
            console.log(`\nImport data saved to: ${outputFile}`);
        }
        
        // Generate log
        const log = {
            timestamp: new Date().toISOString(),
            mode: isDryRun ? 'dry-run' : 'import',
            wp_base_url: WP_BASE_URL,
            limit: limit || null,
            wipe: shouldWipe,
            stats: { ...stats },
            summary: {
                posts: processedPosts.length
            }
        };
        
        await fs.writeFile(logFile, JSON.stringify(log, null, 2));
        console.log(`Log saved to: ${logFile}`);
        
        // Print summary
        console.log(`\n${'='.repeat(60)}`);
        console.log('IMPORT SUMMARY');
        console.log(`${'='.repeat(60)}`);
        console.log(`Total posts fetched:     ${stats.totalFetched}`);
        console.log(`Posts processed:         ${processedPosts.length}`);
        console.log(`Featured images:         ${stats.featuredImagesDownloaded}`);
        console.log(`Inline images downloaded: ${stats.inlineImagesDownloaded}`);
        console.log(`Inline images replaced:  ${stats.inlineImagesReplaced}`);
        console.log(`Failures:               ${stats.failures.length}`);
        
        if (stats.failures.length > 0) {
            console.log(`\nFailures:`);
            stats.failures.slice(0, 10).forEach((failure, i) => {
                console.log(`  ${i + 1}. ${failure.type}: ${failure.url || failure.id || failure.post_id || 'unknown'}`);
                console.log(`     Error: ${failure.error}`);
            });
            if (stats.failures.length > 10) {
                console.log(`  ... and ${stats.failures.length - 10} more (see log file)`);
            }
        }
        
        console.log(`\n${'='.repeat(60)}`);
        
        if (isDryRun) {
            console.log('\nThis was a DRY RUN. No data was imported.');
            console.log('Run with --import to perform the actual import.');
        } else {
            console.log('\nImport data prepared. Use the admin import page to import into the blog system.');
            console.log(`Import file: ${outputFile}`);
            if (shouldWipe) {
                console.log('\nNote: --wipe flag was set. Remember to delete existing posts before importing.');
            }
        }
        
    } catch (error) {
        console.error('\nError:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

export { fetchAllPosts, processPost };

