import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Public address of the website. Once skbridalstudio.com is connected in Firebase Hosting,
// change this to 'https://skbridalstudio.com', rebuild and deploy (see DOMAIN-SETUP.md).
const SITE_URL = 'https://skbridalstudio.web.app';

// Pages listed in sitemap.xml — keep in sync with the routes in src/App.tsx.
const SITEMAP_ROUTES = ['/', '/about', '/services', '/portfolio', '/reviews', '/packages', '/workshops', '/contact', '/privacy-policy'];

// Fills %SITE_URL% in index.html and writes sitemap.xml and robots.txt into the build.
function siteFiles(): Plugin {
  return {
    name: 'site-files',
    // 'pre' so the placeholder is replaced before Vite parses the URLs in index.html
    transformIndexHtml: { order: 'pre', handler: (html) => html.replaceAll('%SITE_URL%', SITE_URL) },
    generateBundle() {
      const urls = SITEMAP_ROUTES.map((route) => `  <url><loc>${SITE_URL}${route}</loc></url>`).join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
   assetsInclude: ['**/*.JPEG'],
  plugins: [react(), siteFiles()],
  define: {
    __SITE_URL__: JSON.stringify(SITE_URL),
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
