import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';

const SITE_URL = process.env.VITE_SITE_URL || 'https://cj-portfolio-eta.vercel.app';

export default defineConfig({
  plugins: [{
    name: 'portfolio-site-url',
    transformIndexHtml(html) {
      return html
        .replaceAll('__SITE_URL__', SITE_URL.replace(/\/$/, ''))
        .replaceAll('https://charlesjohnduot.netlify.app', SITE_URL.replace(/\/$/, ''));
    },
    closeBundle() {
      for (const file of ['robots.txt', 'sitemap.xml']) {
        const path = resolve(__dirname, 'dist', file);
        try {
          writeFileSync(path, readFileSync(path, 'utf8').replaceAll('__SITE_URL__', SITE_URL.replace(/\/$/, '')));
        } catch { /* Vite may be running in dev mode without a dist directory. */ }
      }
    },
  }],
  build: {
    chunkSizeWarningLimit: 850,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cjAiAssistant: resolve(__dirname, 'projects/cj-ai-assistant.html'),
        allProjects: resolve(__dirname, 'projects/index.html'),
        personalCrm: resolve(__dirname, 'projects/personal-crm.html'),
        devpilot:resolve(__dirname, 'projects/devpilot.html'),
        eventCore:resolve(__dirname, 'projects/event-core.html'),
        helpdeskTicketingSystem: resolve(__dirname, 'projects/helpdesk-ticketing-system.html'),
        luxKitchens: resolve(__dirname, 'projects/lux-kitchens.html'),
        resumeaiBuilder: resolve(__dirname, 'projects/resumeai-builder.html'),
        starlegendsRodriguez: resolve(__dirname, 'projects/starlegends-rodriguez.html'),
      },
    },
  },
});


