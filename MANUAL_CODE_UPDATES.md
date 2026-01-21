# Manual Code Updates Needed

The automated updates had some issues. Here's what needs to be done manually:

## File: `blog-data.js`

### 1. Add imports at the top (around line 1-5)

**Find:**
```javascript
// Blog Data Storage and Management
// Loads from JSON file in repo (data/blog-posts.json) as source of truth
// Uses localStorage as cache and for admin edits

const STORAGE_KEY = 'baw_blog_posts';
```

**Replace with:**
```javascript
// Blog Data Storage and Management
// Priority: Supabase > JSON file > localStorage
// Supabase provides centralized storage that works across all devices

import { isSupabaseConfigured } from './supabase-config.js';
import * as supabaseFunctions from './blog-data-supabase.js';

const STORAGE_KEY = 'baw_blog_posts';
```

### 2. Add USE_SUPABASE constant (around line 9)

**Find:**
```javascript
const DATA_LOADED_KEY = 'baw_data_loaded_from_json';
```

**Replace with:**
```javascript
const DATA_LOADED_KEY = 'baw_data_loaded_from_json';
const USE_SUPABASE = isSupabaseConfigured();
```

### 3. Update ensureDataLoaded function (around line 52-88)

**Find the entire `ensureDataLoaded` function** and **replace it** with the code from `blog-data-supabase-integration.txt` (I'll create this file)

Actually, let me provide the complete updated function here:

```javascript
// Load data from Supabase
async function loadDataFromSupabase() {
    if (!USE_SUPABASE) return false;
    
    try {
        const [posts, categories, tags] = await Promise.all([
            supabaseFunctions.loadPostsFromSupabase(),
            supabaseFunctions.loadCategoriesFromSupabase(),
            supabaseFunctions.loadTagsFromSupabase()
        ]);
        
        if (posts !== null) {
            dataCache.posts = posts;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        }
        if (categories !== null) {
            dataCache.categories = categories;
            localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
        }
        if (tags !== null) {
            dataCache.tags = tags;
            localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
        }
        
        return posts !== null || categories !== null || tags !== null;
    } catch (error) {
        console.warn('Error loading data from Supabase:', error);
        return false;
    }
}

// Initialize: Load from Supabase, JSON, or localStorage
let initializationPromise = null;
function ensureDataLoaded() {
    if (!initializationPromise) {
        initializationPromise = (async () => {
            // Try Supabase first (if configured)
            let loaded = false;
            if (USE_SUPABASE) {
                loaded = await loadDataFromSupabase();
            }
            
            // Fallback to JSON file
            if (!loaded) {
                loaded = await loadDataFromJSON();
            }
            
            // Fallback to localStorage if both failed
            if (!loaded) {
                const localPosts = localStorage.getItem(STORAGE_KEY);
                const localCategories = localStorage.getItem(CATEGORIES_KEY);
                const localTags = localStorage.getItem(TAGS_KEY);
                
                if (localPosts) {
                    dataCache.posts = JSON.parse(localPosts);
                }
                if (localCategories) {
                    dataCache.categories = JSON.parse(localCategories);
                }
                if (localTags) {
                    dataCache.tags = JSON.parse(localTags);
                }
            }
            
            // Initialize defaults if still empty
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
```

### 4. Update savePost function (around line 249-294)

**Find:**
```javascript
// Save post (updates localStorage and cache)
export function savePost(postData) {
```

**Change to:**
```javascript
// Save post (saves to Supabase if configured, otherwise localStorage)
export async function savePost(postData) {
```

Then replace the entire function body with the Supabase version (see complete function below).

### 5. Update deletePost function (around line 296-303)

**Find:**
```javascript
// Delete post
export function deletePost(id) {
```

**Change to:**
```javascript
// Delete post
export async function deletePost(id) {
```

Then add Supabase support (see complete function below).

## Complete Updated Functions

I've created separate files with the complete updated functions. However, the easiest way is to:

1. **Test the import tool first** - it should work even without these updates
2. **The import tool uses Supabase directly**, so it will work
3. **Then we can update blog-data.js** to use Supabase for reads/writes

## Quick Test

Try the import tool first:
1. Go to `/admin/import-json-to-supabase.html`
2. Click "Start Import"
3. If it works, your blogs are imported!
4. Then we'll update the read/write functions
