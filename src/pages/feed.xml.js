import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { siteConfig } from "../../siteConfig.mjs";
import { sortPostsByDate } from "../scripts/utils";

export async function GET() {
  const posts = await getCollection("blog");
  sortPostsByDate(posts);
  return rss({
    title: `${siteConfig.title}`,
    description:
      `${siteConfig.description}`,
    site: `${siteConfig.url}`,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
