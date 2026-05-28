// Import utilities from `astro:content`
import { defineCollection } from "astro:content"
import { glob } from 'astro/loaders'

const resumes = defineCollection({
  loader: glob({ pattern: "**/*.yml", base: "./src/content/resumes" }),
})

// Export a single `collections` object to register your collection(s)
export const collections = { resumes }
