#!/usr/bin/env python3
"""
Script to update remaining tax pages with proper content
"""
import re
import os

# Content for each remaining tax page
pages_content = {
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
            ('Furnished Holiday Lettings', 'Special tax treatment available'
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
    html = re.sub(
        r'<h2 style="margin-bottom: var\(--spacing-md\);">What is [^<]+?</h2>',
        f'<h2 style="margin-bottom: var(--spacing-md);">What is {filename.replace(".html", "").replace("-", " ").title()}?</h2>',
        html
    )
    
    what_pattern = r'(<p style="font-size: var\(--font-size-lg\); line-height: 1\.7; color: var\(--text-secondary\); margin-bottom: var\(--spacing-lg\);">)(.*?)(</p>)'
    html = re.sub(what_pattern, f'\\1{content["what"]}\\3', html, flags=re.DOTALL)
    
    # Update Who section
    html = html.replace('Who Needs to Complete Self-Assessment?', content['who_title'])
    html = html.replace('You may need to complete a Self Assessment tax return if:', content['who_desc'])
    
    # Update Who items - find the grid and replace items
    who_grid_start = html.find('<div class="grid grid-2"')
    if who_grid_start != -1:
        who_grid_end = html.find('</div>', html.find('</div>', html.find('</div>', who_grid_start + 1) + 1) + 1) + 1
        who_items_html = '<div class="grid grid-2" style="gap: var(--spacing-lg); max-width: 1000px; margin: 0 auto;">'
        for title, desc in content['who_items']:
            who_items_html += f'''
                    <div style="background: var(--bg-white); padding: var(--spacing-xl); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
                        <h3 style="font-size: var(--font-size-lg); margin-bottom: var(--spacing-sm); color: var(--text-primary);">{title}</h3>
                        <p style="color: var(--text-secondary); line-height: 1.6; margin: 0;">{desc}</p>
                    </div>'''
        who_items_html += '\n                </div>'
        html = html[:who_grid_start] + who_items_html + html[who_grid_end:]
    
    # Update Rates section
    html = html.replace('Key Deadlines (2026)', content['rates_title'])
    html = html.replace('Important deadlines for Self Assessment:', content['rates_desc'])
    
    # Update rates items
    rates_box_start = html.find('<div style="background: var(--bg-white); padding: var(--spacing-xl);', html.find('rates_title') if 'rates_title' in html else html.find('Key Deadlines'))
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
        # Find the rates box more precisely
        rates_section = html[html.find('<!-- Key Deadlines'):html.find('</section>', html.find('<!-- Key Deadlines')) + 9]
        new_rates_section = rates_section.replace(rates_section[rates_section.find('<div style="background'):rates_section.rfind('</div>') + 6], rates_items_html)
        html = html.replace(rates_section, new_rates_section)
    
    # Update What We Do
    html = html.replace('Our Self Assessment service includes:', 'Our service includes:')
    
    # Update Benefits
    html = html.replace('Professional Self Assessment services provide essential benefits.', 'Professional services provide essential benefits.')
    
    # Update CTA
    html = html.replace('Ready to get your Self Assessment sorted?', content['cta_title'])
    html = html.replace("We'll prepare your return accurately and help minimise your tax liability.", content['cta_text'])
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f'✓ Updated {filename}')
    return True

# Update all pages
for filename, content in pages_content.items():
    update_page(filename, content)

print('\nAll remaining tax pages updated!')
