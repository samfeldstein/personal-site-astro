import { defineConfig } from 'astro/config'

// Plugins
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import remarkSmartypants from 'remark-smartypants'

// https://astro.build/config
export default defineConfig({
  site: 'https://samfeldstein.xyz',
  markdown: {
    remarkPlugins: [remarkSmartypants],
  },

  // https://docs.astro.build/en/guides/prefetch/
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  integrations: [mdx(), sitemap()],

  vite: {
    build: {
      // Limit inline css (default is...lower)
      assetsInlineLimit: 14000,
    },
  },
})