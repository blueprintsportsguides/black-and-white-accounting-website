#!/usr/bin/env python3
"""
Fix all advisory pages to replace template content with proper advisory content
"""
import os
import re

advisory_services = [
    {
        'filename': 'business-planning-startups.html',
        'title': 'Business Planning & Start-Ups',
    },
    {
        'filename': 'cashflow-forecasting-budgeting.html',
        'title': 'Cashflow Forecasting & Budgeting',
    },
    {
        'filename': 'growth-advisory.html',
        'title': 'Growth Advisory',
    },
    {
        'filename': 'profit-improvement-cost-optimisation.html',
        'title': 'Profit Improvement & Cost Optimisation',
    },
    {
        'filename': 'funding-support-investor-readiness.html',
        'title': 'Funding Support & Investor Readiness',
    },
    {
        'filename': 'due-diligence-support.html',
        'title': 'Due Diligence Support',
    },
    {
        'filename': 'business-valuation.html',
        'title': 'Business Valuation',
    },
    {
        'filename': 'exit-succession-planning.html',
        'title': 'Exit & Succession Planning',
    },
    {
        'filename': 'company-secretarial.html',
        'title': 'Company Secretarial',
    },
    {
        'filename': 'software-systems-advisory.html',
        'title': 'Software & Systems Advisory',
    }
]

# Read the original data from the generation script
service_data = {
    'business-planning-startups.html': {
        'what_we_do': [
            'Advise on business structure (sole trader, partnership, limited company)',
            'Create comprehensive business plans and financial forecasts',
            'Register for tax (Self Assessment, Corporation Tax, VAT)',
            'Set up accounting systems and bookkeeping',
            'Initial tax planning and strategy',
            'Help with business bank accounts and financial planning',
            'Ongoing support as business grows'
        ]
    },
    'cashflow-forecasting-budgeting.html': {
        'what_we_do': [
            'Create detailed cashflow forecasts (monthly, quarterly, annual)',
            'Develop budgets and financial plans',
            'Identify potential cashflow shortfalls in advance',
            'Scenario planning for different business outcomes',
            'Working capital management advice',
            'Regular review and update of forecasts',
            'Integration with your accounting systems'
        ]
    },
    'growth-advisory.html': {
        'what_we_do': [
            'Strategic growth planning and roadmaps',
            'Financial analysis to support growth decisions',
            'Market expansion feasibility analysis',
            'Growth scenario modelling and forecasting',
            'Identify growth opportunities and risks',
            'Support for expansion funding applications',
            'Regular strategic reviews and planning sessions'
        ]
    },
    'profit-improvement-cost-optimisation.html': {
        'what_we_do': [
            'Cost analysis and identification of inefficiencies',
            'Margin analysis by product, service, or department',
            'Pricing strategy review and recommendations',
            'Operational efficiency analysis',
            'Cost reduction strategies and implementation support',
            'Profitability improvement plans',
            'Regular monitoring and review of improvements'
        ]
    },
    'funding-support-investor-readiness.html': {
        'what_we_do': [
            'Create professional financial models and forecasts',
            'Prepare investor-ready financial presentations',
            'Develop business plans and funding proposals',
            'Support due diligence processes',
            'Advise on funding structure and terms',
            'Prepare financial documentation for lenders and investors',
            'Ongoing support through funding process'
        ]
    },
    'due-diligence-support.html': {
        'what_we_do': [
            'Prepare financial documentation for due diligence',
            'Respond to financial enquiries and requests',
            'Financial analysis and review of business performance',
            'Identify and address potential issues early',
            'Support negotiations with financial insights',
            'Coordinate with legal and other advisors',
            'Ensure smooth transaction completion'
        ]
    },
    'business-valuation.html': {
        'what_we_do': [
            'Comprehensive business valuations using multiple methods',
            'Financial analysis and performance review',
            'Market analysis and comparable company research',
            'Valuation reports suitable for legal and commercial purposes',
            'Support for negotiations and transactions',
            'Regular valuation updates as business grows',
            'Expert witness support for disputes'
        ]
    },
    'exit-succession-planning.html': {
        'what_we_do': [
            'Develop comprehensive exit and succession strategies',
            'Tax-efficient exit planning',
            'Business valuation for exit planning',
            'Succession structure planning',
            'Timing and route analysis for exits',
            'Support for exit negotiations and transactions',
            'Ongoing planning and strategy refinement'
        ]
    },
    'company-secretarial.html': {
        'what_we_do': [
            'File annual confirmation statements with Companies House',
            'Maintain statutory registers (directors, shareholders, etc.)',
            'Handle director appointments and resignations',
            'Process share allotments and transfers',
            'File changes to company details',
            'Provide company secretarial advice',
            'Ensure ongoing compliance with Companies House requirements'
        ]
    },
    'software-systems-advisory.html': {
        'what_we_do': [
            'Software selection and recommendation',
            'System implementation support',
            'Cloud accounting setup and migration',
            'System integration and automation',
            'Training and support for new systems',
            'Ongoing system optimisation and advice',
            'Integration with accounting and advisory services'
        ]
    }
}

for service in advisory_services:
    filepath = f'services-advisory/{service["filename"]}'
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace "What We Provide" section
    what_we_do_items = service_data.get(service['filename'], {}).get('what_we_do', [])
    if what_we_do_items:
        what_we_do_html = '<ul style="list-style: none; padding: 0; margin: 0;">'
        for i, item in enumerate(what_we_do_items):
            border = 'border-bottom: 1px solid rgba(0, 0, 0, 0.06);' if i < len(what_we_do_items) - 1 else ''
            what_we_do_html += f'''
                            <li style="padding: var(--spacing-md) 0; {border}">
                                <span style="color: var(--text-secondary);">{item}</span>
                            </li>'''
        what_we_do_html += '\n                        </ul>'
        
        # Find and replace the What We Provide list
        pattern = r'(<ul style="list-style: none; padding: 0; margin: 0;">.*?</ul>)'
        content = re.sub(pattern, what_we_do_html, content, flags=re.DOTALL)
        
        # Update the description text
        content = re.sub(
            r'Our management accounts package includes everything you need to understand your business performance:',
            'Our service includes:',
            content
        )
    
    # Remove the "Frequency" section (doesn't apply to advisory services)
    frequency_pattern = r'<!-- Frequency -->.*?</section>'
    content = re.sub(frequency_pattern, '', content, flags=re.DOTALL)
    
    # Update CTA text
    content = re.sub(
        r'Ready to get management accounts\?',
        f'Ready to get started with {service["title"]}?',
        content
    )
    content = re.sub(
        r'We\'ll provide clear, timely financial information to help you steer your business\.',
        f'We\'ll help you with professional {service["title"].lower()} services.',
        content
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'Fixed {filepath}')

print('\nAll advisory pages fixed!')
