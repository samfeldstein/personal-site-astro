---
title: Building an Image Gallery with Astro
description: ""
pubDate: 2025-01-05
location: Boulder, CO
tags: ["webdev"]
draft: true
---

Blog Post Outline: Extracting Image Metadata During a Build Step with exiftool-vendored
Title:
How to Extract Image Metadata During a Build Step in Your Static Site Generator

Introduction
Image metadata, such as title, date, and alt text, can enhance your website’s accessibility and SEO. Tools like exiftool-vendored make it easy to extract this metadata programmatically. In this post, we’ll explore how to integrate metadata extraction into the build process of a static site generator (like Astro).

1. Why Extract Metadata at Build Time?
Efficiency: Preprocessing metadata avoids runtime computation.
Dynamic Content: Automatically populates image titles, dates, and alt attributes.
Scalability: Simplifies managing large image collections.
2. Tools You’ll Need
exiftool-vendored: A Node.js wrapper for ExifTool, the powerful metadata extraction tool.
Static Site Generator: In this example, we’ll use Astro, but the process applies to other generators too.
3. Setting Up the Project
Install Dependencies
First, install the required packages:

`npm install exiftool-vendored`

4. Core Implementation
Step 1: Glob Your Images
Use import.meta.glob (or an equivalent) to list all images during the build process.

Step 2: Extract Metadata
Use exiftool-vendored to read metadata for each image.

Step 3: Manage Lifecycle
Ensure a single instance of ExifTool is created for the entire build process, and close it after all operations.

5. Complete Code Example
Here’s the full implementation:

```js
import { ExifTool } from "exiftool-vendored";
import path from "path";

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
          src: module.default,
          rawPath,
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
    // Close the ExifTool instance after processing all images
    await exiftool.end();
  }
}
```

6. Integrate with Your Build Process
Example Build Script
Add this script to your build process:

```js
import { getGalleryImages } from "./utils/getGalleryImages.js";

(async () => {
  const images = await getGalleryImages();
  console.log("Processed Images Metadata:", images);
})();
```

Example Metadata Output:

```js
Processed Images Metadata: [
  {
    src: '/images/gallery/andrew-bird-1.jpg',
    rawPath: '/src/images/gallery/andrew-bird-1.jpg',
    title: 'Andrew Bird Concert',
    date: '2023-12-25',
    alt: 'Andrew Bird performing live'
  },
  ...
]
```