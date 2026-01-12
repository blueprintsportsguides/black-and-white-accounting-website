#!/usr/bin/env python3
"""
Generate all advisory service pages
"""
import os
import re

# Read template
template_file = 'services-accounts/management-accounts.html'
with open(template_file, 'r', encoding='utf-8') as f:
    template = f.read()

# Advisory services with their details
advisory_services = [
    {
        'filename': 'business-planning-startups.html',
        'title': 'Business Planning & Start-Ups',
        'intro': 'Comprehensive business planning and startup support to help new businesses establish proper foundations, plan for growth, and make informed decisions from day one.',
        'what': 'Business planning and startup services provide comprehensive support for new businesses, helping with business structure selection, financial planning, tax registration, and strategic planning for growth. We help startups establish proper accounting foundations and plan for tax-efficient growth from day one.',
        'who': [
            ('New Business Startups', 'Entrepreneurs launching new businesses'),
            ('Early Stage Companies', 'Companies in their first few years'),
            ('Business Restructures', 'Businesses changing structure or ownership'),
            ('Sole Traders Going Limited', 'Sole traders incorporating their business'),
            ('Partnership Formations', 'New partnerships being established'),
            ('Franchise Startups', 'New franchise operations')
        ],
        'what_we_do': [
            'Advise on business structure (sole trader, partnership, limited company)',
            'Create comprehensive business plans and financial forecasts',
            'Register for tax (Self Assessment, Corporation Tax, VAT)',
            'Set up accounting systems and bookkeeping',
            'Initial tax planning and strategy',
            'Help with business bank accounts and financial planning',
            'Ongoing support as business grows'
        ],
        'benefits': [
            ('Right Structure', 'Choose the most tax-efficient business structure'),
            ('Solid Foundation', 'Set up proper accounting from the start'),
            ('Growth Planning', 'Plan for tax-efficient growth'),
            ('Compliance', 'Ensure all registrations and initial compliance'),
            ('Strategic Advice', 'Expert guidance on key business decisions'),
            ('Peace of Mind', 'Professional support from day one')
        ]
    },
    {
        'filename': 'cashflow-forecasting-budgeting.html',
        'title': 'Cashflow Forecasting & Budgeting',
        'intro': 'Regular cashflow forecasts and budgets to help you plan ahead, avoid cashflow problems, and make informed financial decisions. Essential for managing working capital and planning for growth.',
        'what': 'Cashflow forecasting and budgeting services provide regular financial projections to help you plan ahead, avoid cashflow problems, and make informed financial decisions. We create detailed forecasts that show your expected income and expenses, helping you identify potential shortfalls and plan for growth opportunities.',
        'who': [
            ('Growing Businesses', 'Businesses experiencing growth or planning expansion'),
            ('Seasonal Businesses', 'Businesses with fluctuating income throughout the year'),
            ('Cashflow Concerns', 'Businesses experiencing or anticipating cashflow issues'),
            ('Planning Major Purchases', 'Businesses planning significant investments'),
            ('Seeking Funding', 'Businesses preparing for loan or investment applications'),
            ('All Business Sizes', 'From startups to established businesses')
        ],
        'what_we_do': [
            'Create detailed cashflow forecasts (monthly, quarterly, annual)',
            'Develop budgets and financial plans',
            'Identify potential cashflow shortfalls in advance',
            'Scenario planning for different business outcomes',
            'Working capital management advice',
            'Regular review and update of forecasts',
            'Integration with your accounting systems'
        ],
        'benefits': [
            ('Avoid Surprises', 'Identify cashflow issues before they become problems'),
            ('Better Planning', 'Make informed decisions with financial visibility'),
            ('Funding Ready', 'Professional forecasts for loan and investment applications'),
            ('Growth Support', 'Plan for expansion with confidence'),
            ('Working Capital', 'Optimise cash management and working capital'),
            ('Peace of Mind', 'Know your financial position at all times')
        ]
    },
    {
        'filename': 'growth-advisory.html',
        'title': 'Growth Advisory',
        'intro': 'Strategic advice to support your business growth ambitions. We help you identify opportunities, plan expansion, and make data-driven decisions about scaling your business.',
        'what': 'Growth advisory services provide strategic advice to support your business growth ambitions. We help you identify opportunities for sustainable expansion, plan for growth, and make data-driven decisions about scaling your business. Our approach combines financial analysis with strategic planning to support your growth goals.',
        'who': [
            ('Growing Businesses', 'Businesses ready to scale and expand'),
            ('Expansion Planning', 'Businesses planning to enter new markets or locations'),
            ('Product Development', 'Businesses launching new products or services'),
            ('Market Expansion', 'Businesses expanding into new territories'),
            ('Strategic Decisions', 'Businesses facing key growth decisions'),
            ('Ambitious Entrepreneurs', 'Business owners with clear growth goals')
        ],
        'what_we_do': [
            'Strategic growth planning and roadmaps',
            'Financial analysis to support growth decisions',
            'Market expansion feasibility analysis',
            'Growth scenario modelling and forecasting',
            'Identify growth opportunities and risks',
            'Support for expansion funding applications',
            'Regular strategic reviews and planning sessions'
        ],
        'benefits': [
            ('Strategic Growth', 'Plan growth with confidence and clarity'),
            ('Data-Driven Decisions', 'Make informed choices based on financial analysis'),
            ('Risk Management', 'Identify and mitigate growth risks'),
            ('Funding Support', 'Professional analysis for growth funding'),
            ('Sustainable Expansion', 'Grow in a controlled and sustainable way'),
            ('Expert Guidance', 'Strategic advice from experienced advisors')
        ]
    },
    {
        'filename': 'profit-improvement-cost-optimisation.html',
        'title': 'Profit Improvement & Cost Optimisation',
        'intro': 'Analysis and advice to improve profitability and reduce costs. We identify inefficiencies, analyse margins, and help you make your business more profitable and efficient.',
        'what': 'Profit improvement and cost optimisation services help businesses increase profitability by identifying inefficiencies, analysing costs, and developing strategies to improve margins. We provide detailed analysis of your business operations to find opportunities for cost savings and revenue improvement.',
        'who': [
            ('Profitability Concerns', 'Businesses with good revenue but low profits'),
            ('Margin Pressure', 'Businesses experiencing margin compression'),
            ('Cost Management', 'Businesses wanting to reduce costs'),
            ('Efficiency Improvement', 'Businesses seeking operational efficiency'),
            ('Pricing Strategy', 'Businesses reviewing pricing models'),
            ('All Business Sizes', 'From small businesses to larger operations')
        ],
        'what_we_do': [
            'Cost analysis and identification of inefficiencies',
            'Margin analysis by product, service, or department',
            'Pricing strategy review and recommendations',
            'Operational efficiency analysis',
            'Cost reduction strategies and implementation support',
            'Profitability improvement plans',
            'Regular monitoring and review of improvements'
        ],
        'benefits': [
            ('Increase Profits', 'Identify and implement profit improvement opportunities'),
            ('Cost Reduction', 'Find and eliminate unnecessary costs'),
            ('Better Margins', 'Improve margins through analysis and strategy'),
            ('Efficiency Gains', 'Streamline operations for better efficiency'),
            ('Competitive Pricing', 'Optimise pricing for maximum profitability'),
            ('Sustainable Growth', 'Build a more profitable business foundation')
        ]
    },
    {
        'filename': 'funding-support-investor-readiness.html',
        'title': 'Funding Support & Investor Readiness',
        'intro': 'Support for securing business funding, from loans to investment. We help prepare financial models, investor presentations, and due diligence materials to make your business funding-ready.',
        'what': 'Funding support and investor readiness services help businesses prepare for and secure funding, whether through loans, grants, or investment. We help create professional financial models, investor presentations, and due diligence materials that demonstrate your business\'s potential and financial health.',
        'who': [
            ('Seeking Funding', 'Businesses looking to secure loans or investment'),
            ('Startup Funding', 'Early-stage businesses seeking seed or growth funding'),
            ('Expansion Funding', 'Businesses needing capital for growth'),
            ('Investor Presentations', 'Businesses preparing for investor meetings'),
            ('Due Diligence', 'Businesses going through funding due diligence'),
            ('Grant Applications', 'Businesses applying for grants or funding')
        ],
        'what_we_do': [
            'Create professional financial models and forecasts',
            'Prepare investor-ready financial presentations',
            'Develop business plans and funding proposals',
            'Support due diligence processes',
            'Advise on funding structure and terms',
            'Prepare financial documentation for lenders and investors',
            'Ongoing support through funding process'
        ],
        'benefits': [
            ('Funding Ready', 'Professional materials that impress lenders and investors'),
            ('Better Terms', 'Strong financial presentation can improve funding terms'),
            ('Time Saving', 'Handle all financial preparation for funding'),
            ('Expert Guidance', 'Navigate the funding process with confidence'),
            ('Due Diligence', 'Smooth due diligence with well-prepared documentation'),
            ('Success Rate', 'Increase chances of securing funding')
        ]
    },
    {
        'filename': 'due-diligence-support.html',
        'title': 'Due Diligence Support',
        'intro': 'Expert support for business transactions, acquisitions, and investments. We help prepare financial documentation, respond to enquiries, and ensure smooth due diligence processes.',
        'what': 'Due diligence support services provide expert assistance during business transactions, acquisitions, and investments. We help prepare financial documentation, respond to buyer or investor enquiries, and ensure smooth due diligence processes that protect your interests while facilitating successful transactions.',
        'who': [
            ('Selling Businesses', 'Business owners selling their business'),
            ('Acquisitions', 'Businesses acquiring other companies'),
            ('Investment Rounds', 'Businesses raising investment'),
            ('Mergers', 'Businesses involved in merger transactions'),
            ('Partnership Deals', 'Businesses entering partnership agreements'),
            ('Transaction Support', 'Any business involved in significant transactions')
        ],
        'what_we_do': [
            'Prepare financial documentation for due diligence',
            'Respond to financial enquiries and requests',
            'Financial analysis and review of business performance',
            'Identify and address potential issues early',
            'Support negotiations with financial insights',
            'Coordinate with legal and other advisors',
            'Ensure smooth transaction completion'
        ],
        'benefits': [
            ('Smooth Process', 'Well-prepared documentation speeds up due diligence'),
            ('Protect Interests', 'Expert support protects your position in transactions'),
            ('Identify Issues', 'Find and address potential problems early'),
            ('Better Outcomes', 'Professional preparation improves transaction outcomes'),
            ('Time Saving', 'Handle all financial aspects of due diligence'),
            ('Peace of Mind', 'Expert guidance through complex transactions')
        ]
    },
    {
        'filename': 'business-valuation.html',
        'title': 'Business Valuation',
        'intro': 'Professional business valuations for sales, acquisitions, investment, or strategic planning. We use multiple valuation methods to provide accurate and defensible business valuations.',
        'what': 'Business valuation services provide professional assessments of your business\'s worth using multiple valuation methods. We create accurate and defensible valuations for sales, acquisitions, investment rounds, strategic planning, or dispute resolution. Our valuations consider financial performance, market conditions, and business-specific factors.',
        'who': [
            ('Selling Businesses', 'Business owners planning to sell'),
            ('Acquisitions', 'Buyers needing target company valuations'),
            ('Investment Rounds', 'Businesses raising investment'),
            ('Shareholder Disputes', 'Resolving ownership or exit disputes'),
            ('Strategic Planning', 'Businesses planning for future transactions'),
            ('Estate Planning', 'Business owners planning succession')
        ],
        'what_we_do': [
            'Comprehensive business valuations using multiple methods',
            'Financial analysis and performance review',
            'Market analysis and comparable company research',
            'Valuation reports suitable for legal and commercial purposes',
            'Support for negotiations and transactions',
            'Regular valuation updates as business grows',
            'Expert witness support for disputes'
        ],
        'benefits': [
            ('Accurate Valuations', 'Professional valuations using proven methods'),
            ('Defensible Results', 'Valuations that stand up to scrutiny'),
            ('Better Negotiations', 'Strong valuation supports better deal terms'),
            ('Legal Compliance', 'Valuations suitable for legal and regulatory purposes'),
            ('Strategic Planning', 'Understand business value for planning purposes'),
            ('Expert Support', 'Professional valuation expertise')
        ]
    },
    {
        'filename': 'exit-succession-planning.html',
        'title': 'Exit & Succession Planning',
        'intro': 'Strategic planning for business exit or succession. We help you plan for retirement, family succession, or business sale, ensuring smooth transitions and maximising value.',
        'what': 'Exit and succession planning services help business owners plan for retirement, family succession, or business sale. We develop comprehensive strategies that ensure smooth transitions, maximise value, and protect your interests. Our planning considers tax efficiency, timing, and the best exit route for your circumstances.',
        'who': [
            ('Retiring Owners', 'Business owners planning for retirement'),
            ('Family Succession', 'Businesses passing to next generation'),
            ('Exit Planning', 'Business owners planning to sell'),
            ('Succession Preparation', 'Businesses preparing for ownership changes'),
            ('Estate Planning', 'Business owners planning for estate and inheritance'),
            ('Strategic Exits', 'Businesses planning strategic exits or sales')
        ],
        'what_we_do': [
            'Develop comprehensive exit and succession strategies',
            'Tax-efficient exit planning',
            'Business valuation for exit planning',
            'Succession structure planning',
            'Timing and route analysis for exits',
            'Support for exit negotiations and transactions',
            'Ongoing planning and strategy refinement'
        ],
        'benefits': [
            ('Smooth Transitions', 'Plan for seamless ownership changes'),
            ('Maximise Value', 'Strategic planning maximises exit value'),
            ('Tax Efficiency', 'Optimise tax outcomes for exits and succession'),
            ('Family Harmony', 'Structured succession planning reduces family conflicts'),
            ('Peace of Mind', 'Clear plan for business future'),
            ('Expert Guidance', 'Professional support for complex transitions')
        ]
    },
    {
        'filename': 'company-secretarial.html',
        'title': 'Company Secretarial',
        'intro': 'Company secretarial services to ensure compliance with Companies House requirements. We handle filings, maintain statutory records, and ensure your company meets all legal obligations.',
        'what': 'Company secretarial services ensure your limited company meets all Companies House requirements and maintains proper statutory records. We handle annual returns, confirmation statements, director appointments, share allotments, and other company secretarial tasks to keep your company compliant and properly administered.',
        'who': [
            ('Limited Companies', 'All UK limited companies'),
            ('Directors', 'Company directors needing secretarial support'),
            ('Growing Companies', 'Companies with changing structures or ownership'),
            ('Compliance Focus', 'Companies wanting to ensure full compliance'),
            ('Time-Pressed Directors', 'Directors wanting to outsource secretarial tasks'),
            ('Complex Structures', 'Companies with complex share structures or ownership')
        ],
        'what_we_do': [
            'File annual confirmation statements with Companies House',
            'Maintain statutory registers (directors, shareholders, etc.)',
            'Handle director appointments and resignations',
            'Process share allotments and transfers',
            'File changes to company details',
            'Provide company secretarial advice',
            'Ensure ongoing compliance with Companies House requirements'
        ],
        'benefits': [
            ('Compliance', 'Ensure full compliance with Companies House requirements'),
            ('Time Saving', 'Outsource all company secretarial administration'),
            ('Accuracy', 'Professional handling ensures accuracy and timeliness'),
            ('Avoid Penalties', 'Meet all filing deadlines and avoid penalties'),
            ('Proper Records', 'Maintain accurate statutory records'),
            ('Peace of Mind', 'Know your company is properly administered')
        ]
    },
    {
        'filename': 'software-systems-advisory.html',
        'title': 'Software & Systems Advisory',
        'intro': 'Advice on accounting software, systems, and technology to improve efficiency and streamline your business operations. We help you choose and implement the right systems for your business.',
        'what': 'Software and systems advisory services help businesses choose, implement, and optimise accounting software and business systems. We provide expert advice on technology solutions that improve efficiency, streamline operations, and integrate with your accounting processes. From cloud accounting to ERP systems, we help you find the right technology for your business.',
        'who': [
            ('Software Selection', 'Businesses choosing accounting or business software'),
            ('System Implementation', 'Businesses implementing new systems'),
            ('Efficiency Improvement', 'Businesses seeking to improve operational efficiency'),
            ('Integration Needs', 'Businesses needing system integration'),
            ('Cloud Migration', 'Businesses moving to cloud-based systems'),
            ('Technology Advice', 'Businesses needing technology guidance')
        ],
        'what_we_do': [
            'Software selection and recommendation',
            'System implementation support',
            'Cloud accounting setup and migration',
            'System integration and automation',
            'Training and support for new systems',
            'Ongoing system optimisation and advice',
            'Integration with accounting and advisory services'
        ],
        'benefits': [
            ('Right Systems', 'Choose technology that fits your business needs'),
            ('Efficiency Gains', 'Streamline operations with better systems'),
            ('Time Saving', 'Automate processes and reduce manual work'),
            ('Better Insights', 'Improved reporting and business intelligence'),
            ('Scalability', 'Systems that grow with your business'),
            ('Expert Guidance', 'Technology advice from accounting professionals')
        ]
    }
]

def generate_advisory_page(service):
    """Generate an advisory service page"""
    page = template
    
    # Replace title
    page = re.sub(
        r'<title>.*?</title>',
        f'<title>{service["title"]} Services - Black and White Accounting</title>',
        page
    )
    
    # Replace breadcrumb
    page = re.sub(
        r'<a href="/services-accounts".*?>Accounts Services</a>',
        '<a href="/services-advisory" style="color: var(--text-secondary); text-decoration: none;">Advisory Services</a>',
        page
    )
    page = re.sub(
        r'<span style="color: var\(--text-primary\);">Management Accounts</span>',
        f'<span style="color: var(--text-primary);">{service["title"]}</span>',
        page
    )
    
    # Replace page header
    page = re.sub(
        r'<h1>Management Accounts</h1>',
        f'<h1>{service["title"]}</h1>',
        page
    )
    page = re.sub(
        r'<p class="service-page-intro">.*?</p>',
        f'<p class="service-page-intro">{service["intro"]}</p>',
        page
    )
    
    # Replace What section
    what_section = f'''<h2 style="margin-bottom: var(--spacing-md);">What is {service["title"]}?</h2>
                    <p style="font-size: var(--font-size-lg); line-height: 1.7; color: var(--text-secondary); margin-bottom: var(--spacing-lg);">{service["what"]}</p>'''
    
    page = re.sub(
        r'<h2 style="margin-bottom: var\(--spacing-md\);">What are Management Accounts\?</h2>.*?<p style="font-size: var\(--font-size-lg\); line-height: 1\.7; color: var\(--text-secondary\); margin-bottom: var\(--spacing-lg\);">.*?</p>',
        what_section,
        page,
        flags=re.DOTALL
    )
    
    # Replace Who section
    who_title = 'Who Needs This Service?'
    who_desc = 'This service is ideal for:'
    
    page = re.sub(
        r'<h2 style="margin-bottom: var\(--spacing-lg\); text-align: center;">Who Needs Management Accounts\?</h2>',
        f'<h2 style="margin-bottom: var(--spacing-lg); text-align: center;">{who_title}</h2>',
        page
    )
    page = re.sub(
        r'<p style="text-align: center; color: var\(--text-secondary\); margin-bottom: var\(--spacing-xl\); max-width: 600px; margin-left: auto; margin-right: auto;">.*?</p>',
        f'<p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--spacing-xl); max-width: 600px; margin-left: auto; margin-right: auto;">{who_desc}</p>',
        page
    )
    
    # Replace Who items
    who_grid_start = page.find('<div class="grid grid-2"', page.find('Who Needs'))
    if who_grid_start != -1:
        who_grid_end = page.find('</div>', page.find('</div>', page.find('</div>', who_grid_start + 1) + 1) + 1) + 1
        who_items_html = '<div class="grid grid-2" style="gap: var(--spacing-lg); max-width: 1000px; margin: 0 auto;">'
        for title, desc in service['who']:
            who_items_html += f'''
                    <div style="background: var(--bg-white); padding: var(--spacing-xl); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
                        <h3 style="font-size: var(--font-size-lg); margin-bottom: var(--spacing-sm); color: var(--text-primary);">{title}</h3>
                        <p style="color: var(--text-secondary); line-height: 1.6; margin: 0;">{desc}</p>
                    </div>'''
        who_items_html += '\n                </div>'
        page = page[:who_grid_start] + who_items_html + page[who_grid_end:]
    
    # Replace What We Do section
    page = re.sub(
        r'Our Management Accounts service includes:',
        'Our service includes:',
        page
    )
    
    # Find and replace What We Do items
    what_we_do_start = page.find('What We Do')
    if what_we_do_start != -1:
        list_start = page.find('<ul style="list-style: none', what_we_do_start)
        if list_start != -1:
            list_end = page.find('</ul>', list_start) + 5
            what_we_do_html = '<ul style="list-style: none; padding: 0; margin: 0;">'
            for i, item in enumerate(service['what_we_do']):
                border = 'border-bottom: 1px solid rgba(0, 0, 0, 0.06);' if i < len(service['what_we_do']) - 1 else ''
                what_we_do_html += f'''
                            <li style="padding: var(--spacing-md) 0; {border}">
                                <span style="color: var(--text-secondary);">{item}</span>
                            </li>'''
            what_we_do_html += '\n                        </ul>'
            page = page[:list_start] + what_we_do_html + page[list_end:]
    
    # Replace Benefits
    page = re.sub(
        r'Professional Management Accounts services provide essential benefits\.',
        'Professional advisory services provide essential benefits.',
        page
    )
    
    # Find and replace Benefits items
    benefits_start = page.find('Benefits')
    if benefits_start != -1:
        benefits_grid_start = page.find('<div style="display: grid; grid-template-columns: repeat(3, 1fr)', benefits_start)
        if benefits_grid_start != -1:
            benefits_grid_end = page.find('</div>', page.find('</div>', benefits_grid_start) + 1) + 1
            benefits_html = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-md);">'
            for title, desc in service['benefits']:
                benefits_html += f'''
                        <div style="background: var(--bg-white); padding: var(--spacing-lg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); text-align: center;">
                            <h3 style="font-size: var(--font-size-base); margin-bottom: var(--spacing-xs); color: var(--text-primary);">{title}</h3>
                            <p style="color: var(--text-secondary); line-height: 1.5; margin: 0; font-size: var(--font-size-sm);">{desc}</p>
                        </div>'''
            benefits_html += '\n                    </div>'
            page = page[:benefits_grid_start] + benefits_html + page[benefits_grid_end:]
    
    # Replace CTA
    page = re.sub(
        r'Ready to get started with Management Accounts\?',
        f'Ready to get started with {service["title"]}?',
        page
    )
    page = re.sub(
        r'We\'ll help you make informed decisions with regular management accounts\.',
        f'We\'ll help you with professional {service["title"].lower()} services.',
        page
    )
    
    # Replace back link
    page = re.sub(
        r'<a href="/services-accounts"',
        '<a href="/services-advisory"',
        page
    )
    page = re.sub(
        r'← Back to Accounts Services',
        '← Back to Advisory Services',
        page
    )
    
    return page

# Generate all pages
for service in advisory_services:
    page_content = generate_advisory_page(service)
    filepath = f'services-advisory/{service["filename"]}'
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(page_content)
    print(f'Created {filepath}')

print('\nAll advisory pages generated!')
