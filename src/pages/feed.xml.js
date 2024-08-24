// https://docs.astro.build/en/guides/rss/
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { site } from "../../config.mjs";
import { sortCollectionByDate } from "../scripts/utils";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
const parser = new MarkdownIt();

export async function GET() {
  const posts = await getCollection("blog");
  sortCollectionByDate(posts);
  return rss({
    title: `${site.title}`,
    description: `${site.description}`,
    site: `${site.url}`,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      categories: post.data.tags,
      customData: post.data.customData,
      link: `/blog/${post.slug}/`,
      // Note: this will not process components or JSX expressions in MDX files.
      content: sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      }),
      ...post.data,
    })),
    customData: `<language>en-us</language>`,
  });
}
