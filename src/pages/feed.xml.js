// https://docs.astro.build/en/guides/rss/

import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { filterDrafts } from "../scripts/utils.ts";
import { site } from "../../config.mjs";
import { sortCollectionByDate } from "../scripts/utils.ts";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";

const parser = new MarkdownIt();

export async function GET() {
  const posts = await getCollection("blog", filterDrafts);
  sortCollectionByDate(posts);

  return rss({
    title: site.title, // May fix micro.blog title rendering issue
    description: site.description,
    site: site.url,
    items: posts.map((post) => {
      const sanitizedContent = sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      });

      return {
        title: post.data.title, // No sanitization needed here
        pubDate: post.data.pubDate,
        description: post.data.description, // Ensure this is plain text or sanitized if it includes HTML
        categories: post.data.tags,
        link: `/blog/${post.slug}/`,
        content: sanitizedContent, // Only content is sanitized
      };
    }),
    customData: `<language>en-us</language>`,
  });
}
