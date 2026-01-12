#!/usr/bin/env python3
"""
Complete the remaining 6 tax pages with proper content
"""
import re
import os

# Template for reading a complete page structure
template_file = 'services-tax/rd-tax.html'
with open(template_file, 'r', encoding='utf-8') as f:
    template = f.read()

# Content for each remaining page
pages = {
    'capital-gains-tax.html': {
        'what': 'Capital Gains Tax (CGT) is a tax on the profit made when you sell or dispose of an asset that has increased in value. It applies to assets like property (not your main home), shares, business assets, and other investments. CGT is calculated on the gain (profit) made when you sell an asset, after deducting costs and any available reliefs.',
        'who_title': 'Who Needs to Consider Capital Gains Tax?',
        'who_desc': 'CGT may apply when you sell or dispose of assets:',
        'who_items': [
            ('Property Investors', 'Selling buy-to-let properties or second homes'),
            ('Shareholders', 'Selling shares or investments'),
            ('Business Owners', 'Selling business assets or shares in a company'),
            ('Individuals', 'Selling valuable personal assets above the annual exemption')
        ],
        'rates_title': 'CGT Rates & Annual Exemption (2026)',
        'rates_desc': 'Understanding CGT rates and reliefs:',
        'rates_items': [
            ('Basic Rate (Assets)', '10% for basic rate taxpayers'),
            ('Basic Rate (Property)', '18% for residential property'),
            ('Higher Rate (Assets)', '20% for higher/additional rate taxpayers'),
            ('Higher Rate (Property)', '28% for residential property'),
            ('Annual Exemption', '£6,000 per person per tax year')
        ],
        'what_we_do': [
            'Calculate capital gains and tax liability',
            'Identify available reliefs (Entrepreneurs\' Relief, Private Residence Relief)',
            'Plan disposals to minimise CGT',
            'Prepare CGT returns and declarations',
            'Handle property CGT on buy-to-let sales',
            'Advise on timing and structuring of disposals'
        ],
        'benefits': [
            ('Minimise Tax', 'Maximise use of reliefs and annual exemption'),
            ('Planning', 'Strategic timing of disposals'),
            ('Compliance', 'Ensure all gains are properly declared'),
            ('Expertise', 'Navigate complex CGT rules and reliefs')
        ],
        'cta_title': 'Ready to manage your Capital Gains Tax?',
        'cta_text': 'We\'ll help minimise your CGT liability and ensure compliance.'
    },
    'inheritance-tax.html': {
        'what': 'Inheritance Tax (IHT) is a tax on the estate (property, money, and possessions) of someone who has died, and on certain lifetime gifts. The standard IHT rate is 40% on estates above the nil-rate band threshold. IHT planning can help reduce the tax burden on your estate and ensure your assets pass to your chosen beneficiaries efficiently.',
        'who_title': 'Who Needs Inheritance Tax Planning?',
        'who_desc': 'IHT may affect:',
        'who_items': [
            ('Estate Executors', 'Those responsible for administering an estate'),
            ('Estate Beneficiaries', 'Those inheriting assets from an estate'),
            ('High Net Worth Individuals', 'Those with estates above the nil-rate band'),
            ('Property Owners', 'Those with significant property assets'),
            ('Business Owners', 'Those with business assets to pass on'),
            ('Lifetime Gift Givers', 'Those making substantial lifetime gifts')
        ],
        'rates_title': 'IHT Rates & Nil-Rate Bands (2026)',
        'rates_desc': 'Understanding IHT rates and thresholds:',
        'rates_items': [
            ('Standard Rate', '40% on estates above nil-rate band'),
            ('Nil-Rate Band', '£325,000 per person'),
            ('Residence Nil-Rate Band', '£175,000 (for main residence left to direct descendants)'),
            ('Married Couples', 'Can transfer unused nil-rate bands'),
            ('Reduced Rate', '36% if 10% of estate left to charity')
        ],
        'what_we_do': [
            'Calculate IHT liability on estates',
            'Prepare IHT returns (IHT400)',
            'IHT planning and estate planning advice',
            'Maximise use of exemptions and reliefs',
            'Handle lifetime gift planning',
            'Liaise with HMRC on IHT matters'
        ],
        'benefits': [
            ('Minimise Tax', 'Maximise use of nil-rate bands and reliefs'),
            ('Planning', 'Estate planning to reduce IHT liability'),
            ('Compliance', 'Ensure accurate IHT returns and payments'),
            ('Peace of Mind', 'Professional handling of complex IHT matters')
        ],
        'cta_title': 'Ready to plan your estate tax efficiently?',
        'cta_text': 'We\'ll help minimise IHT and ensure your estate passes efficiently to your beneficiaries.'
    },
    'landlord-tax.html': {
        'what': 'Property tax services cover all tax aspects of being a landlord or property investor, including rental income tax, Capital Gains Tax on property sales, Stamp Duty Land Tax (SDLT) planning, and structuring property ownership for tax efficiency. We help landlords navigate the complex tax rules and maximise tax efficiency.',
        'who_title': 'Who Needs Property Tax Services?',
        'who_desc': 'Property tax services are essential for:',
        'who_items': [
            ('Landlords', 'Those with rental properties generating income'),
            ('Property Investors', 'Those buying and selling investment properties'),
            ('Buy-to-Let Investors', 'Those with buy-to-let property portfolios'),
            ('Property Developers', 'Those developing and selling properties'),
            ('Holiday Let Owners', 'Those with furnished holiday lettings'),
            ('Property Companies', 'Companies holding property investments')
        ],
        'rates_title': 'Property Tax Rates (2026)',
        'rates_desc': 'Understanding property tax rates:',
        'rates_items': [
            ('Rental Income Tax', 'Taxed at Income Tax rates (20%, 40%, 45%)'),
            ('Property CGT', '18% (basic rate) or 28% (higher rate) on property sales'),
            ('SDLT', 'Varies by property value and buyer status'),
            ('Annual Tax on Enveloped Dwellings', 'For companies owning high-value residential property'),
            ('Furnished Holiday Lettings', 'Special tax treatment available')
        ],
        'what_we_do': [
            'Calculate and declare rental income tax',
            'Maximise property expense claims',
            'Handle property Capital Gains Tax',
            'SDLT planning and advice',
            'Property ownership structure advice',
            'Furnished holiday lettings tax planning'
        ],
        'benefits': [
            ('Maximise Deductions', 'Claim all allowable property expenses'),
            ('Tax Efficiency', 'Optimise property ownership structures'),
            ('Compliance', 'Meet all property tax obligations'),
            ('Planning', 'Strategic property tax planning')
        ],
        'cta_title': 'Ready to optimise your property tax?',
        'cta_text': 'We\'ll help maximise your property tax efficiency and ensure compliance.'
    },
    'tax-planning.html': {
        'what': 'Tax planning involves structuring your financial affairs legally and efficiently to minimise tax liability while remaining fully compliant. It includes maximising use of allowances, reliefs, and tax-efficient investment and business structures. Effective tax planning can significantly reduce your tax burden while ensuring full compliance with HMRC requirements.',
        'who_title': 'Who Needs Tax Planning?',
        'who_desc': 'Tax planning is beneficial for:',
        'who_items': [
            ('High Earners', 'Those with income above higher rate thresholds'),
            ('Business Owners', 'Directors and business owners seeking tax efficiency'),
            ('Investors', 'Those with investment income and capital gains'),
            ('Property Owners', 'Landlords and property investors'),
            ('Retirees', 'Those planning for retirement and estate planning'),
            ('Entrepreneurs', 'Business founders and shareholders')
        ],
        'rates_title': 'Tax Planning Strategies (2026)',
        'rates_desc': 'Common tax planning approaches:',
        'rates_items': [
            ('Pension Contributions', 'Reduce taxable income through pension contributions'),
            ('ISAs', 'Tax-free savings and investment accounts'),
            ('EIS/SEIS Investments', 'Tax relief on Enterprise Investment Scheme investments'),
            ('Salary vs Dividends', 'Optimise director remuneration structure'),
            ('Timing Strategies', 'Plan timing of income and expenses'),
            ('Allowance Maximisation', 'Use all available personal allowances and reliefs')
        ],
        'what_we_do': [
            'Review current tax position and identify opportunities',
            'Develop personalised tax planning strategies',
            'Advise on tax-efficient investment structures',
            'Salary vs dividend planning for directors',
            'Pension and retirement planning',
            'Annual tax planning reviews'
        ],
        'benefits': [
            ('Minimise Tax', 'Legally reduce tax liability'),
            ('Maximise Allowances', 'Use all available allowances and reliefs'),
            ('Strategic Planning', 'Long-term tax-efficient strategies'),
            ('Compliance', 'Ensure all planning remains compliant')
        ],
        'cta_title': 'Ready to optimise your tax position?',
        'cta_text': 'We\'ll develop a personalised tax planning strategy to minimise your tax liability.'
    },
    'hmrc-compliance.html': {
        'what': 'HMRC compliance checks are investigations into your tax affairs to ensure you have paid the correct amount of tax. We provide expert support to help you prepare, respond, and resolve HMRC enquiries while minimising penalties and protecting your interests. Our experience helps navigate complex compliance issues effectively.',
        'who_title': 'Who Needs HMRC Compliance Support?',
        'who_desc': 'HMRC compliance support is essential for:',
        'who_items': [
            ('Individuals Under Investigation', 'Those facing HMRC enquiries or investigations'),
            ('Businesses', 'Companies receiving compliance checks or enquiries'),
            ('Complex Tax Affairs', 'Those with complicated tax situations'),
            ('Previous Errors', 'Those who have made tax errors or omissions'),
            ('Random Checks', 'Those selected for random HMRC compliance checks'),
            ('Dispute Resolution', 'Those in dispute with HMRC')
        ],
        'rates_title': 'HMRC Penalties & Interest (2026)',
        'rates_desc': 'Understanding potential penalties:',
        'rates_items': [
            ('Careless Errors', 'Up to 30% of tax due'),
            ('Deliberate Errors', 'Up to 70% of tax due'),
            ('Deliberate & Concealed', 'Up to 100% of tax due'),
            ('Late Payment Interest', 'Charged on late tax payments'),
            ('Disclosure Reductions', 'Reduced penalties for voluntary disclosure'),
            ('Reasonable Care', 'No penalty if reasonable care taken')
        ],
        'what_we_do': [
            'Review and prepare responses to HMRC enquiries',
            'Gather and organise supporting documentation',
            'Negotiate with HMRC on your behalf',
            'Minimise penalties and interest charges',
            'Represent you in HMRC meetings',
            'Resolve disputes and agree settlements'
        ],
        'benefits': [
            ('Expert Representation', 'Professional handling of HMRC enquiries'),
            ('Minimise Penalties', 'Negotiate best possible outcomes'),
            ('Peace of Mind', 'Expert support during stressful times'),
            ('Time Saving', 'Handle all correspondence and negotiations')
        ],
        'cta_title': 'Facing an HMRC compliance check?',
        'cta_text': 'We\'ll help you navigate the process and minimise any penalties or interest charges.'
    },
    'business-planning-startups.html': {
        'what': 'Business planning and startup services provide comprehensive tax and accounting support for new businesses, helping with business structure selection, tax registration, initial compliance, and strategic planning for growth. We help startups establish proper accounting foundations and plan for tax-efficient growth from day one.',
        'who_title': 'Who Needs Business Planning & Startup Services?',
        'who_desc': 'Startup services are essential for:',
        'who_items': [
            ('New Business Startups', 'Entrepreneurs launching new businesses'),
            ('Early Stage Companies', 'Companies in their first few years'),
            ('Business Restructures', 'Businesses changing structure or ownership'),
            ('Sole Traders Going Limited', 'Sole traders incorporating'),
            ('Partnership Formations', 'New partnerships being established'),
            ('Franchise Startups', 'New franchise operations')
        ],
        'rates_title': 'Startup Tax Considerations (2026)',
        'rates_desc': 'Key tax considerations for new businesses:',
        'rates_items': [
            ('Business Structure', 'Sole trader, partnership, or limited company'),
            ('Tax Registration', 'Self Assessment, Corporation Tax, VAT if applicable'),
            ('VAT Threshold', 'Register if turnover exceeds £90,000'),
            ('Startup Costs', 'Claim allowable startup expenses'),
            ('Tax Year Planning', 'Plan for first tax year end'),
            ('Record Keeping', 'Establish proper accounting systems')
        ],
        'what_we_do': [
            'Advise on business structure (sole trader, partnership, limited company)',
            'Register for tax (Self Assessment, Corporation Tax, VAT)',
            'Set up accounting systems and bookkeeping',
            'Initial tax planning and strategy',
            'Help with business bank accounts and financial planning',
            'Ongoing support as business grows'
        ],
        'benefits': [
            ('Right Structure', 'Choose the most tax-efficient business structure'),
            ('Compliance', 'Ensure all registrations and initial compliance'),
            ('Foundation', 'Set up proper accounting from the start'),
            ('Growth Support', 'Plan for tax-efficient growth')
        ],
        'cta_title': 'Starting a new business?',
        'cta_text': 'We\'ll help you set up properly from day one and plan for tax-efficient growth.'
    }
}

def update_page(filename, content):
    """Update a tax page with new content"""
    filepath = f'services-tax/{filename}'
    if not os.path.exists(filepath):
        print(f'File not found: {filepath}')
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Update What section
    what_pattern = r'(<h2 style="margin-bottom: var\(--spacing-md\);">What is [^<]+?</h2>\s*<p style="font-size: var\(--font-size-lg\); line-height: 1\.7; color: var\(--text-secondary\); margin-bottom: var\(--spacing-lg\);">)(.*?)(</p>)'
    html = re.sub(what_pattern, f'\\1{content["what"]}\\3', html, flags=re.DOTALL)
    
    # Update Who section
    html = html.replace('Who Needs to Complete Self-Assessment?', content['who_title'])
    html = html.replace('You may need to complete a Self Assessment tax return if:', content['who_desc'])
    
    # Find and replace Who items - find the grid section
    who_start = html.find('<div class="grid grid-2"', html.find('who_desc') if 'who_desc' in html else html.find('Who Needs'))
    if who_start != -1:
        # Find the closing div for the grid
        who_end = html.find('</div>', html.find('</div>', html.find('</div>', who_start + 1) + 1) + 1) + 1
        who_items_html = '<div class="grid grid-2" style="gap: var(--spacing-lg); max-width: 1000px; margin: 0 auto;">'
        for title, desc in content['who_items']:
            who_items_html += f'''
                    <div style="background: var(--bg-white); padding: var(--spacing-xl); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
                        <h3 style="font-size: var(--font-size-lg); margin-bottom: var(--spacing-sm); color: var(--text-primary);">{title}</h3>
                        <p style="color: var(--text-secondary); line-height: 1.6; margin: 0;">{desc}</p>
                    </div>'''
        who_items_html += '\n                </div>'
        html = html[:who_start] + who_items_html + html[who_end:]
    
    # Update Rates section
    html = html.replace('Key Deadlines (2026)', content['rates_title'])
    html = html.replace('Important deadlines for Self Assessment:', content['rates_desc'])
    
    # Update rates items - find the rates box
    rates_section_start = html.find('<!-- Key Deadlines') if '<!-- Key Deadlines' in html else html.find('rates_title') if 'rates_title' in html else html.find('Key Deadlines')
    if rates_section_start != -1:
        # Find the rates box
        rates_box_start = html.find('<div style="background: var(--bg-white); padding: var(--spacing-xl);', rates_section_start)
        if rates_box_start != -1:
            rates_box_end = html.find('</div>', html.find('</div>', rates_box_start) + 1) + 1
            rates_items_html = '<div style="background: var(--bg-white); padding: var(--spacing-xl); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">'
            for i, (title, desc) in enumerate(content['rates_items']):
                border = 'border-bottom: 1px solid rgba(0, 0, 0, 0.06);' if i < len(content['rates_items']) - 1 else ''
                rates_items_html += f'''
                        <div style="padding: var(--spacing-lg) 0; {border}">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xs);">
                                <strong style="color: var(--text-primary);">{title}</strong>
                            </div>
                            <p style="color: var(--text-secondary); margin: 0;">{desc}</p>
                        </div>'''
            rates_items_html += '\n                    </div>'
            html = html[:rates_box_start] + rates_items_html + html[rates_box_end:]
    
    # Update What We Do
    html = html.replace('Our Self Assessment service includes:', 'Our service includes:')
    
    # Find and replace What We Do items
    what_we_do_start = html.find('What We Do')
    if what_we_do_start != -1:
        # Find the list items
        list_start = html.find('<ul style="list-style: none', what_we_do_start)
        if list_start != -1:
            list_end = html.find('</ul>', list_start) + 5
            what_we_do_html = '<ul style="list-style: none; padding: 0; margin: 0;">'
            for i, item in enumerate(content['what_we_do']):
                border = 'border-bottom: 1px solid rgba(0, 0, 0, 0.06);' if i < len(content['what_we_do']) - 1 else ''
                what_we_do_html += f'''
                            <li style="padding: var(--spacing-md) 0; {border}">
                                <span style="color: var(--text-secondary);">{item}</span>
                            </li>'''
            what_we_do_html += '\n                        </ul>'
            html = html[:list_start] + what_we_do_html + html[list_end:]
    
    # Update Benefits
    html = html.replace('Professional Self Assessment services provide essential benefits.', 'Professional services provide essential benefits.')
    
    # Find and replace Benefits items
    benefits_start = html.find('Benefits')
    if benefits_start != -1:
        # Find the grid
        benefits_grid_start = html.find('<div style="display: grid; grid-template-columns: repeat(3, 1fr)', benefits_start)
        if benefits_grid_start != -1:
            benefits_grid_end = html.find('</div>', html.find('</div>', benefits_grid_start) + 1) + 1
            benefits_html = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-md);">'
            for title, desc in content['benefits']:
                benefits_html += f'''
                        <div style="background: var(--bg-white); padding: var(--spacing-lg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); text-align: center;">
                            <h3 style="font-size: var(--font-size-base); margin-bottom: var(--spacing-xs); color: var(--text-primary);">{title}</h3>
                            <p style="color: var(--text-secondary); line-height: 1.5; margin: 0; font-size: var(--font-size-sm);">{desc}</p>
                        </div>'''
            benefits_html += '\n                    </div>'
            html = html[:benefits_grid_start] + benefits_html + html[benefits_grid_end:]
    
    # Update CTA
    html = html.replace('Ready to get your Self Assessment sorted?', content['cta_title'])
    html = html.replace("We'll prepare your return accurately and help minimise your tax liability.", content['cta_text'])
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f'✓ Updated {filename}')
    return True

# Update all pages
for filename, content in pages.items():
    update_page(filename, content)

print('\nAll remaining tax pages updated!')
