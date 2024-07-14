import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { site } from "../../config.mjs";
import { sortCollectionByDate } from "../scripts/utils";

export async function GET() {
  const posts = await getCollection("blog");
  sortCollectionByDate(posts);
  return rss({
    title: `${site.title}`,
    description:
      `${site.description}`,
    site: `${site.url}`,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
