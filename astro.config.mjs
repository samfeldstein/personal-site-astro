import { defineConfig } from "astro/config";

// Plugins
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://samfeldstein.xyz",
  prefetch: {
    prefetchAll: true,
  },
  integrations: [mdx(), sitemap()],
  vite: {
    build: {
      assetsInlineLimit: 14000,
    },
  },
});
