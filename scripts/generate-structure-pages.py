#!/usr/bin/env python3
"""
Generate individual structure pages for the Structures section.
"""

import os

# Structure data with content and design variations
structures = [
    {
        "slug": "individuals",
        "title": "Individuals",
        "intro": "Personal tax and accounting support for individuals. We help you navigate Self Assessment, income tax planning, and personal financial compliance.",
        "what_section": {
            "title": "What is Personal Tax?",
            "content": "Personal tax covers all tax obligations for individuals in the UK, primarily through Self Assessment. This includes income tax on employment, self-employment, property income, dividends, and other sources. Understanding your personal tax position is essential for compliance and effective tax planning."
        },
        "who_section": {
            "title": "Who Needs Personal Tax Support?",
            "items": [
                {"title": "Self-Employed Individuals", "desc": "Sole traders and freelancers with trading income"},
                {"title": "High Earners", "desc": "Those earning over £100,000 or with complex income sources"},
                {"title": "Property Owners", "desc": "Landlords with rental income from UK or overseas property"},
                {"title": "Investors", "desc": "Individuals with dividend income, interest, or capital gains"},
                {"title": "Multiple Income Sources", "desc": "Those with employment, self-employment, and investment income"},
                {"title": "Overseas Income", "desc": "UK residents with foreign income or non-residents with UK income"}
            ]
        },
        "requirements_section": {
            "title": "Key Requirements (2026/27)",
            "items": [
                {"title": "Self Assessment Deadline", "desc": "31 January following the tax year end (for online returns)"},
                {"title": "Payment Deadline", "desc": "31 January - tax due for previous tax year"},
                {"title": "Payment on Account", "desc": "31 July - first payment on account (if applicable)"},
                {"title": "Record Keeping", "desc": "Keep records for at least 5 years after the 31 January filing deadline"}
            ]
        },
        "services_section": {
            "title": "What We Do",
            "items": [
                {"title": "Self Assessment Returns", "desc": "Prepare and file your Self Assessment tax return, ensuring all income sources are declared correctly"},
                {"title": "Tax Planning", "desc": "Advise on tax-efficient strategies, allowances, and reliefs to minimise your tax liability"},
                {"title": "Income Tax Calculations", "desc": "Calculate income tax, National Insurance, and other personal tax obligations"},
                {"title": "HMRC Liaison", "desc": "Handle correspondence with HMRC, including enquiries and investigations"}
            ]
        },
        "design": "grid-2"
    },
    {
        "slug": "sole-traders",
        "title": "Sole Traders",
        "intro": "Complete accounting and tax support for self-employed individuals operating as sole traders. From bookkeeping to Self Assessment, we handle everything so you can focus on your business.",
        "what_section": {
            "title": "What is a Sole Trader?",
            "content": "A sole trader is a self-employed individual who runs their own business as an individual. It's the simplest business structure - there's no legal distinction between you and your business. You keep all profits after tax, but you're personally liable for all business debts. Sole traders must register with HMRC for Self Assessment and keep proper business records."
        },
        "who_section": {
            "title": "Who Operates as a Sole Trader?",
            "items": [
                {"title": "Freelancers", "desc": "Independent professionals offering services"},
                {"title": "Tradespeople", "desc": "Plumbers, electricians, builders, and other skilled trades"},
                {"title": "Consultants", "desc": "Business consultants, coaches, and advisors"},
                {"title": "Online Sellers", "desc": "E-commerce sellers and marketplace traders"},
                {"title": "Creative Professionals", "desc": "Designers, photographers, writers, and artists"},
                {"title": "Service Providers", "desc": "Hairdressers, personal trainers, tutors, and other service businesses"}
            ]
        },
        "requirements_section": {
            "title": "Legal Requirements (2026)",
            "items": [
                {"title": "HMRC Registration", "desc": "Register for Self Assessment by 5 October in your second tax year"},
                {"title": "Self Assessment Return", "desc": "File Self Assessment return by 31 January following the tax year end"},
                {"title": "Tax Payment", "desc": "Pay income tax and Class 2/4 National Insurance by 31 January"},
                {"title": "Record Keeping", "desc": "Keep business records for at least 5 years after the 31 January filing deadline"},
                {"title": "VAT Registration", "desc": "Register for VAT if turnover exceeds £90,000 (2026/27 threshold)"}
            ]
        },
        "services_section": {
            "title": "What We Do",
            "items": [
                {"title": "Bookkeeping", "desc": "Maintain accurate records of all business income and expenses"},
                {"title": "Sole Trade Accounts", "desc": "Prepare annual accounts showing profit or loss for your business"},
                {"title": "Self Assessment", "desc": "Complete and file your Self Assessment tax return with HMRC"},
                {"title": "Tax Planning", "desc": "Advise on allowable expenses, capital allowances, and tax-efficient strategies"},
                {"title": "VAT Returns", "desc": "Handle VAT registration and quarterly VAT returns if applicable"},
                {"title": "Business Advice", "desc": "Provide guidance on when to consider incorporating as a limited company"}
            ]
        },
        "design": "grid-3"
    },
    {
        "slug": "partnerships",
        "title": "Partnerships",
        "intro": "Specialist accounting support for traditional partnerships. We handle partnership accounts, profit allocation, and ensure each partner's tax obligations are met correctly.",
        "what_section": {
            "title": "What is a Partnership?",
            "content": "A partnership is a business structure where two or more people carry on a business together with a view to profit. Unlike limited companies, partnerships don't have separate legal personality - partners are personally liable for business debts. Partnerships must prepare accounts to calculate each partner's share of profit for their individual Self Assessment returns, and file a partnership tax return (SA800) with HMRC."
        },
        "who_section": {
            "title": "Who Operates as a Partnership?",
            "items": [
                {"title": "Professional Partnerships", "desc": "Solicitors, accountants, doctors, and other professionals"},
                {"title": "Trading Partnerships", "desc": "Businesses with two or more owners sharing profits"},
                {"title": "Family Partnerships", "desc": "Family members running a business together"},
                {"title": "General Partnerships", "desc": "Any business with multiple owners operating as a partnership"}
            ]
        },
        "requirements_section": {
            "title": "Legal Requirements (2026)",
            "items": [
                {"title": "Partnership Tax Return", "desc": "File partnership tax return (SA800) by 31 January following the tax year end"},
                {"title": "Partner Self Assessment", "desc": "Each partner must include their share of profit in their Self Assessment return"},
                {"title": "Record Keeping", "desc": "Keep business records for at least 5 years after the 31 January filing deadline"},
                {"title": "Profit Allocation", "desc": "Accounts must clearly show each partner's share of profit or loss"}
            ]
        },
        "services_section": {
            "title": "What We Do",
            "items": [
                {"title": "Partnership Accounts", "desc": "Prepare annual accounts with appropriation account showing profit allocation"},
                {"title": "Partnership Tax Return", "desc": "File partnership tax return (SA800) with HMRC"},
                {"title": "Partner Statements", "desc": "Provide individual profit statements for each partner's Self Assessment"},
                {"title": "Profit Sharing Advice", "desc": "Advise on tax-efficient profit allocation between partners"}
            ]
        },
        "design": "grid-2"
    },
    {
        "slug": "limited-companies",
        "title": "Limited Companies",
        "intro": "Complete accounting and compliance support for limited companies. From statutory accounts to Corporation Tax, we ensure your company meets all Companies House and HMRC requirements.",
        "what_section": {
            "title": "What is a Limited Company?",
            "content": "A limited company is a separate legal entity from its owners (shareholders). It provides limited liability protection - shareholders are only liable for the amount they've invested. Limited companies must file annual accounts with Companies House, submit Corporation Tax returns to HMRC, and comply with various Companies Act requirements. This structure offers tax advantages and credibility but comes with more administrative obligations."
        },
        "who_section": {
            "title": "Who Operates as a Limited Company?",
            "items": [
                {"title": "Trading Companies", "desc": "Active businesses of all sizes and sectors"},
                {"title": "Property Companies", "desc": "Companies holding property investments"},
                {"title": "Service Businesses", "desc": "Consultancies, agencies, and professional service firms"},
                {"title": "E-commerce Businesses", "desc": "Online retailers and digital businesses"},
                {"title": "Startups", "desc": "New businesses seeking investment or growth"},
                {"title": "Dormant Companies", "desc": "Companies not currently trading but maintaining registration"}
            ]
        },
        "requirements_section": {
            "title": "Legal Requirements (2026)",
            "items": [
                {"title": "Statutory Accounts", "desc": "File annual accounts with Companies House within 9 months of year end"},
                {"title": "Corporation Tax Return", "desc": "File CT600 return and pay Corporation Tax within 9 months of year end"},
                {"title": "Confirmation Statement", "desc": "File confirmation statement (formerly annual return) each year"},
                {"title": "Record Keeping", "desc": "Keep accounting records for at least 6 years"},
                {"title": "VAT Returns", "desc": "File quarterly VAT returns if VAT registered"}
            ]
        },
        "services_section": {
            "title": "What We Do",
            "items": [
                {"title": "Statutory Accounts", "desc": "Prepare and file annual accounts with Companies House"},
                {"title": "Corporation Tax", "desc": "Calculate Corporation Tax and file CT600 return with HMRC"},
                {"title": "Management Accounts", "desc": "Prepare monthly or quarterly management accounts for business decisions"},
                {"title": "Confirmation Statements", "desc": "File annual confirmation statements with Companies House"},
                {"title": "VAT Returns", "desc": "Handle VAT registration and quarterly returns"},
                {"title": "Payroll & PAYE", "desc": "Process payroll and handle PAYE obligations for employees"}
            ]
        },
        "design": "grid-3"
    },
    {
        "slug": "llp",
        "title": "Limited Liability Partnerships",
        "intro": "Specialist accounting support for LLPs, combining partnership flexibility with limited liability protection. We handle LLP accounts, member tax returns, and all compliance requirements.",
        "what_section": {
            "title": "What is an LLP?",
            "content": "A Limited Liability Partnership (LLP) combines the flexibility of a traditional partnership with the limited liability protection of a company. Members (partners) have limited liability but the business operates like a partnership. LLPs must file accounts with Companies House (similar to limited companies) and each member includes their profit share in their Self Assessment return. This structure is popular with professional services firms."
        },
        "who_section": {
            "title": "Who Operates as an LLP?",
            "items": [
                {"title": "Professional Services", "desc": "Accountants, solicitors, architects, and consultants"},
                {"title": "Property LLPs", "desc": "Property investment and development partnerships"},
                {"title": "Investment LLPs", "desc": "Investment management and fund structures"},
                {"title": "Multi-Member Businesses", "desc": "Any business wanting partnership flexibility with limited liability"}
            ]
        },
        "requirements_section": {
            "title": "Legal Requirements (2026)",
            "items": [
                {"title": "LLP Accounts", "desc": "File annual accounts with Companies House within 9 months of year end"},
                {"title": "Member Tax Returns", "desc": "Each member must include their profit share in their Self Assessment return"},
                {"title": "Confirmation Statement", "desc": "File confirmation statement each year with Companies House"},
                {"title": "Record Keeping", "desc": "Keep accounting records for at least 6 years"}
            ]
        },
        "services_section": {
            "title": "What We Do",
            "items": [
                {"title": "LLP Accounts", "desc": "Prepare and file annual accounts with Companies House"},
                {"title": "Member Statements", "desc": "Provide individual profit statements for each member's Self Assessment"},
                {"title": "Tax Planning", "desc": "Advise on tax-efficient profit allocation between members"},
                {"title": "Compliance", "desc": "Handle all Companies House and HMRC filing requirements"}
            ]
        },
        "design": "grid-2"
    },
    {
        "slug": "landlords",
        "title": "Landlords",
        "intro": "Specialist tax and accounting support for landlords. Whether you own one property or a portfolio, we help you navigate property tax, rental income reporting, and landlord-specific compliance.",
        "what_section": {
            "title": "What is Property Income Tax?",
            "content": "Property income tax applies to rental income from UK and overseas property. Landlords must report rental income and expenses through Self Assessment (for individuals) or Corporation Tax returns (for companies). Recent changes have reduced mortgage interest relief and introduced new reporting requirements. Understanding property tax rules is essential for maximising allowable expenses and minimising tax liability."
        },
        "who_section": {
            "title": "Who Needs Landlord Tax Support?",
            "items": [
                {"title": "Individual Landlords", "desc": "Individuals renting out residential or commercial property"},
                {"title": "Property Companies", "desc": "Limited companies holding property investments"},
                {"title": "Portfolio Landlords", "desc": "Landlords with multiple properties or high rental income"},
                {"title": "Accidental Landlords", "desc": "Those renting out property due to relocation or inheritance"},
                {"title": "HMO Landlords", "desc": "Landlords operating houses in multiple occupation"},
                {"title": "Furnished Holiday Lets", "desc": "Landlords with furnished holiday lettings (special tax treatment)"}
            ]
        },
        "requirements_section": {
            "title": "Key Requirements (2026/27)",
            "items": [
                {"title": "Rental Income Reporting", "desc": "Report all rental income and expenses in Self Assessment or Corporation Tax return"},
                {"title": "Mortgage Interest", "desc": "Mortgage interest relief restricted to basic rate (20%) for individuals"},
                {"title": "Property Allowance", "desc": "£1,000 property allowance available if gross rental income under £1,000"},
                {"title": "Capital Gains Tax", "desc": "CGT payable on property disposal (28% for higher rate taxpayers)"}
            ]
        },
        "services_section": {
            "title": "What We Do",
            "items": [
                {"title": "Rental Accounts", "desc": "Prepare annual accounts showing rental income and allowable expenses"},
                {"title": "Tax Returns", "desc": "Include property income in Self Assessment or Corporation Tax returns"},
                {"title": "Expense Claims", "desc": "Maximise allowable expenses including repairs, maintenance, and finance costs"},
                {"title": "Capital Gains Planning", "desc": "Advise on CGT planning for property disposals"},
                {"title": "Structure Advice", "desc": "Advise on whether to hold property personally or through a company"}
            ]
        },
        "design": "grid-3"
    },
    {
        "slug": "charities",
        "title": "Charities & Not-for-Profit",
        "intro": "Specialist accounting support for charities and not-for-profit organisations. We understand charity tax reliefs, Gift Aid, fund accounting, and the unique compliance requirements of charitable organisations.",
        "what_section": {
            "title": "What is Charity Accounting?",
            "content": "Charity accounting follows specific rules and regulations set by the Charity Commission and HMRC. Charities benefit from various tax reliefs including Gift Aid, charity tax exemptions, and VAT reliefs. Charities must prepare accounts according to the Statement of Recommended Practice (SORP) and file annual returns with the Charity Commission. Understanding these requirements is essential for maintaining charitable status and maximising tax benefits."
        },
        "who_section": {
            "title": "Who Needs Charity Accounting Support?",
            "items": [
                {"title": "Registered Charities", "desc": "Charities registered with the Charity Commission"},
                {"title": "Unregistered Charities", "desc": "Small charities below registration threshold"},
                {"title": "Community Groups", "desc": "Local community organisations and groups"},
                {"title": "Trusts", "desc": "Charitable trusts and foundations"},
                {"title": "Social Enterprises", "desc": "Businesses with social or environmental purposes"}
            ]
        },
        "requirements_section": {
            "title": "Legal Requirements (2026)",
            "items": [
                {"title": "Annual Accounts", "desc": "Prepare accounts according to charity SORP"},
                {"title": "Charity Commission Return", "desc": "File annual return with Charity Commission"},
                {"title": "Gift Aid Claims", "desc": "Submit Gift Aid claims to HMRC for tax relief"},
                {"title": "Record Keeping", "desc": "Keep detailed records of all income and expenditure"}
            ]
        },
        "services_section": {
            "title": "What We Do",
            "items": [
                {"title": "Charity Accounts", "desc": "Prepare annual accounts in accordance with charity SORP"},
                {"title": "Gift Aid Management", "desc": "Handle Gift Aid claims and donor declarations"},
                {"title": "Charity Commission Returns", "desc": "File annual returns with the Charity Commission"},
                {"title": "Tax Relief Claims", "desc": "Maximise charity tax reliefs and exemptions"},
                {"title": "Fund Accounting", "desc": "Track restricted and unrestricted funds separately"}
            ]
        },
        "design": "grid-2"
    },
    {
        "slug": "cic",
        "title": "Community Interest Company",
        "intro": "Specialist accounting support for Community Interest Companies (CICs). We help you navigate CIC-specific reporting, community benefit requirements, and ensure compliance with CIC regulations.",
        "what_section": {
            "title": "What is a CIC?",
            "content": "A Community Interest Company (CIC) is a special type of limited company designed for social enterprises that want to use their profits and assets for the public good. CICs must pass a 'community interest test' and are subject to an 'asset lock' preventing assets from being distributed to members. CICs file accounts with Companies House like regular limited companies but must also report on community benefit activities to the CIC Regulator."
        },
        "who_section": {
            "title": "Who Operates as a CIC?",
            "items": [
                {"title": "Social Enterprises", "desc": "Businesses with social or environmental missions"},
                {"title": "Community Projects", "desc": "Local community development and regeneration projects"},
                {"title": "Social Housing", "desc": "Housing associations and community housing providers"},
                {"title": "Training Providers", "desc": "Organisations providing skills training and employment support"},
                {"title": "Environmental Projects", "desc": "Businesses focused on environmental sustainability"}
            ]
        },
        "requirements_section": {
            "title": "Legal Requirements (2026)",
            "items": [
                {"title": "CIC Annual Return", "desc": "File CIC34 annual return with CIC Regulator"},
                {"title": "Statutory Accounts", "desc": "File annual accounts with Companies House"},
                {"title": "Community Benefit Report", "desc": "Report on community benefit activities in annual return"},
                {"title": "Asset Lock Compliance", "desc": "Ensure asset lock provisions are maintained"}
            ]
        },
        "services_section": {
            "title": "What We Do",
            "items": [
                {"title": "CIC Accounts", "desc": "Prepare and file annual accounts with Companies House"},
                {"title": "CIC Returns", "desc": "File CIC34 annual return with CIC Regulator"},
                {"title": "Community Benefit Reporting", "desc": "Help prepare community benefit reports"},
                {"title": "Compliance", "desc": "Ensure compliance with CIC regulations and asset lock"}
            ]
        },
        "design": "grid-2"
    },
    {
        "slug": "clubs-societies",
        "title": "Clubs and Societies",
        "intro": "Accounting support for membership organisations, clubs, and societies. We handle membership income, club accounts, and ensure compliance with regulations for unincorporated associations.",
        "what_section": {
            "title": "What are Club Accounts?",
            "content": "Clubs and societies are typically unincorporated associations - groups of people who come together for a common purpose. They're not separate legal entities, so members are personally liable. Clubs must keep proper accounts to track membership income, subscriptions, and expenses. Depending on income levels, clubs may need to register for VAT and file tax returns. Understanding club accounting rules helps ensure compliance and proper financial management."
        },
        "who_section": {
            "title": "Who Needs Club Accounting Support?",
            "items": [
                {"title": "Sports Clubs", "desc": "Football, cricket, tennis, and other sports clubs"},
                {"title": "Social Clubs", "desc": "Members' clubs, working men's clubs, and social organisations"},
                {"title": "Hobby Clubs", "desc": "Photography, gardening, and other hobby groups"},
                {"title": "Professional Associations", "desc": "Trade associations and professional bodies"},
                {"title": "Community Groups", "desc": "Local community associations and groups"}
            ]
        },
        "requirements_section": {
            "title": "Key Requirements (2026)",
            "items": [
                {"title": "Record Keeping", "desc": "Keep accurate records of all income and expenditure"},
                {"title": "VAT Registration", "desc": "Register for VAT if taxable turnover exceeds £90,000"},
                {"title": "Tax Returns", "desc": "File tax returns if club has taxable income or is VAT registered"},
                {"title": "Membership Records", "desc": "Maintain accurate membership and subscription records"}
            ]
        },
        "services_section": {
            "title": "What We Do",
            "items": [
                {"title": "Club Accounts", "desc": "Prepare annual accounts showing income, expenditure, and reserves"},
                {"title": "Membership Management", "desc": "Track membership subscriptions and income"},
                {"title": "VAT Returns", "desc": "Handle VAT registration and quarterly returns if applicable"},
                {"title": "Tax Returns", "desc": "File tax returns if required"},
                {"title": "Financial Advice", "desc": "Provide guidance on club financial management and compliance"}
            ]
        },
        "design": "grid-3"
    }
]

def generate_structure_page(structure):
    """Generate HTML for a structure page."""
    
    # Determine grid class based on design
    grid_class = structure["design"]
    if grid_class == "grid-2":
        grid_style = "grid-template-columns: repeat(2, 1fr);"
    elif grid_class == "grid-3":
        grid_style = "grid-template-columns: repeat(3, 1fr);"
    else:
        grid_style = "grid-template-columns: repeat(2, 1fr);"
    
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>{structure["title"]} - Black and White Accounting</title>
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
                                        <li><a href="/services-tax#personal">Personal Tax</a></li>
                                        <li><a href="/services-tax#business">Business Tax</a></li>
                                        <li><a href="/services-tax#property">Property & Specialist Tax</a></li>
                                    </ul>
                                    <a href="/services-tax" class="mega-menu-cta">Explore Tax Services</a>
                                </div>
                                <div class="mega-menu-pillar">
                                    <h3>Accounts</h3>
                                    <p>Clear, accurate accounts you can actually understand.</p>
                                    <ul class="mega-menu-sublinks">
                                        <li><a href="/services-accounts#sole-traders">Sole Traders & Freelancers</a></li>
                                        <li><a href="/services-accounts#limited-companies">Limited Companies</a></li>
                                        <li><a href="/services-accounts#compliance">Compliance & Reporting</a></li>
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
                    <li class="nav-item"><a href="/sectors" class="nav-link">Sectors</a></li>
                    <li class="nav-item"><a href="/structures" class="nav-link">Structures</a></li>
                    <li class="nav-item"><a href="/about" class="nav-link">About</a></li>
                    <li class="nav-item"><a href="/blog" class="nav-link">Insights</a></li>
                    <li class="nav-item"><a href="/tools" class="nav-link">Tools</a></li>
                </ul>
            </nav>
            <div class="header-ctas">
                <a href="tel:08001404644" class="btn btn-primary">Phone Us</a>
                <a href="/contact" class="btn btn-secondary">Contact Us</a>
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
                    <a href="/structures" style="color: var(--text-secondary); text-decoration: none;">Structures</a> / 
                    <span style="color: var(--text-primary);">{structure["title"]}</span>
                </nav>
            </div>
        </section>

        <!-- Page Header -->
        <section class="section">
            <div class="section-container">
                <div class="service-page-header">
                    <h1>{structure["title"]}</h1>
                    <p class="service-page-intro">{structure["intro"]}</p>
                </div>
            </div>
        </section>

        <!-- What Section -->
        <section class="section-alt">
            <div class="section-container">
                <div style="max-width: 800px; margin: 0 auto;">
                    <h2 style="margin-bottom: var(--spacing-md);">{structure["what_section"]["title"]}</h2>
                    <p style="font-size: var(--font-size-lg); line-height: 1.7; color: var(--text-secondary); margin-bottom: var(--spacing-lg);">{structure["what_section"]["content"]}</p>
                </div>
            </div>
        </section>

        <!-- Who Section -->
        <section class="section">
            <div class="section-container">
                <h2 style="margin-bottom: var(--spacing-lg); text-align: center;">{structure["who_section"]["title"]}</h2>
                <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--spacing-xl); max-width: 600px; margin-left: auto; margin-right: auto;">Understanding who needs this type of support helps ensure you're getting the right advice.</p>
                
                <div style="max-width: 1200px; margin: 0 auto;">
                    <div class="grid" style="{grid_style} gap: var(--spacing-lg);">
'''
    
    for item in structure["who_section"]["items"]:
        html += f'''                        <div style="background: var(--bg-white); padding: var(--spacing-lg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                            <h3 style="font-size: var(--font-size-lg); margin-bottom: var(--spacing-sm); color: var(--text-primary);">{item["title"]}</h3>
                            <p style="color: var(--text-secondary); line-height: 1.6; margin: 0;">{item["desc"]}</p>
                        </div>
'''
    
    html += '''                    </div>
                </div>
            </div>
        </section>

        <!-- Requirements Section -->
        <section class="section-alt-2">
            <div class="section-container">
                <div style="max-width: 800px; margin: 0 auto;">
                    <h2 style="margin-bottom: var(--spacing-lg);">'''
    html += structure["requirements_section"]["title"]
    html += '''</h2>
                    <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xl); font-size: var(--font-size-lg);">Important deadlines and requirements:</p>
                    
                    <div style="background: var(--bg-white); padding: var(--spacing-xl); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
                        <ul style="list-style: none; padding: 0; margin: 0;">
'''
    
    for i, item in enumerate(structure["requirements_section"]["items"]):
        border_style = "border-bottom: 1px solid rgba(0, 0, 0, 0.06);" if i < len(structure["requirements_section"]["items"]) - 1 else ""
        html += f'''                            <li style="padding: var(--spacing-md) 0; {border_style}">
                                <strong style="display: block; margin-bottom: var(--spacing-xs); color: var(--text-primary);">{item["title"]}</strong>
                                <span style="color: var(--text-secondary);">{item["desc"]}</span>
                            </li>
'''
    
    html += '''                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- Services Section -->
        <section class="section">
            <div class="section-container">
                <h2 style="margin-bottom: var(--spacing-lg); text-align: center;">'''
    html += structure["services_section"]["title"]
    html += '''</h2>
                <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--spacing-xl); max-width: 700px; margin-left: auto; margin-right: auto; font-size: var(--font-size-lg);">Our specialist support includes:</p>
                
                <div style="max-width: 1200px; margin: 0 auto;">
                    <div class="grid" style="''' + grid_style + ''' gap: var(--spacing-lg);">
'''
    
    for item in structure["services_section"]["items"]:
        html += f'''                        <div style="background: var(--bg-white); padding: var(--spacing-xl); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
                            <h3 style="font-size: var(--font-size-lg); margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 2px solid rgba(0, 0, 0, 0.08); padding-bottom: var(--spacing-sm);">{item["title"]}</h3>
                            <p style="color: var(--text-secondary); margin: 0; line-height: 1.6;">{item["desc"]}</p>
                        </div>
'''
    
    html += '''                    </div>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="section-alt">
            <div class="section-container">
                <div class="cta-banner cta-banner-gradient-1">
                    <h2>Ready to get your accounting sorted?</h2>
                    <p>We'll ensure you're compliant and help minimise your tax liability.</p>
                    <div class="cta-banner-actions">
                        <a href="/contact" class="btn btn-primary">Get Started</a>
                        <a href="tel:08001404644" class="btn btn-secondary">Call 0800 140 4644</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- Back to Structures -->
        <section class="section">
            <div class="section-container">
                <div style="text-align: center; padding: var(--spacing-xl) 0;">
                    <a href="/structures" class="btn btn-secondary">← Back to Structures</a>
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
                <a href="/contact" class="btn btn-secondary btn-small">Contact Us</a>
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

    <!-- Mobile Sticky Bottom Bar -->

    <script src="/script.js"></script>
</body>
</html>'''
    
    return html

# Create structures directory if it doesn't exist
os.makedirs("structures", exist_ok=True)

# Generate all structure pages
for structure in structures:
    filename = f"structures-{structure['slug']}.html"
    filepath = os.path.join("structures", filename)
    
    html_content = generate_structure_page(structure)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"Generated: {filepath}")

print(f"\n✅ Generated {len(structures)} structure pages!")
