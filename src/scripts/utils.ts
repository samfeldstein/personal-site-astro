// Transformations
export function sortCollectionByDate(collection) {
  collection.sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
  return collection;
}

export async function getGalleryImages() {
  const images = import.meta.glob('/src/images/gallery/**/*.{jpg,jpeg,png,webp}');

  // 3. Images are promises, so we need to resolve the glob promises
  const resolvedImages = await Promise.all(
    Object.values(images).map((image) => image().then((mod) => mod.default))
  );

  return resolvedImages;
}
