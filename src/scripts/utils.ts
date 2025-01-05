// Imports
import { promisify } from 'node:util';
import { exec as execCallback } from 'node:child_process';
import path from "path";
import { ExifTool } from "exiftool-vendored";

// Convert exec to promise-based
const exec = promisify(execCallback);

// Transformations
export function sortCollectionByDate(collection) {
  collection.sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
  return collection;
}

// export function getGalleryImages() {
//   // Eagerly load images for Astro's Picture component
//   const images = import.meta.glob('/src/images/gallery/**/*.{jpg,jpeg,png,webp}', { eager: true });

//   // Map the glob results to an array of image imports
//   return Object.entries(images).map(([path, module]) => ({
//     src: module.default, // The processed image path for <Picture>
//     path // The original file path, if needed
//   }));
// }

// export async function getImageMetadata(imagePath) {
//   try {
//     // Convert to absolute path and escape spaces
//     const absolutePath = path.join(process.cwd(), imagePath);
//     const escapedPath = absolutePath.replace(/(\s+)/g, '\\$1');

//     // Run mdls command to get metadata
//     const { stdout } = await exec(`mdls "${escapedPath}"`);

//     // Debug: see what we're getting
//     // console.log('Raw mdls output for', path.basename(imagePath));
//     // console.log(stdout);

//     // Parse the mdls output into an object
//     const metadata = stdout.split('\n').reduce((acc, line) => {
//       const match = line.match(/^(\w+)\s+=\s"?(.*?)"?$/);
//       if (match) {
//         acc[match[1]] = match[2];
//       }
//       return acc;
//     }, {});

//     return {
//       title: metadata.kMDItemTitle || '',
//       alt: metadata.kMDItemDescription || metadata.kMDItemTitle || '',
//       date: metadata.kMDItemContentCreationDate
//     };
//   } catch (error) {
//     console.error(`Error reading metadata for ${imagePath}:`, error);
//     // Fallback: create alt text from filename
//     const fileName = path.basename(imagePath, path.extname(imagePath))
//       .replace(/[-_]/g, ' ')
//       .replace(/\b\w/g, l => l.toUpperCase());
//     return {
//       title: fileName,
//       alt: fileName
//     };
//   }
// }

// export async function getGalleryImages() {
//   const images = import.meta.glob('/src/images/gallery/**/*.{jpg,jpeg,png,webp}', { eager: true });
//   const imageArray = Object.entries(images).map(([path, module]) => ({
//     src: module.default,
//     rawPath: path,
//   }));
//   const imagesWithMetadata = await Promise.all(
//     imageArray.map(async (image) => {
//       const metadata = await getImageMetadata(image.rawPath);
//       return {
//         ...image,
//         title: metadata.title,
//         alt: metadata.alt,
//         pubDate: metadata.date
//       };
//     })
//   );

//   // Sort images by date, most recent first
//   const sortedImages = imagesWithMetadata.sort((a, b) => {
//     const dateA = new Date(a.pubDate);
//     const dateB = new Date(b.pubDate);
//     return dateB - dateA;  // For oldest first, switch to: return dateA - dateB
//   });

//   return sortedImages;
// }

// export async function getGalleryImages() {
//   const images = import.meta.glob('/src/images/gallery/**/*.{jpg,jpeg,png,webp}', { eager: true });

//   const imageArray = Object.entries(images).map(([path, module]) => ({
//     src: module.default,
//     rawPath: path,
//   }));

//   const imagesWithMetadata = await Promise.all(
//     imageArray.map(async (image) => {
//       const metadata = await getImageMetadata(image.rawPath);
//       return {
//         ...image,
//         title: metadata.title,
//         alt: metadata.alt,
//         pubDate: metadata.date
//       };
//     })
//   );

//   // // Debug: look at first image's metadata
//   // if (imagesWithMetadata[0]) {
//   //   console.log('First image metadata:', {
//   //     path: imagesWithMetadata[0].rawPath,
//   //     title: imagesWithMetadata[0].title,
//   //     alt: imagesWithMetadata[0].alt
//   //   });
//   // }

//   return imagesWithMetadata;
// }

// ExifTool Method
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

    return results;
  } catch (err) {
    console.error("Something terrible happened while processing the gallery:", err);
    return [];
  } finally {
    // Close the ExifTool instance after all tasks are done
    await exiftool.end();
  }
}