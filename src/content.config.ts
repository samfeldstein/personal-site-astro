// https://docs.astro.build/en/guides/content-collections/#the-collection-config-file
// https://docs.astro.build/en/tutorials/add-content-collections/#create-a-collection-for-your-blog-posts

// Import utilities from `astro:content`
import { z, defineCollection } from "astro:content";
import { glob } from 'astro/loaders';



// Collections
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx,yml}', base: './src/pages/blog' }),
  // schema: z.object({
  //   title: z.string(),
  //   pubDate: z.date(),
  //   location: z.string(),
  //   description: z.string(),
  //   tags: z.array(z.string()),
  //   draft: z.boolean().optional().default(true),
  // }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()),
    private: z.boolean().optional().default(true),
  })
})

// Export a single `collections` object to register your collection(s)
export const collections = { blog, notes };
