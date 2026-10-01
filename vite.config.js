import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cjAiAssistant: resolve(__dirname, 'projects/cj-ai-assistant.html'),
        eventCore: resolve(__dirname, 'projects/event-core.html'),
        helpdeskTicketingSystem: resolve(__dirname, 'projects/helpdesk-ticketing-system.html'),
        luxKitchens: resolve(__dirname, 'projects/lux-kitchens.html'),
        starlegendsRodriguez: resolve(__dirname, 'projects/starlegends-rodriguez.html'),
      },
    },
  },
});


