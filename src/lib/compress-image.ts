/**
 * Browser-side image compression used before an admin upload.
 *
 * Only re-encodes JPEG / PNG (GIFs, SVGs and already-WebP files are left
 * alone: GIF/animated WebP would lose their animation on a canvas, SVG is
 * already vector). Output is WebP, which keeps PNG transparency. The result
 * is only used if it is meaningfully smaller than the original.
 */

const MAX_LONG_EDGE = 2400;
const MIN_BYTES_TO_COMPRESS = 200 * 1024;
const QUALITY = 0.85;

export interface CompressResult {
  file: File;
  /** True when `file` is a new, smaller re-encode of the original. */
  compressed: boolean;
  originalBytes: number;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("無法讀取圖片"));
    };
    img.src = url;
  });
}

export async function compressImage(file: File): Promise<CompressResult> {
  const untouched: CompressResult = { file, compressed: false, originalBytes: file.size };
  if (!/^image\/(jpeg|png)$/.test(file.type) || file.size < MIN_BYTES_TO_COMPRESS) return untouched;

  try {
    const img = await loadImage(file);
    const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = longEdge > MAX_LONG_EDGE ? MAX_LONG_EDGE / longEdge : 1;
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return untouched;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
    // Keep the original unless the re-encode saves at least 10%.
    if (!blob || blob.type !== "image/webp" || blob.size > file.size * 0.9) return untouched;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return {
      file: new File([blob], `${baseName}.webp`, { type: "image/webp" }),
      compressed: true,
      originalBytes: file.size,
    };
  } catch {
    return untouched;
  }
}
