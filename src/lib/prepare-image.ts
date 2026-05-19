const MAX_DIMENSION = 1536;
const JPEG_QUALITY = 0.82;
const MAX_BYTES = 4 * 1024 * 1024;

const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Normalize iPhone HEIC/large photos to JPEG for Gemini vision API. */
export async function prepareImageForAnalysis(file: File): Promise<File> {
  const type = file.type.toLowerCase();
  const canSendDirect =
    SUPPORTED_TYPES.has(type) && file.size <= MAX_BYTES;

  if (canSendDirect) return file;

  if (typeof createImageBitmap !== "function") {
    throw new Error(
      "This browser cannot process photos. Try a smaller JPEG or use text input."
    );
  }

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available");

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) =>
          b ? resolve(b) : reject(new Error("Failed to encode image as JPEG")),
        "image/jpeg",
        JPEG_QUALITY
      );
    });

    if (blob.size > MAX_BYTES) {
      throw new Error("Image is still too large after compression. Try text input.");
    }

    return new File([blob], "food.jpg", { type: "image/jpeg" });
  } finally {
    bitmap?.close();
  }
}
