import { defineConfig } from 'vite';
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
      rollupOptions: {
      input: {
        main: './index.html',
        mtd: './mtd.html',
        about: './about.html',
        contact: './contact.html',
        services: './services.html',
        'services-tax': './services-tax.html',
        'services-accounts': './services-accounts.html',
        'services-advisory': './services-advisory.html',
        sectors: './sectors.html',
        structures: './structures.html',
        'structures-individuals': './structures-individuals.html',
        'structures-sole-traders': './structures-sole-traders.html',
        'structures-partnerships': './structures-partnerships.html',
        'structures-limited-companies': './structures-limited-companies.html',
        'structures-llp': './structures-llp.html',
        'structures-landlords': './structures-landlords.html',
        'structures-charities': './structures-charities.html',
        'structures-cic': './structures-cic.html',
        'structures-clubs-societies': './structures-clubs-societies.html',
        'sectors-construction': './sectors-construction.html',
        'sectors-ecommerce': './sectors-ecommerce.html',
        'sectors-healthcare': './sectors-healthcare.html',
        'sectors-hospitality': './sectors-hospitality.html',
        'sectors-professional-services': './sectors-professional-services.html',
        'sectors-property': './sectors-property.html',
        'sectors-retail': './sectors-retail.html',
        'sectors-startups': './sectors-startups.html',
        'sectors-trades': './sectors-trades.html',
        'sectors-contractors-consultants': './sectors-contractors-consultants.html',
        'sectors-freelancers-creatives': './sectors-freelancers-creatives.html',
        'sectors-farming-agriculture': './sectors-farming-agriculture.html',
        'sectors-it-tech': './sectors-it-tech.html',
        'sectors-automotive-engineering': './sectors-automotive-engineering.html',
        'sectors-education-training': './sectors-education-training.html',
        'sectors-charities': './sectors-charities.html',
        blog: './blog.html',
        'blog-post': './blog-post.html',
        tools: './tools.html',
        privacy: './privacy.html',
        terms: './terms.html',
        'admin-login': './admin-login.html',
        'admin/blog': './admin/blog.html',
        'admin/import': './admin/import.html',
        'admin/import-direct': './admin/import-direct.html',
        'admin/publish-all': './admin/publish-all.html',
        'admin/wipe-imported': './admin/wipe-imported.html',
        'admin/blog/new': './admin/blog/new.html',
        'admin/blog/edit': './admin/blog/edit.html',
        'admin/import-json-to-supabase': './admin/import-json-to-supabase.html',
        // Tax topic pages
        'services-tax/self-assessment-tax': './services-tax/self-assessment-tax.html',
        'services-tax/corporation-tax': './services-tax/corporation-tax.html',
        'services-tax/rd-tax': './services-tax/rd-tax.html',
        'services-tax/vat': './services-tax/vat.html',
        'services-tax/cis': './services-tax/cis.html',
        'services-tax/payroll-paye': './services-tax/payroll-paye.html',
        'services-tax/capital-gains-tax': './services-tax/capital-gains-tax.html',
        'services-tax/inheritance-tax': './services-tax/inheritance-tax.html',
        'services-tax/landlord-tax': './services-tax/landlord-tax.html',
        'services-tax/tax-planning': './services-tax/tax-planning.html',
        'services-tax/hmrc-compliance': './services-tax/hmrc-compliance.html',
        'services-tax/business-planning-startups': './services-tax/business-planning-startups.html',
        'services-tax/making-tax-digital': './services-tax/making-tax-digital.html',
        // Accounts topic pages
        'services-accounts/management-accounts': './services-accounts/management-accounts.html',
        'services-accounts/bookkeeping': './services-accounts/bookkeeping.html',
        'services-accounts/sole-trade-accounts': './services-accounts/sole-trade-accounts.html',
        'services-accounts/statutory-accounts': './services-accounts/statutory-accounts.html',
        'services-accounts/limited-company-accounts': './services-accounts/limited-company-accounts.html',
        'services-accounts/partnership-accounts': './services-accounts/partnership-accounts.html',
        'services-accounts/llp-accounts': './services-accounts/llp-accounts.html',
        'services-accounts/dormant-accounts': './services-accounts/dormant-accounts.html',
        'services-accounts/group-accounts': './services-accounts/group-accounts.html',
        // Advisory topic pages
        'services-advisory/business-planning-startups': './services-advisory/business-planning-startups.html',
        'services-advisory/cashflow-forecasting-budgeting': './services-advisory/cashflow-forecasting-budgeting.html',
        'services-advisory/growth-advisory': './services-advisory/growth-advisory.html',
        'services-advisory/profit-improvement-cost-optimisation': './services-advisory/profit-improvement-cost-optimisation.html',
        'services-advisory/funding-support-investor-readiness': './services-advisory/funding-support-investor-readiness.html',
        'services-advisory/due-diligence-support': './services-advisory/due-diligence-support.html',
        'services-advisory/business-valuation': './services-advisory/business-valuation.html',
        'services-advisory/exit-succession-planning': './services-advisory/exit-succession-planning.html',
        'services-advisory/company-secretarial': './services-advisory/company-secretarial.html',
        'services-advisory/software-systems-advisory': './services-advisory/software-systems-advisory.html'
      }
    }
  },
  publicDir: 'public', // Use public directory for static assets
  plugins: [
    {
      name: 'copy-static-assets',
      writeBundle() {
        // Copy script.js, styles.css, blog-data.js, admin-auth.js, and Supabase config files to dist root
        const filesToCopy = ['script.js', 'styles.css', 'blog-data.js', 'admin-auth.js', 'supabase-config.js', 'blog-data-supabase.js'];
        filesToCopy.forEach(file => {
          const src = join(process.cwd(), file);
          const dest = join(process.cwd(), 'dist', file);
          if (existsSync(src)) {
            copyFileSync(src, dest);
            console.log(`✓ Copied ${file} to dist/`);
          }
        });
        
        // Copy data directory
        const dataSrc = join(process.cwd(), 'data');
        const dataDest = join(process.cwd(), 'dist', 'data');
        if (existsSync(dataSrc)) {
          // Copy blog-posts.json specifically
          const blogDataSrc = join(dataSrc, 'blog-posts.json');
          const blogDataDest = join(dataDest, 'blog-posts.json');
          if (existsSync(blogDataSrc)) {
            if (!existsSync(dataDest)) {
              mkdirSync(dataDest, { recursive: true });
            }
            copyFileSync(blogDataSrc, blogDataDest);
            console.log(`✓ Copied data/blog-posts.json to dist/data/`);
          }
        }
        
        // Copy Images directory (recursively)
        const imagesSrc = join(process.cwd(), 'Images');
        const imagesDest = join(process.cwd(), 'dist', 'Images');
        if (existsSync(imagesSrc)) {
          function copyRecursive(src, dest) {
            if (!existsSync(dest)) {
              mkdirSync(dest, { recursive: true });
            }
            const entries = readdirSync(src, { withFileTypes: true });
            for (const entry of entries) {
              const srcPath = join(src, entry.name);
              const destPath = join(dest, entry.name);
              if (entry.isDirectory()) {
                copyRecursive(srcPath, destPath);
              } else {
                copyFileSync(srcPath, destPath);
              }
            }
          }
          copyRecursive(imagesSrc, imagesDest);
          console.log(`✓ Copied Images directory to dist/Images/`);
        }
      }
    }
  ],
  // Explicitly define environment variables to ensure they're replaced
  define: {
    'import.meta.env.VITE_ADMIN_USERNAME': JSON.stringify(process.env.VITE_ADMIN_USERNAME || 'admin'),
    'import.meta.env.VITE_ADMIN_PASSWORD': JSON.stringify(process.env.VITE_ADMIN_PASSWORD || '')
  }
});
