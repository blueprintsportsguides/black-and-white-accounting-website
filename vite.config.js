import { defineConfig } from 'vite';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
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
        about: './about.html',
        contact: './contact.html',
        services: './services.html',
        'services-tax': './services-tax.html',
        'services-accounts': './services-accounts.html',
        'services-advisory': './services-advisory.html',
        sectors: './sectors.html',
        'sectors-construction': './sectors-construction.html',
        'sectors-ecommerce': './sectors-ecommerce.html',
        'sectors-healthcare': './sectors-healthcare.html',
        'sectors-hospitality': './sectors-hospitality.html',
        'sectors-professional-services': './sectors-professional-services.html',
        'sectors-property': './sectors-property.html',
        'sectors-retail': './sectors-retail.html',
        'sectors-startups': './sectors-startups.html',
        'sectors-trades': './sectors-trades.html',
        blog: './blog.html',
        'blog-post': './blog-post.html',
        privacy: './privacy.html',
        terms: './terms.html',
        'admin-login': './admin-login.html',
        'admin/blog': './admin/blog.html',
        'admin/import': './admin/import.html',
        'admin/import-direct': './admin/import-direct.html',
        'admin/publish-all': './admin/publish-all.html',
        'admin/wipe-imported': './admin/wipe-imported.html',
        'admin/blog/new': './admin/blog/new.html',
        'admin/blog/edit': './admin/blog/edit.html'
      }
    }
  },
  publicDir: 'public', // Use public directory for static assets
  plugins: [
    {
      name: 'copy-static-assets',
      writeBundle() {
        // Copy script.js, styles.css, blog-data.js, and admin-auth.js to dist root
        const filesToCopy = ['script.js', 'styles.css', 'blog-data.js', 'admin-auth.js'];
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
      }
    }
  ],
  // Explicitly define environment variables to ensure they're replaced
  define: {
    'import.meta.env.VITE_ADMIN_USERNAME': JSON.stringify(process.env.VITE_ADMIN_USERNAME || 'admin'),
    'import.meta.env.VITE_ADMIN_PASSWORD': JSON.stringify(process.env.VITE_ADMIN_PASSWORD || '')
  }
});
