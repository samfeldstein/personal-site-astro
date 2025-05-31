// Imports
import path from "path";
import { ExifTool } from "exiftool-vendored";

// Sort collections by date
export function sortCollectionByDate(collection) {
  return collection.sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
}

export function formatTag(str) {
  return str
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize the first letter of each word
}

export async function getGalleryImages() {
  // Create a shared ExifTool instance
  const exiftool = new ExifTool();

  const images = import.meta.glob('/src/images/gallery/**/*.{jpg,jpeg,png,webp}', { eager: true });

  try {
    const results = [];

    for (const [rawPath, module] of Object.entries(images)) {
      const absolutePath = path.resolve(`.${rawPath}`);

      try {
        const tags = await exiftool.read(absolutePath);
        results.push({
          src: module.default, // Path for <img>
          rawPath,            // Raw path
          title: tags.Title || "Untitled",
          date: tags.CreateDate || "Unknown date",
          alt: tags.Description || "No description",
        });
      } catch (err) {
        console.error(`Error reading metadata for ${rawPath}:`, err);
        results.push({
          src: module.default,
          rawPath,
          title: "Untitled",
          date: "Unknown date",
          alt: "No description",
        });
      }
    }

    // Sort results by date (oldest to newest)
    results.sort((a, b) => {
      if (a.date === "Unknown date" && b.date === "Unknown date") return 0;
      if (a.date === "Unknown date") return 1;
      if (b.date === "Unknown date") return -1;
      return new Date(b.date) - new Date(a.date);
    });

    return results;
  } catch (err) {
    console.error("Something terrible happened while processing the gallery:", err);
    return [];
  } finally {
    // Close the ExifTool instance after all tasks are done
    await exiftool.end();
  }
}
