#!/usr/bin/env python3
"""
Script to generate all topic detail pages for accounts and tax services.
This creates individual pages for each service topic with properly formatted content.
"""

import os
import re

# Ensure directories exist
os.makedirs('services-accounts', exist_ok=True)
os.makedirs('services-tax', exist_ok=True)

def get_base_template():
    """Get the base HTML template"""
    return '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>{title} - Black and White Accounting</title>
    <link rel="icon" type="image/png" href="/Images/circle logo.png">
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <!-- Header -->
    <header class="site-header">
        <div class="header-container">
            <div class="header-logo">
                <a href="/">
                    <img src="/Images/long logo.png" alt="Black and White Accounting" class="logo-horizontal">
                </a>
            </div>
            <nav class="main-nav">
                <div class="mobile-menu-header">
                    <img src="/Images/long logo.png" alt="Black and White Accounting" style="height: 32px;">
                    <button class="mobile-menu-close" aria-label="Close menu">×</button>
                </div>
                <ul class="nav-list">
                    <li class="nav-item has-mega-menu">
                        <a href="/services" class="nav-link">Services</a>
                        <div class="mega-menu">
                            <div class="mega-menu-content">
                                <div class="mega-menu-pillar">
                                    <h3>Tax</h3>
                                    <p>Helping you stay compliant, efficient, and confident.</p>
                                    <ul class="mega-menu-sublinks">
                                        <li><a href="/services-tax#personal-tax">Personal Tax</a></li>
                                        <li><a href="/services-tax#business-tax">Business Tax</a></li>
                                        <li><a href="/services-tax#property-tax">Property & Specialist Tax</a></li>
                                    </ul>
                                    <a href="/services-tax" class="mega-menu-cta">Explore Tax Services</a>
                                </div>
                                <div class="mega-menu-pillar">
                                    <h3>Accounts</h3>
                                    <p>Clear, accurate accounts you can actually understand.</p>
                                    <ul class="mega-menu-sublinks">
                                        <li><a href="/services-accounts#core-services">Core Services</a></li>
                                        <li><a href="/services-accounts#business-structures">Business Structures</a></li>
                                        <li><a href="/services-accounts#specialised">Specialised Accounts</a></li>
                                    </ul>
                                    <a href="/services-accounts" class="mega-menu-cta">Explore Accounts Services</a>
                                </div>
                                <div class="mega-menu-pillar">
                                    <h3>Advisory</h3>
                                    <p>Forward-thinking advice to help your business grow.</p>
                                    <ul class="mega-menu-sublinks">
                                        <li><a href="/services-advisory#growth">Business Growth & Planning</a></li>
                                        <li><a href="/services-advisory#profit">Profit & Efficiency</a></li>
                                        <li><a href="/services-advisory#decisions">Support for Key Decisions</a></li>
                                    </ul>
                                    <a href="/services-advisory" class="mega-menu-cta">Explore Advisory Services</a>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li class="nav-item">
                        <a href="/sectors" class="nav-link">Sectors</a>
                    </li>
                    <li class="nav-item">
                        <a href="/about" class="nav-link">About</a>
                    </li>
                    <li class="nav-item">
                        <a href="/blog" class="nav-link">Insights</a>
                    </li>
                    <li class="nav-item">
                        <a href="/contact" class="nav-link">Contact</a>
                    </li>
                </ul>
            </nav>
            <div class="header-ctas">
                <a href="tel:08001404644" class="btn btn-primary">Phone Us</a>
                <a href="/contact" class="btn btn-secondary">Make an Enquiry</a>
            </div>
            <button class="mobile-menu-toggle" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="main-content">
        <!-- Breadcrumb -->
        <section class="section" style="padding-top: var(--spacing-lg); padding-bottom: var(--spacing-sm);">
            <div class="section-container">
                <nav style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                    <a href="/" style="color: var(--text-secondary); text-decoration: none;">Home</a> / 
                    <a href="{parent_url}" style="color: var(--text-secondary); text-decoration: none;">{parent_name}</a> / 
                    <span style="color: var(--text-primary);">{topic_name}</span>
                </nav>
            </div>
        </section>

        <!-- Page Header -->
        <section class="section">
            <div class="section-container">
                <div class="service-page-header">
                    <h1>{topic_name}</h1>
                    <p class="service-page-intro">{intro}</p>
                </div>
            </div>
        </section>
{content}
        <!-- CTA -->
        <section class="section">
            <div class="section-container">
                <div class="cta-banner cta-banner-gradient-1">
                    <h2>{cta_title}</h2>
                    <p>{cta_text}</p>
                    <div class="cta-banner-actions">
                        <a href="/contact" class="btn btn-primary">Get Started</a>
                        <a href="tel:08001404644" class="btn btn-secondary">Call 0800 140 4644</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- Back to Services -->
        <section class="section-alt">
            <div class="section-container">
                <div style="text-align: center; padding: var(--spacing-xl) 0;">
                    <a href="{parent_url}" class="btn btn-secondary">← Back to {parent_name}</a>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
        <div class="footer-container">
            <div class="footer-section footer-logo-section">
                <img src="/Images/long logo.png" alt="Black and White Accounting" class="footer-logo">
            </div>
            <div class="footer-section footer-services">
                <h4>Services</h4>
                <ul class="footer-links">
                    <li><a href="/services-tax">Tax</a></li>
                    <li><a href="/services-accounts">Accounts</a></li>
                    <li><a href="/services-advisory">Advisory</a></li>
                </ul>
            </div>
            <div class="footer-section footer-sectors">
                <h4>Sectors</h4>
                <ul class="footer-links">
                    <li><a href="/sectors/construction">Construction</a></li>
                    <li><a href="/sectors/property">Property & Landlords</a></li>
                    <li><a href="/sectors/ecommerce">E-commerce</a></li>
                    <li><a href="/sectors/professional-services">Professional Services</a></li>
                    <li><a href="/sectors/retail">Retail</a></li>
                    <li><a href="/sectors/trades">Trades</a></li>
                    <li><a href="/sectors/startups">Startups</a></li>
                    <li><a href="/sectors/healthcare">Healthcare</a></li>
                    <li><a href="/sectors/hospitality">Hospitality</a></li>
                </ul>
            </div>
            <div class="footer-section footer-contact">
                <h4>Contact</h4>
                <p class="footer-phone">
                    <a href="tel:08001404644">0800 140 4644</a>
                </p>
                <div class="footer-locations">
                    <div class="footer-location">
                        <strong>Wraysbury</strong>
                        <p>Wraysbury Hall, Ferry Lane<br>Wraysbury, Staines-Upon-Thames TW19 6HG</p>
                    </div>
                    <div class="footer-location">
                        <strong>Herriard</strong>
                        <p>The Well House, 4 Stable Court<br>Herriard, Basingstoke, England, RG25 2PL</p>
                    </div>
                </div>
                <a href="/contact" class="btn btn-secondary btn-small">Make an Enquiry</a>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="footer-container">
                <div class="footer-legal">
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms & Conditions</a>
                </div>
                <p class="footer-copyright">&copy; 2024 Black and White Accounting. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="/script.js"></script>
</body>
</html>'''

def create_page(topic_data):
    """Create a topic page from topic data"""
    template = get_base_template()
    
    # Format the template
    page = template.format(
        title=topic_data['title'],
        topic_name=topic_data['name'],
        intro=topic_data['intro'],
        parent_url=topic_data['parent_url'],
        parent_name=topic_data['parent_name'],
        content=topic_data['content'],
        cta_title=topic_data.get('cta_title', f"Ready to get started with {topic_data['name']}?"),
        cta_text=topic_data.get('cta_text', f"Let us help you with {topic_data['name'].lower()} so you can focus on what matters most.")
    )
    
    # Write the file
    with open(topic_data['filename'], 'w') as f:
        f.write(page)
    print(f"✓ Created {topic_data['filename']}")

# This script will be used to generate pages - content will be added in next step
print("Template script created. Ready to generate pages.")
