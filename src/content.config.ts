// https://docs.astro.build/en/guides/content-collections/#the-collection-config-file
// https://docs.astro.build/en/tutorials/add-content-collections/#create-a-collection-for-your-blog-posts

// Import utilities from `astro:content`
import { z, defineCollection } from "astro:content"
import { glob } from 'astro/loaders'

// Collections
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    location: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()),
    // If set to true, filters all posts even if key not in frontmatter
    draft: z.boolean().optional().default(false),
  }),
});

const resumes = defineCollection({
  loader: glob({ pattern: "**/*.yml", base: "./src/content/resumes" }),
})

// Export a single `collections` object to register your collection(s)
export const collections = { blog, resumes }
