// Not sure how to render MDX in the xml feed. This might help: https://scottwillsey.com/rss-pt2/
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { filterDrafts } from '../scripts/utils';
import { sortCollectionByDate } from "../scripts/utils.ts";
import { site } from "../../config.mjs";

export async function GET(context) {
  const blog = await getCollection('blog', filterDrafts);
  sortCollectionByDate(blog);
  return rss({
    title: "Sam Feldstein's Blog",
    description: `${site.description}`,
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      // Compute RSS link from post `id`
      // This example assumes all posts are rendered as `/blog/[id]` routes
      link: `/blog/${post.id}/`
    })),
  });
}