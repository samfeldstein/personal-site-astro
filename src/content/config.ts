// https://docs.astro.build/en/tutorials/add-content-collections/#create-a-collection-for-your-blog-posts
// Import utilities from `astro:content`
import { z, defineCollection } from "astro:content";
// Define a `type` and `schema` for each collection
const blogPosts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    location: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean().optional().default(false),
  }),
});
// Export a single `collections` object to register your collection(s)
export const collections = {
  blog: blogPosts,
};
