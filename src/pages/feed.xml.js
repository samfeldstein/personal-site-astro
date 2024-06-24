import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET() {
  const posts = await getCollection("blog");
  return rss({
    title: "Sam Feldstein's Blog",
    description:
      "Sam Feldstein's personal website. Sam is a web developer from Bondurant, IA.",
    site: "https://samfeldstein.xyz",
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/posts/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
