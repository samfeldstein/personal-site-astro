export function getCurrentYear() {
  const date = new Date()
  const year = date.getFullYear()
  return year
}

// Sort collections by date
export function sortCollectionByDate(collection) {
  return collection.sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
}

// Format tags
export function formatTag(str) {
  return str
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize the first letter of each word
}
