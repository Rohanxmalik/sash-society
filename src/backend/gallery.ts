import { readdir } from "node:fs/promises";
import path from "node:path";

type GallerySource = { id: string; label: string; folder: string };

const PHOTO_FILE = /\.(jpe?g|png|webp)$/i;

async function photosIn(directory: string) {
  try {
    const files = await readdir(directory);
    return files.filter((file) => PHOTO_FILE.test(file)).sort();
  } catch {
    // A conference whose photos have not been added yet has no folder.
    return [];
  }
}

export async function loadGallery(sources: GallerySource[], publicDir: string) {
  const gallery = await Promise.all(
    sources.map(async ({ id, label, folder }) => {
      const files = await photosIn(path.join(publicDir, folder));
      return {
        id,
        label,
        images: files.map((file, index) => ({
          src: encodeURI(`/${folder}/${file}`),
          alt: `${label} - Photo ${index + 1}`,
        })),
      };
    })
  );

  return gallery.filter(({ images }) => images.length > 0);
}
