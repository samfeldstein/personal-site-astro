// Transformations
export function sortCollectionByDate(collection) {
  collection.sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
  return collection;
}


export function getGalleryImages() {
  // Eagerly load images for Astro's Picture component
  const images = import.meta.glob('/src/images/gallery/**/*.{jpg,jpeg,png,webp}', { eager: true });

  // Map the glob results to an array of image imports
  return Object.entries(images).map(([path, module]) => ({
    src: module.default, // The processed image path for <Picture>
    path // The original file path, if needed
  }));
}
