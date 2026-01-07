#!/usr/bin/env node

/**
 * WordPress WXR XML Import Script
 * Imports WordPress blog posts from WXR XML export into the blog system
 */

import { XMLParser } from 'fast-xml-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuration
const IMAGE_CACHE_DIR = path.join(ROOT_DIR, 'data', 'wp-media-cache');
const IMAGE_STORAGE_DIR = path.join(ROOT_DIR, 'Images', 'blog');
const MAX_RETRIES = 3;
const DOWNLOAD_TIMEOUT = 30000; // 30 seconds

// Statistics
const stats = {
    totalItems: 0,
    postsFound: 0,
    postsImported: 0,
    postsUpdated: 0,
    attachmentsFound: 0,
    imagesDownloaded: 0,
    imagesReplaced: 0,
    categoriesCreated: 0,
    tagsCreated: 0,
    failures: []
};

// Data structures
const attachmentsById = new Map();
const categoriesBySlug = new Map();
const tagsBySlug = new Map();
const existingPosts = new Map(); // legacy_wp_id -> post data
let isDryRun = false;

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
                    'User-Agent': 'Mozilla/5.0 (compatible; WordPress Import Bot)'
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
        
        stats.imagesDownloaded++;
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
    
    // Match <img src="...">
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
        imageUrls.add(match[1]);
    }
    
    // Match links to image files
    const linkRegex = /<a[^>]+href=["']([^"']+\.(jpg|jpeg|png|gif|webp|svg))["'][^>]*>/gi;
    while ((match = linkRegex.exec(html)) !== null) {
        imageUrls.add(match[1]);
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
                // Replace all occurrences
                updatedHtml = updatedHtml.replace(new RegExp(escapeRegex(originalUrl), 'g'), result.storedUrl);
                replacedCount++;
            }
        } catch (error) {
            // Continue on error, keep original URL
        }
    }
    
    if (replacedCount > 0) {
        stats.imagesReplaced += replacedCount;
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
 * Generate excerpt from content if missing
 */
function generateExcerpt(content, maxLength = 200) {
    if (!content) return '';
    
    // Strip HTML tags
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (text.length <= maxLength) return text;
    
    // Find last space before maxLength
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

/**
 * Map WordPress status to our status
 */
function mapStatus(wpStatus) {
    switch (wpStatus) {
        case 'publish':
            return 'published';
        case 'draft':
            return 'draft';
        case 'future':
            return 'scheduled';
        case 'private':
            return 'draft'; // Map private to draft
        default:
            return 'draft';
    }
}

/**
 * Parse date string
 */
function parseDate(dateStr, gmtDateStr) {
    // Prefer GMT date
    if (gmtDateStr && gmtDateStr !== '0000-00-00 00:00:00') {
        const date = new Date(gmtDateStr + ' UTC');
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    
    // Fallback to local date
    if (dateStr && dateStr !== '0000-00-00 00:00:00') {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    
    // Default to now
    return new Date().toISOString();
}

/**
 * Generate slug from title
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Calculate reading time
 */
function calculateReadingTime(content) {
    if (!content) return 5;
    const text = content.replace(/<[^>]*>/g, ' ');
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(1, Math.ceil(words / 200));
}

/**
 * Parse XML file
 */
async function parseXML(filePath) {
    console.log(`Reading XML file: ${filePath}`);
    const xmlContent = await fs.readFile(filePath, 'utf-8');
    
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
        parseAttributeValue: true,
        trimValues: true,
        parseTrueNumberOnly: false,
        arrayMode: false
    });
    
    const result = parser.parse(xmlContent);
    return result;
}

/**
 * Process WordPress export
 */
async function processExport(xmlData) {
    const channel = xmlData.rss?.channel;
    if (!channel) {
        throw new Error('Invalid WXR format: channel not found');
    }
    
    const items = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);
    stats.totalItems = items.length;
    
    console.log(`Found ${items.length} items in XML`);
    
    // First pass: Build attachment map and taxonomy maps
    console.log('First pass: Building attachment and taxonomy maps...');
    
    for (const item of items) {
        const postType = item['wp:post_type']?.['#text'] || item['wp:post_type'];
        
        if (postType === 'attachment') {
            const attachmentId = item['wp:post_id']?.['#text'] || item['wp:post_id'];
            const attachmentUrl = item['wp:attachment_url']?.['#text'] || item['wp:attachment_url'];
            
            if (attachmentId && attachmentUrl) {
                // Extract alt text from postmeta
                let altText = null;
                const postmeta = Array.isArray(item['wp:postmeta']) ? item['wp:postmeta'] : [item['wp:postmeta']].filter(Boolean);
                for (const meta of postmeta) {
                    const key = meta['wp:meta_key']?.['#text'] || meta['wp:meta_key'];
                    const value = meta['wp:meta_value']?.['#text'] || meta['wp:meta_value'];
                    if (key === '_wp_attachment_image_alt') {
                        altText = value;
                    }
                }
                
                attachmentsById.set(String(attachmentId), {
                    url: attachmentUrl,
                    alt: altText,
                    title: item.title?.['#text'] || item.title || ''
                });
                stats.attachmentsFound++;
            }
        }
        
        // Build category/tag maps
        const categories = Array.isArray(item.category) ? item.category : [item.category].filter(Boolean);
        for (const cat of categories) {
            const domain = cat['@_domain'];
            const slug = cat['@_nicename'];
            const name = cat['#text'];
            
            if (domain === 'category' && slug && name) {
                categoriesBySlug.set(slug, { slug, name });
            } else if (domain === 'post_tag' && slug && name) {
                tagsBySlug.set(slug, { slug, name });
            }
        }
    }
    
    console.log(`Found ${attachmentsById.size} attachments`);
    console.log(`Found ${categoriesBySlug.size} categories`);
    console.log(`Found ${tagsBySlug.size} tags`);
    
    // Second pass: Process posts
    console.log('Second pass: Processing posts...');
    
    const postsToImport = [];
    
    for (const item of items) {
        const postType = item['wp:post_type']?.['#text'] || item['wp:post_type'];
        
        if (postType !== 'post') {
            continue; // Skip non-posts
        }
        
        stats.postsFound++;
        
        const wpPostId = item['wp:post_id']?.['#text'] || item['wp:post_id'];
        const title = item.title?.['#text'] || item.title || 'Untitled';
        const wpSlug = item['wp:post_name']?.['#text'] || item['wp:post_name'] || generateSlug(title);
        const content = item['content:encoded']?.['#text'] || item['content:encoded'] || '';
        const excerpt = item['excerpt:encoded']?.['#text'] || item['excerpt:encoded'] || '';
        const wpStatus = item['wp:status']?.['#text'] || item['wp:status'] || 'draft';
        const postDate = item['wp:post_date']?.['#text'] || item['wp:post_date'];
        const postDateGmt = item['wp:post_date_gmt']?.['#text'] || item['wp:post_date_gmt'];
        const modifiedDate = item['wp:post_modified_gmt']?.['#text'] || item['wp:post_modified_gmt'];
        const creator = item['dc:creator']?.['#text'] || item['dc:creator'] || '';
        const link = item.link?.['#text'] || item.link || '';
        
        // Extract postmeta
        const postmeta = Array.isArray(item['wp:postmeta']) ? item['wp:postmeta'] : [item['wp:postmeta']].filter(Boolean);
        const metaMap = {};
        for (const meta of postmeta) {
            const key = meta['wp:meta_key']?.['#text'] || meta['wp:meta_key'];
            const value = meta['wp:meta_value']?.['#text'] || meta['wp:meta_value'];
            if (key) {
                metaMap[key] = value;
            }
        }
        
        // Get featured image
        const thumbnailId = metaMap['_thumbnail_id'];
        let featuredImageUrl = null;
        let featuredImageAlt = null;
        
        if (thumbnailId) {
            const attachment = attachmentsById.get(String(thumbnailId));
            if (attachment) {
                if (!isDryRun) {
                    const result = await storeImage(attachment.url);
                    featuredImageUrl = result.storedUrl;
                    featuredImageAlt = attachment.alt || null;
                } else {
                    featuredImageUrl = attachment.url;
                    featuredImageAlt = attachment.alt || null;
                }
            }
        }
        
        // Process content and replace inline images
        let processedContent = content;
        if (!isDryRun) {
            processedContent = await replaceImageUrls(content);
        }
        
        // Extract categories and tags
        const categories = Array.isArray(item.category) ? item.category : [item.category].filter(Boolean);
        const postCategories = [];
        const postTags = [];
        
        for (const cat of categories) {
            const domain = cat['@_domain'];
            const slug = cat['@_nicename'];
            
            if (domain === 'category' && slug) {
                postCategories.push(slug);
            } else if (domain === 'post_tag' && slug) {
                postTags.push(slug);
            }
        }
        
        // Get primary category (first category)
        const primaryCategorySlug = postCategories[0] || null;
        
        // Get SEO metadata
        const metaTitle = metaMap['_yoast_wpseo_title'] || metaMap['rank_math_title'] || null;
        const metaDescription = metaMap['_yoast_wpseo_metadesc'] || metaMap['rank_math_description'] || null;
        
        // Build post object
        // If WordPress status was 'publish', set to published; otherwise keep as draft
        const mappedStatus = mapStatus(wpStatus);
        const shouldPublish = wpStatus === 'publish';
        
        const post = {
            legacy_wp_id: String(wpPostId),
            legacy_wp_url: link,
            title: title,
            slug: wpSlug,
            excerpt: excerpt || generateExcerpt(processedContent),
            content: processedContent, // Store as HTML
            status: shouldPublish ? 'published' : mappedStatus,
            published_at: shouldPublish ? parseDate(postDate, postDateGmt) : (wpStatus === 'future' ? parseDate(postDate, postDateGmt) : null),
            created_at: parseDate(postDate, postDateGmt),
            updated_at: modifiedDate ? parseDate(modifiedDate, modifiedDate) : new Date().toISOString(),
            author_name: creator,
            category_slug: primaryCategorySlug,
            tag_slugs: postTags,
            featured_image_url: featuredImageUrl,
            featured_image_alt: featuredImageAlt,
            meta_title: metaTitle,
            meta_description: metaDescription,
            reading_time_minutes: calculateReadingTime(processedContent)
        };
        
        postsToImport.push(post);
    }
    
    return {
        posts: postsToImport,
        categories: Array.from(categoriesBySlug.values()),
        tags: Array.from(tagsBySlug.values())
    };
}

/**
 * Main import function
 */
async function main() {
    const args = process.argv.slice(2);
    const fileIndex = args.indexOf('--file');
    const filePath = fileIndex >= 0 && args[fileIndex + 1] 
        ? args[fileIndex + 1] 
        : path.join(ROOT_DIR, 'data', 'blackandwhiteaccounting.WordPress.2026-01-07.xml');
    
    isDryRun = args.includes('--dry-run');
    const doImport = args.includes('--import');
    
    if (!doImport && !isDryRun) {
        console.error('Error: Must specify either --dry-run or --import');
        process.exit(1);
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`WordPress Import Script`);
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'IMPORT'}`);
    console.log(`File: ${filePath}`);
    console.log(`${'='.repeat(60)}\n`);
    
    try {
        // Ensure directories exist
        await ensureDir(IMAGE_CACHE_DIR);
        await ensureDir(IMAGE_STORAGE_DIR);
        await ensureDir(path.join(ROOT_DIR, 'logs'));
        
        // Parse XML
        const xmlData = await parseXML(filePath);
        
        // Process export
        const importData = await processExport(xmlData);
        
        // Generate output filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const outputFile = path.join(ROOT_DIR, 'data', `wp-import-${timestamp}.json`);
        const logFile = path.join(ROOT_DIR, 'logs', `wp-import-${timestamp}.json`);
        
        // Save import data
        if (!isDryRun) {
            await fs.writeFile(outputFile, JSON.stringify(importData, null, 2));
            console.log(`\nImport data saved to: ${outputFile}`);
        }
        
        // Generate log
        const log = {
            timestamp: new Date().toISOString(),
            mode: isDryRun ? 'dry-run' : 'import',
            stats: { ...stats },
            summary: {
                posts: importData.posts.length,
                categories: importData.categories.length,
                tags: importData.tags.length
            }
        };
        
        await fs.writeFile(logFile, JSON.stringify(log, null, 2));
        console.log(`Log saved to: ${logFile}`);
        
        // Print summary
        console.log(`\n${'='.repeat(60)}`);
        console.log('IMPORT SUMMARY');
        console.log(`${'='.repeat(60)}`);
        console.log(`Total items in XML:     ${stats.totalItems}`);
        console.log(`Posts found:            ${stats.postsFound}`);
        console.log(`Posts to import:        ${importData.posts.length}`);
        console.log(`Categories:             ${importData.categories.length}`);
        console.log(`Tags:                   ${importData.tags.length}`);
        console.log(`Attachments found:      ${stats.attachmentsFound}`);
        console.log(`Images downloaded:      ${stats.imagesDownloaded}`);
        console.log(`Images replaced:        ${stats.imagesReplaced}`);
        console.log(`Failures:               ${stats.failures.length}`);
        
        if (stats.failures.length > 0) {
            console.log(`\nFailures:`);
            stats.failures.forEach((failure, i) => {
                console.log(`  ${i + 1}. ${failure.type}: ${failure.url || failure.id || 'unknown'}`);
                console.log(`     Error: ${failure.error}`);
            });
        }
        
        console.log(`\n${'='.repeat(60)}`);
        
        if (isDryRun) {
            console.log('\nThis was a DRY RUN. No data was imported.');
            console.log('Run with --import to perform the actual import.');
        } else {
            console.log('\nImport data prepared. Use the admin import page to import into the blog system.');
            console.log(`Import file: ${outputFile}`);
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

export { processExport, parseXML };

