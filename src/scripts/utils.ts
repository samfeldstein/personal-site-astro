// Imports
import { promisify } from 'node:util';
import { exec as execCallback } from 'node:child_process';
import path from 'path';

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

export async function getImageMetadata(imagePath) {
  try {
    // Convert to absolute path and escape spaces
    const absolutePath = path.join(process.cwd(), imagePath);
    const escapedPath = absolutePath.replace(/(\s+)/g, '\\$1');

    // Run mdls command to get metadata
    const { stdout } = await exec(`mdls "${escapedPath}"`);

    // Debug: see what we're getting
    // console.log('Raw mdls output for', path.basename(imagePath));
    // console.log(stdout);

    // Parse the mdls output into an object
    const metadata = stdout.split('\n').reduce((acc, line) => {
      const match = line.match(/^(\w+)\s+=\s"?(.*?)"?$/);
      if (match) {
        acc[match[1]] = match[2];
      }
      return acc;
    }, {});

    return {
      title: metadata.kMDItemTitle || '',
      alt: metadata.kMDItemDescription || metadata.kMDItemTitle || '',
    };
  } catch (error) {
    console.error(`Error reading metadata for ${imagePath}:`, error);
    // Fallback: create alt text from filename
    const fileName = path.basename(imagePath, path.extname(imagePath))
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    return {
      title: fileName,
      alt: fileName
    };
  }
}

export async function getGalleryImages() {
  const images = import.meta.glob('/src/images/gallery/**/*.{jpg,jpeg,png,webp}', { eager: true });

  const imageArray = Object.entries(images).map(([path, module]) => ({
    src: module.default,
    rawPath: path,
  }));

  const imagesWithMetadata = await Promise.all(
    imageArray.map(async (image) => {
      const metadata = await getImageMetadata(image.rawPath);
      return {
        ...image,
        title: metadata.title,
        alt: metadata.alt,
      };
    })
  );

  // // Debug: look at first image's metadata
  // if (imagesWithMetadata[0]) {
  //   console.log('First image metadata:', {
  //     path: imagesWithMetadata[0].rawPath,
  //     title: imagesWithMetadata[0].title,
  //     alt: imagesWithMetadata[0].alt
  //   });
  // }

  return imagesWithMetadata;
}