#!/usr/bin/env python3
"""
Generate missing sector pages
"""
import os

# Read template
with open('sectors-construction.html', 'r', encoding='utf-8') as f:
    template = f.read()

# Define missing sectors with their content
sectors = [
    {
        'filename': 'sectors-contractors-consultants.html',
        'title': 'Contractors & Consultants',
        'intro': 'Contractors and consultants face unique challenges, from IR35 compliance and project-based accounting to managing expenses and optimising tax efficiency. We provide specialist support that understands the realities of contract work, helping you stay compliant while maximising your take-home pay.',
        'challenges': [
            {
                'title': 'IR35 Compliance',
                'description': 'Determining employment status, understanding IR35 rules, and ensuring contracts are structured correctly can be complex and have significant tax implications.'
            },
            {
                'title': 'Project-Based Income',
                'description': 'Irregular income patterns, multiple clients, and project-based work create cashflow challenges that need careful planning and management.'
            },
            {
                'title': 'Expense Management',
                'description': 'Understanding what expenses are allowable, keeping proper records, and maximising tax relief requires specialist knowledge and attention to detail.'
            },
            {
                'title': 'Tax Efficiency',
                'description': 'Choosing between limited company, umbrella, or sole trader structures, and optimising salary vs dividend extraction can significantly impact your take-home pay.'
            }
        ],
        'help_items': [
            {
                'title': 'IR35 Support',
                'description': 'We help you understand IR35 status, review contracts, and ensure compliance to avoid unexpected tax bills and penalties.'
            },
            {
                'title': 'Structure Advice',
                'description': 'We advise on the most tax-efficient business structure for your circumstances, whether limited company, umbrella, or sole trader.'
            },
            {
                'title': 'Expense Optimisation',
                'description': 'We help you identify all allowable expenses, keep proper records, and maximise tax relief on travel, equipment, and professional costs.'
            },
            {
                'title': 'Tax Planning',
                'description': 'We provide strategic tax planning to optimise your salary and dividend mix, manage payments on account, and minimise your overall tax liability.'
            }
        ],
        'services': [
            {
                'link': '/services-tax#personal',
                'title': 'Personal Tax',
                'description': 'Self Assessment, IR35 compliance, and contractor-specific tax planning to keep you compliant and tax-efficient.'
            },
            {
                'link': '/services-accounts',
                'title': 'Accounts Services',
                'description': 'Clear accounts that track income, expenses, and profitability across multiple projects and clients.'
            },
            {
                'link': '/services-advisory#growth',
                'title': 'Advisory Services',
                'description': 'Cashflow forecasting and strategic planning to help you manage irregular income and plan for the future.'
            }
        ],
        'cta_title': 'Ready to get specialist support for Contractors & Consultants?',
        'cta_text': "Let's discuss how we can help you with tailored accounting and tax advice for your contract work."
    },
    {
        'filename': 'sectors-freelancers-creatives.html',
        'title': 'Freelancers & Creatives',
        'intro': 'Freelancers and creative professionals face unique accounting challenges, from managing irregular income and project-based work to claiming creative industry expenses and understanding tax obligations. We provide specialist support that understands the creative industries, helping freelancers stay compliant while focusing on their craft.',
        'challenges': [
            {
                'title': 'Irregular Income',
                'description': 'Unpredictable income patterns, seasonal variations, and project-based work create cashflow challenges that need careful planning and management.'
            },
            {
                'title': 'Expense Claims',
                'description': 'Understanding what creative expenses are allowable, from equipment and software to workspace costs, requires specialist knowledge.'
            },
            {
                'title': 'Multiple Income Streams',
                'description': 'Managing income from various sources, including freelance work, royalties, and passive income, can complicate tax returns and record-keeping.'
            },
            {
                'title': 'Tax Obligations',
                'description': 'Understanding when to register for VAT, managing payments on account, and ensuring compliance can be overwhelming for freelancers.'
            }
        ],
        'help_items': [
            {
                'title': 'Income Management',
                'description': 'We help you track income from multiple sources, forecast cashflow, and plan for seasonal variations in your freelance work.'
            },
            {
                'title': 'Expense Optimisation',
                'description': 'We identify all allowable creative expenses, from equipment and software to workspace costs, helping you maximise tax relief.'
            },
            {
                'title': 'Tax Compliance',
                'description': 'We handle Self Assessment returns, manage VAT registration when needed, and ensure you meet all tax obligations on time.'
            },
            {
                'title': 'Financial Planning',
                'description': 'We provide cashflow forecasting and budgeting advice to help you manage irregular income and plan for quieter periods.'
            }
        ],
        'services': [
            {
                'link': '/services-tax#personal',
                'title': 'Personal Tax',
                'description': 'Self Assessment, expense claims, and freelancer-specific tax planning to keep you compliant and tax-efficient.'
            },
            {
                'link': '/services-accounts',
                'title': 'Accounts Services',
                'description': 'Simple, clear accounts that track income and expenses without overwhelming you with unnecessary complexity.'
            },
            {
                'link': '/services-advisory#growth',
                'title': 'Advisory Services',
                'description': 'Cashflow planning and budgeting advice to help you manage irregular income and grow your freelance business.'
            }
        ],
        'cta_title': 'Ready to get specialist support for Freelancers & Creatives?',
        'cta_text': "Let's discuss how we can help you with tailored accounting and tax advice for your freelance work."
    },
    {
        'filename': 'sectors-farming-agriculture.html',
        'title': 'Farming & Agriculture',
        'intro': 'Farming and agriculture businesses face unique accounting challenges, from seasonal income patterns and agricultural reliefs to complex VAT rules and inheritance tax planning. We provide specialist support that understands the agricultural sector, helping farming businesses stay compliant while maximising available reliefs and allowances.',
        'challenges': [
            {
                'title': 'Seasonal Income',
                'description': 'Seasonal income patterns, harvest cycles, and weather-dependent revenue create cashflow challenges that need careful planning and management.'
            },
            {
                'title': 'Agricultural Reliefs',
                'description': 'Understanding agricultural property relief, business property relief, and other farming-specific tax reliefs requires specialist knowledge.'
            },
            {
                'title': 'VAT Complexity',
                'description': 'Different VAT rates for agricultural products, flat rate schemes, and complex rules around land and property transactions can be challenging.'
            },
            {
                'title': 'Succession Planning',
                'description': 'Planning for farm succession, managing inheritance tax, and ensuring smooth transitions requires careful tax and estate planning.'
            }
        ],
        'help_items': [
            {
                'title': 'Agricultural Tax Reliefs',
                'description': 'We help you understand and claim all available agricultural reliefs, from property relief to farming-specific allowances and exemptions.'
            },
            {
                'title': 'Seasonal Cashflow',
                'description': 'We help you forecast cashflow across seasons, plan for harvest periods, and manage income variations throughout the year.'
            },
            {
                'title': 'VAT Management',
                'description': 'We navigate agricultural VAT rules, help with flat rate schemes, and ensure compliance with complex land and property VAT regulations.'
            },
            {
                'title': 'Succession Planning',
                'description': 'We provide estate and inheritance tax planning to help you plan for farm succession and minimise tax on transfers.'
            }
        ],
        'services': [
            {
                'link': '/services-tax#business',
                'title': 'Business Tax',
                'description': 'Agricultural tax reliefs, VAT management, and farming-specific tax planning to keep you compliant and tax-efficient.'
            },
            {
                'link': '/services-accounts',
                'title': 'Accounts Services',
                'description': 'Clear accounts that track seasonal income, agricultural expenses, and help you understand your farm\'s true profitability.'
            },
            {
                'link': '/services-advisory#decisions',
                'title': 'Advisory Services',
                'description': 'Succession planning, cashflow forecasting, and strategic advice to help you plan for the future of your farm.'
            }
        ],
        'cta_title': 'Ready to get specialist support for Farming & Agriculture?',
        'cta_text': "Let's discuss how we can help your farming business with tailored accounting and tax advice."
    },
    {
        'filename': 'sectors-it-tech.html',
        'title': 'IT & Tech Businesses',
        'intro': 'IT and tech businesses face unique accounting challenges, from R&D tax credits and software development costs to international tax and equity compensation. We provide specialist support that understands the tech industry, helping technology businesses stay compliant while maximising available reliefs and optimising their tax position.',
        'challenges': [
            {
                'title': 'R&D Tax Credits',
                'description': 'Identifying qualifying R&D activities, calculating enhanced deductions, and claiming tax credits requires specialist knowledge of R&D relief rules.'
            },
            {
                'title': 'Software Development Costs',
                'description': 'Understanding how to account for software development, capitalisation rules, and tax treatment of development costs can be complex.'
            },
            {
                'title': 'International Tax',
                'description': 'Managing international sales, cross-border transactions, and understanding VAT obligations for digital services can be challenging.'
            },
            {
                'title': 'Equity Compensation',
                'description': 'Understanding tax treatment of share options, EMI schemes, and equity compensation requires specialist knowledge and careful planning.'
            }
        ],
        'help_items': [
            {
                'title': 'R&D Tax Credits',
                'description': 'We help identify qualifying R&D activities, calculate enhanced deductions, and claim R&D tax credits to reduce your Corporation Tax or receive cash credits.'
            },
            {
                'title': 'Software Accounting',
                'description': 'We advise on accounting for software development costs, capitalisation rules, and ensure proper tax treatment of development expenditure.'
            },
            {
                'title': 'International Tax',
                'description': 'We help navigate VAT for digital services, manage international sales, and ensure compliance with cross-border tax obligations.'
            },
            {
                'title': 'Equity Planning',
                'description': 'We provide advice on share option schemes, EMI schemes, and help structure equity compensation in a tax-efficient way.'
            }
        ],
        'services': [
            {
                'link': '/services-tax#business',
                'title': 'Business Tax',
                'description': 'R&D tax credits, Corporation Tax planning, and tech-specific tax reliefs to keep you compliant and tax-efficient.'
            },
            {
                'link': '/services-accounts',
                'title': 'Accounts Services',
                'description': 'Clear accounts that properly reflect software development costs, R&D activities, and help you understand your tech business\'s profitability.'
            },
            {
                'link': '/services-advisory#growth',
                'title': 'Advisory Services',
                'description': 'Growth planning, funding support, and strategic advice to help you scale your tech business and attract investment.'
            }
        ],
        'cta_title': 'Ready to get specialist support for IT & Tech Businesses?',
        'cta_text': "Let's discuss how we can help your tech business with tailored accounting and tax advice."
    },
    {
        'filename': 'sectors-automotive-engineering.html',
        'title': 'Automotive, Engineering & Manufacturing',
        'intro': 'Automotive, engineering, and manufacturing businesses face unique accounting challenges, from capital allowances on machinery and equipment to R&D tax credits and complex VAT rules. We provide specialist support that understands manufacturing and engineering, helping businesses stay compliant while maximising available reliefs and optimising cashflow.',
        'challenges': [
            {
                'title': 'Capital Allowances',
                'description': 'Understanding capital allowances on machinery, equipment, and plant, and maximising available reliefs requires specialist knowledge.'
            },
            {
                'title': 'R&D Tax Credits',
                'description': 'Identifying qualifying R&D activities in engineering and manufacturing, and claiming enhanced tax relief can significantly reduce tax liability.'
            },
            {
                'title': 'Stock Management',
                'description': 'Managing stock valuation, work in progress, and ensuring accurate cost accounting can be complex in manufacturing businesses.'
            },
            {
                'title': 'VAT Complexity',
                'description': 'Different VAT rates for parts, labour, and services, plus complex rules around exports and imports, make VAT compliance challenging.'
            }
        ],
        'help_items': [
            {
                'title': 'Capital Allowances',
                'description': 'We help identify all qualifying capital expenditure, maximise capital allowances, and ensure you\'re claiming all available reliefs on machinery and equipment.'
            },
            {
                'title': 'R&D Tax Credits',
                'description': 'We identify qualifying R&D activities in engineering and manufacturing, calculate enhanced deductions, and claim R&D tax credits.'
            },
            {
                'title': 'Cost Accounting',
                'description': 'We help with accurate cost accounting, stock valuation, and work in progress accounting to ensure your accounts reflect true profitability.'
            },
            {
                'title': 'VAT Management',
                'description': 'We navigate complex VAT rules for manufacturing, help with export/import VAT, and ensure compliance with all VAT obligations.'
            }
        ],
        'services': [
            {
                'link': '/services-tax#business',
                'title': 'Business Tax',
                'description': 'R&D tax credits, capital allowances, and manufacturing-specific tax planning to keep you compliant and tax-efficient.'
            },
            {
                'link': '/services-accounts',
                'title': 'Accounts Services',
                'description': 'Clear accounts with accurate cost accounting, stock valuation, and manufacturing-specific reporting.'
            },
            {
                'link': '/services-advisory#profit',
                'title': 'Advisory Services',
                'description': 'Cost analysis, profit improvement, and strategic planning to help you optimise manufacturing efficiency and profitability.'
            }
        ],
        'cta_title': 'Ready to get specialist support for Automotive, Engineering & Manufacturing?',
        'cta_text': "Let's discuss how we can help your manufacturing business with tailored accounting and tax advice."
    },
    {
        'filename': 'sectors-education-training.html',
        'title': 'Education & Training',
        'intro': 'Education and training businesses face unique accounting challenges, from managing course income and student fees to understanding VAT exemptions and claiming training-related expenses. We provide specialist support that understands the education sector, helping training businesses and educational institutions stay compliant while optimising their tax position.',
        'challenges': [
            {
                'title': 'VAT Exemptions',
                'description': 'Understanding which education and training services are VAT-exempt, and managing mixed supplies of exempt and taxable services, can be complex.'
            },
            {
                'title': 'Course Income',
                'description': 'Managing income from courses, student fees, and training programs, often with advance payments and refunds, requires careful accounting.'
            },
            {
                'title': 'Expense Claims',
                'description': 'Understanding what training-related expenses are allowable, from course materials to training venue costs, requires specialist knowledge.'
            },
            {
                'title': 'Regulatory Compliance',
                'description': 'Ensuring compliance with education sector regulations, managing student data, and meeting reporting requirements can be challenging.'
            }
        ],
        'help_items': [
            {
                'title': 'VAT Management',
                'description': 'We help navigate education VAT exemptions, manage mixed supplies, and ensure compliance with complex VAT rules for training services.'
            },
            {
                'title': 'Income Management',
                'description': 'We help track course income, manage student fees, handle advance payments and refunds, and ensure accurate revenue recognition.'
            },
            {
                'title': 'Expense Optimisation',
                'description': 'We identify all allowable training expenses, from course materials to venue costs, helping you maximise tax relief.'
            },
            {
                'title': 'Compliance Support',
                'description': 'We ensure compliance with education sector regulations and help with any required reporting and record-keeping.'
            }
        ],
        'services': [
            {
                'link': '/services-tax#business',
                'title': 'Business Tax',
                'description': 'VAT management, expense claims, and education-specific tax planning to keep you compliant and tax-efficient.'
            },
            {
                'link': '/services-accounts',
                'title': 'Accounts Services',
                'description': 'Clear accounts that track course income, training expenses, and help you understand your education business\'s profitability.'
            },
            {
                'link': '/services-advisory#growth',
                'title': 'Advisory Services',
                'description': 'Growth planning, cashflow forecasting, and strategic advice to help you expand your training business.'
            }
        ],
        'cta_title': 'Ready to get specialist support for Education & Training?',
        'cta_text': "Let's discuss how we can help your education business with tailored accounting and tax advice."
    },
    {
        'filename': 'sectors-charities.html',
        'title': 'Charities & Not-for-Profit',
        'intro': 'Charities and not-for-profit organisations face unique accounting challenges, from charity-specific tax reliefs and Gift Aid to ensuring compliance with charity regulations and managing restricted funds. We provide specialist support that understands the charity sector, helping organisations stay compliant while maximising available reliefs and optimising their financial position.',
        'challenges': [
            {
                'title': 'Charity Tax Reliefs',
                'description': 'Understanding charity-specific tax reliefs, Gift Aid, and ensuring compliance with charity tax rules requires specialist knowledge.'
            },
            {
                'title': 'Restricted Funds',
                'description': 'Managing restricted and unrestricted funds, ensuring proper accounting for designated funds, and meeting donor requirements can be complex.'
            },
            {
                'title': 'Gift Aid',
                'description': 'Managing Gift Aid claims, ensuring compliance with Gift Aid rules, and maximising tax relief on donations requires careful administration.'
            },
            {
                'title': 'Regulatory Compliance',
                'description': 'Ensuring compliance with Charity Commission regulations, meeting reporting requirements, and managing charity governance can be challenging.'
            }
        ],
        'help_items': [
            {
                'title': 'Charity Tax Reliefs',
                'description': 'We help you understand and claim all available charity tax reliefs, from Gift Aid to charity-specific exemptions and allowances.'
            },
            {
                'title': 'Fund Management',
                'description': 'We help with proper accounting for restricted and unrestricted funds, ensuring compliance with donor requirements and charity regulations.'
            },
            {
                'title': 'Gift Aid Administration',
                'description': 'We manage Gift Aid claims, ensure compliance with Gift Aid rules, and help maximise tax relief on eligible donations.'
            },
            {
                'title': 'Compliance Support',
                'description': 'We ensure compliance with Charity Commission regulations, help with annual returns, and support charity governance requirements.'
            }
        ],
        'services': [
            {
                'link': '/services-tax#business',
                'title': 'Business Tax',
                'description': 'Charity tax reliefs, Gift Aid management, and charity-specific tax planning to keep you compliant and tax-efficient.'
            },
            {
                'link': '/services-accounts',
                'title': 'Accounts Services',
                'description': 'Clear charity accounts that properly reflect restricted and unrestricted funds, and meet Charity Commission requirements.'
            },
            {
                'link': '/services-advisory#decisions',
                'title': 'Advisory Services',
                'description': 'Strategic planning, financial management, and governance support to help you achieve your charitable objectives.'
            }
        ],
        'cta_title': 'Ready to get specialist support for Charities & Not-for-Profit?',
        'cta_text': "Let's discuss how we can help your charity with tailored accounting and tax advice."
    }
]

def generate_sector_page(sector_data):
    """Generate a sector page from template and data"""
    page = template
    
    # Replace title
    page = page.replace('<title>Construction - Black and White Accounting</title>', 
                       f'<title>{sector_data["title"]} - Black and White Accounting</title>')
    
    # Replace intro
    page = page.replace(
        '<h1>Construction</h1>',
        f'<h1>{sector_data["title"]}</h1>'
    )
    page = page.replace(
        'The construction industry faces unique accounting challenges, from CIS compliance and subcontractor management to seasonal cashflow and complex VAT rules. We provide specialist support that understands the realities of construction work, helping contractors and construction businesses stay compliant while maximising profitability.',
        sector_data['intro']
    )
    
    # Replace challenges
    challenges_html = '<h2>Common Challenges</h2>\n                    <ul class="challenges-list">'
    for challenge in sector_data['challenges']:
        challenges_html += f'''
                        <li>
                            <strong>{challenge["title"]}</strong>
                            <p>{challenge["description"]}</p>
                        </li>'''
    challenges_html += '\n                    </ul>'
    
    import re
    page = re.sub(
        r'<h2>Common Challenges</h2>.*?</ul>',
        challenges_html,
        page,
        flags=re.DOTALL
    )
    
    # Replace help items
    help_html = '<h2>How Black and White Accounting Helps</h2>\n                    <div class="how-we-help-grid">'
    for item in sector_data['help_items']:
        help_html += f'''
                        <div class="how-we-help-item">
                            <h3>{item["title"]}</h3>
                            <p>{item["description"]}</p>
                        </div>'''
    help_html += '\n                    </div>'
    
    page = re.sub(
        r'<h2>How Black and White Accounting Helps</h2>.*?</div>\s*</div>',
        help_html,
        page,
        flags=re.DOTALL
    )
    
    # Replace relevant services
    services_html = f'<h2>Relevant Services</h2>\n                    <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--spacing-xl); max-width: 600px; margin-left: auto; margin-right: auto;">Our {sector_data["title"]} clients typically benefit from these services:</p>\n                    <div class="relevant-services-grid">'
    for service in sector_data['services']:
        services_html += f'''
                        <a href="{service["link"]}" class="relevant-service-card">
                            <h3>{service["title"]}</h3>
                            <p>{service["description"]}</p>
                            <span class="btn btn-secondary btn-small">Explore {service["title"].split()[0]}</span>
                        </a>'''
    services_html += '\n                    </div>'
    
    page = re.sub(
        r'<h2>Relevant Services</h2>.*?</div>\s*</div>',
        services_html,
        page,
        flags=re.DOTALL
    )
    
    # Replace CTA
    page = re.sub(
        r'Ready to get specialist support for Construction\?',
        sector_data['cta_title'],
        page
    )
    page = re.sub(
        r"Let's discuss how we can help your construction business with tailored accounting and tax advice\.",
        sector_data['cta_text'],
        page
    )
    
    return page

# Generate all sector pages
for sector in sectors:
    page_content = generate_sector_page(sector)
    with open(sector['filename'], 'w', encoding='utf-8') as f:
        f.write(page_content)
    print(f'Created {sector["filename"]}')

print('\nAll missing sector pages generated!')
