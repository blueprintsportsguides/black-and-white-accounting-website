#!/usr/bin/env python3
"""
Add Tools link to navigation on all HTML pages
"""
import os
import re
import glob

# Find all HTML files (excluding admin and dist)
html_files = []
for root, dirs, files in os.walk('.'):
    # Skip admin, dist, node_modules, and other directories
    dirs[:] = [d for d in dirs if d not in ['admin', 'dist', 'node_modules', 'data', 'logs', 'Images', 'public', 'scripts']]
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

# Pattern to find the Insights link and add Tools after it
pattern1 = r'(<a href="/blog" class="nav-link">Insights</a>)\s*</ul>'
replacement1 = r'\1\n                    <li class="nav-item"><a href="/tools" class="nav-link">Tools</a></li>\n                </ul>'

# Pattern for pages that have the link without li tags
pattern2 = r'(<a href="/blog" class="nav-link">Insights</a>)'
replacement2 = r'<li class="nav-item">\1</li>\n                    <li class="nav-item"><a href="/tools" class="nav-link">Tools</a></li>'

# Pattern for pages that already have li tags
pattern3 = r'(<li class="nav-item"><a href="/blog" class="nav-link">Insights</a></li>)'
replacement3 = r'\1\n                    <li class="nav-item"><a href="/tools" class="nav-link">Tools</a></li>'

updated = 0
skipped = 0

for filepath in html_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if Tools link already exists
        if '/tools' in content and 'nav-link' in content:
            skipped += 1
            continue
        
        # Skip admin pages
        if 'admin' in filepath.lower():
            skipped += 1
            continue
        
        original_content = content
        
        # Try pattern 3 first (with li tags)
        if re.search(pattern3, content):
            content = re.sub(pattern3, replacement3, content)
        # Try pattern 2 (without li tags)
        elif re.search(pattern2, content):
            content = re.sub(pattern2, replacement2, content)
        # Try pattern 1 (before closing ul)
        elif re.search(pattern1, content):
            content = re.sub(pattern1, replacement1, content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            updated += 1
            print(f'Updated: {filepath}')
        else:
            skipped += 1
    except Exception as e:
        print(f'Error processing {filepath}: {e}')
        skipped += 1

print(f'\nUpdated {updated} files')
print(f'Skipped {skipped} files')
