export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Bild konnte nicht geladen werden.")));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/** Liefert ein quadratisches JPEG nach Zuschnitt (max. outputSize px). */
export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputSize = 800,
  rotation = 0,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar.");

  const rotRad = (rotation * Math.PI) / 180;
  const { width: boxW, height: boxH } = rotateSize(image.width, image.height, rotation);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.translate(-pixelCrop.x, -pixelCrop.y);
  ctx.translate(boxW / 2, boxH / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const out = document.createElement("canvas");
  const outCtx = out.getContext("2d");
  if (!outCtx) throw new Error("Canvas nicht verfügbar.");

  const size = Math.min(outputSize, pixelCrop.width, pixelCrop.height);
  out.width = size;
  out.height = size;
  outCtx.drawImage(canvas, 0, 0, pixelCrop.width, pixelCrop.height, 0, 0, size, size);

  return new Promise((resolve, reject) => {
    out.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Export fehlgeschlagen."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.88,
    );
  });
}

/** Freiform-Zuschnitt — max. Breite in px, Seitenverhältnis bleibt erhalten. */
export async function getCroppedRectImageBlob(
  imageSrc: string,
  pixelCrop: PixelCrop,
  maxWidth = 1200,
  rotation = 0,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar.");

  const rotRad = (rotation * Math.PI) / 180;
  const { width: boxW, height: boxH } = rotateSize(image.width, image.height, rotation);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.translate(-pixelCrop.x, -pixelCrop.y);
  ctx.translate(boxW / 2, boxH / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const scale = pixelCrop.width > maxWidth ? maxWidth / pixelCrop.width : 1;
  const outW = Math.round(pixelCrop.width * scale);
  const outH = Math.round(pixelCrop.height * scale);

  const out = document.createElement("canvas");
  const outCtx = out.getContext("2d");
  if (!outCtx) throw new Error("Canvas nicht verfügbar.");

  out.width = outW;
  out.height = outH;
  outCtx.drawImage(canvas, 0, 0, pixelCrop.width, pixelCrop.height, 0, 0, outW, outH);

  return new Promise((resolve, reject) => {
    out.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Export fehlgeschlagen."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.9,
    );
  });
}

export function readFileAsObjectUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Datei konnte nicht gelesen werden."));
    };
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
    reader.readAsDataURL(file);
  });
}

export function isLikelyImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
}
