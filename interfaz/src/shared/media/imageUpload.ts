const MAX_UPLOAD_SIZE_BYTES = 6 * 1024 * 1024;
const MAX_IMAGE_SIDE = 1200;
const DEFAULT_QUALITY = 0.84;

export const IMAGE_UPLOAD_HELPER_TEXT = "Sube JPG, PNG o WEBP. La imagen se optimiza antes de guardar.";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("No se pudo leer la imagen seleccionada."));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo procesar la imagen seleccionada."));
    image.src = source;
  });
}

export async function fileToOptimizedDataUrl(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecciona un archivo de imagen valido.");
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("La imagen es demasiado pesada. Usa una menor a 6 MB.");
  }

  const original = await readFileAsDataUrl(file);
  if (file.type === "image/svg+xml") return original;

  const image = await loadImage(original);
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar la imagen para guardar.");
  }

  context.drawImage(image, 0, 0, width, height);
  const targetMimeType = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
  return canvas.toDataURL(targetMimeType, DEFAULT_QUALITY);
}
