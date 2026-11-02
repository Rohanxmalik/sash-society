const PHOTO_SIZE_PX = 400;
const PHOTO_QUALITY = 0.85;

// Crops to a centred square and re-encodes as JPEG, so a large camera photo
// stays small enough to keep in the database.
export async function resizePhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = PHOTO_SIZE_PX;
  canvas.height = PHOTO_SIZE_PX;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");

  // JPEG has no transparency, so a PNG logo would otherwise turn black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, PHOTO_SIZE_PX, PHOTO_SIZE_PX);
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    PHOTO_SIZE_PX,
    PHOTO_SIZE_PX
  );
  bitmap.close();

  return canvas.toDataURL("image/jpeg", PHOTO_QUALITY);
}
