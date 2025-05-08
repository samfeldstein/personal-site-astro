// Plugins
import rss from '@astrojs/rss';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

// Functions
import { getCollection } from 'astro:content';
import { sortCollectionByDate } from '../scripts/utils';

// Site data
import { site } from "../../config.mjs";

const parser = new MarkdownIt();

export async function GET(context) {
  // Filter drafts
  const publishedPosts = await getCollection('blog', ({ data }) => { return data.draft !== true; });

  sortCollectionByDate(publishedPosts);
  return rss({
    title: "Sam Feldstein's Blog",
    description: `${site.description}`,
    site: context.site,
    items: publishedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      // Compute RSS link from post `id`
      // This assumes all posts are rendered as `/blog/[id]` routes
      link: `/blog/${post.id}/`,
      // Note: this will not process components or JSX expressions in MDX files.
      // This might help: https://scottwillsey.com/rss-pt2/
      content: sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
      }),
    })),
  });
}