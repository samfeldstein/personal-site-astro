// Transformations
export function sortCollectionByDate(collection) {
  collection.sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
  return collection;
}

// Get collection tags
export async function getStaticPaths(collection) {
  const items = await getCollection(collection);
  const uniqueTags = [...new Set(items.map((item) => item.data.tags).flat())];

  return uniqueTags.map((tag) => {
    const filteredPosts = items.filter((item) => item.data.tags.includes(tag));
    return {
      params: { tag },
      props: { items: filteredPosts },
    };
  });
}