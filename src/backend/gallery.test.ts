import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { loadGallery } from "./gallery";

let publicDir: string;

const conferences = [
  { id: "2nd", label: "Dubai 2025", folder: "images/conferences/2nd-conference" },
  { id: "1st", label: "Online 2024", folder: "images/conferences/1st-conference" },
];

async function addPhoto(folder: string, name: string) {
  const directory = path.join(publicDir, folder);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), "");
}

beforeEach(async () => {
  publicDir = await mkdtemp(path.join(tmpdir(), "gallery-"));
});

afterEach(async () => {
  await rm(publicDir, { recursive: true, force: true });
});

describe("loadGallery", () => {
  test("lists the photos in each conference folder in name order", async () => {
    await addPhoto(conferences[0].folder, "b.jpg");
    await addPhoto(conferences[0].folder, "a.webp");

    const [dubai] = await loadGallery(conferences, publicDir);

    expect(dubai.id).toBe("2nd");
    expect(dubai.images.map((image) => image.src)).toEqual([
      "/images/conferences/2nd-conference/a.webp",
      "/images/conferences/2nd-conference/b.jpg",
    ]);
    expect(dubai.images[0].alt).toBe("Dubai 2025 - Photo 1");
  });

  test("ignores files that are not photos", async () => {
    await addPhoto(conferences[0].folder, "notes.txt");
    await addPhoto(conferences[0].folder, ".DS_Store");
    await addPhoto(conferences[0].folder, "photo.JPG");

    const [dubai] = await loadGallery(conferences, publicDir);

    expect(dubai.images).toHaveLength(1);
  });

  test("leaves out a conference with no photos yet", async () => {
    await addPhoto(conferences[1].folder, "a.png");

    const gallery = await loadGallery(conferences, publicDir);

    expect(gallery.map((conference) => conference.id)).toEqual(["1st"]);
  });

  test("makes file names with spaces safe for a URL", async () => {
    await addPhoto(conferences[0].folder, "group photo.jpg");

    const [dubai] = await loadGallery(conferences, publicDir);

    expect(dubai.images[0].src).toBe(
      "/images/conferences/2nd-conference/group%20photo.jpg"
    );
  });
});
