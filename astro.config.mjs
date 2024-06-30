import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://samfeldstein.xyz',
    prefetch: {
      prefetchAll: true
    },
    vite: {
        css: {
          transformer: "sass",
        },
      },
});
