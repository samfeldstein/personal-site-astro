import { defineCollection } from "astro:content"
import { glob } from 'astro/loaders'

const resumes = defineCollection({
  loader: glob({ pattern: "**/*.yml", base: "./src/content/resumes" }),
})


export const collections = { resumes }
