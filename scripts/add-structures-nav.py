#!/usr/bin/env python3
"""
Add Structures link to navigation on all HTML pages.
"""

import os
import re
import glob

# Find all HTML files
html_files = []
for pattern in ['*.html', '**/*.html']:
    html_files.extend(glob.glob(pattern, recursive=True))

# Exclude node_modules, dist, and admin files
html_files = [f for f in html_files if not any(exclude in f for exclude in ['node_modules', 'dist', 'admin', 'scripts'])]

print(f"Found {len(html_files)} HTML files to update\n")

updated_count = 0

for filepath in html_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if Structures link already exists
        if 'href="/structures"' in content:
            print(f"⏭️  Skipping {filepath} (already has Structures link)")
            continue
        
        # Pattern to find the Sectors link and add Structures after it
        # Look for: <li class="nav-item"><a href="/sectors" class="nav-link">Sectors</a></li>
        pattern = r'(<li class="nav-item"><a href="/sectors" class="nav-link">Sectors</a></li>)'
        
        if re.search(pattern, content):
            # Add Structures link after Sectors
            replacement = r'\1\n                    <li class="nav-item"><a href="/structures" class="nav-link">Structures</a></li>'
            new_content = re.sub(pattern, replacement, content)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ Updated {filepath}")
            updated_count += 1
        else:
            # Try alternative pattern (without li wrapper)
            pattern2 = r'(<a href="/sectors" class="nav-link">Sectors</a>)'
            if re.search(pattern2, content):
                replacement = r'\1\n                    <li class="nav-item"><a href="/structures" class="nav-link">Structures</a></li>'
                new_content = re.sub(pattern2, replacement, content)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"✅ Updated {filepath} (alternative pattern)")
                updated_count += 1
            else:
                print(f"⚠️  No Sectors link found in {filepath}")
    
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")

print(f"\n✅ Updated {updated_count} files")
