#!/usr/bin/env python3
"""
Add scroll animation classes to service cards and sector cards.
"""

import os
import re
import glob

# Find all HTML files
html_files = []
for pattern in ['*.html', 'services-*/*.html', 'sectors-*.html', 'structures-*.html']:
    html_files.extend(glob.glob(pattern, recursive=True))

# Exclude node_modules, dist, and admin files
html_files = [f for f in html_files if not any(exclude in f for exclude in ['node_modules', 'dist', 'admin', 'scripts'])]

print(f"Found {len(html_files)} HTML files to update\n")

updated_count = 0

for filepath in html_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Add scroll animations to service-topic-card
        pattern1 = r'(<div class="service-topic-card")'
        matches = list(re.finditer(pattern1, content))
        for i, match in enumerate(matches):
            stagger_class = f' stagger-{(i % 6) + 1}'
            replacement = match.group(1) + ' scroll-fade-in' + stagger_class
            content = content[:match.start()] + replacement + content[match.end():]
            # Adjust subsequent match positions
            for j in range(i + 1, len(matches)):
                matches[j] = type('Match', (), {
                    'start': lambda self, offset=match.end() - match.start() + len(stagger_class) + len(' scroll-fade-in'): matches[j].start() + offset,
                    'end': lambda self, offset=match.end() - match.start() + len(stagger_class) + len(' scroll-fade-in'): matches[j].end() + offset,
                    'group': matches[j].group
                })()
        
        # Add scroll animations to sector-card
        pattern2 = r'(<a href="[^"]*" class="sector-card")'
        matches2 = list(re.finditer(pattern2, content))
        for i, match in enumerate(matches2):
            stagger_class = f' stagger-{(i % 6) + 1}'
            replacement = match.group(1) + ' scroll-fade-in' + stagger_class
            content = content[:match.start()] + replacement + content[match.end():]
        
        # Add scroll animations to service-pillar-card (if not already there)
        pattern3 = r'(<div class="card service-pillar-card")(?!.*scroll-fade-in)'
        matches3 = list(re.finditer(pattern3, content))
        for i, match in enumerate(matches3):
            stagger_class = f' stagger-{(i % 6) + 1}'
            replacement = match.group(1) + ' scroll-fade-in' + stagger_class
            content = content[:match.start()] + replacement + content[match.end():]
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Updated {filepath}")
            updated_count += 1
    
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")

print(f"\n✅ Updated {updated_count} files")
