/**
 * Reads an image File and returns a downscaled data URL suitable for
 * localStorage (max 1920px wide, JPEG q0.82).
 */
export async function fileToWallpaperDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file isn't an image.");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Image is larger than 12 MB — pick a smaller one.");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not decode that image."));
    image.src = dataUrl;
  });

  const maxWidth = 1920;
  const scale = Math.min(1, maxWidth / img.naturalWidth);
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);

  const out = canvas.toDataURL("image/jpeg", 0.82);
  if (out.length > 4_500_000) {
    throw new Error("Image is too heavy to store locally — try a smaller one.");
  }
  return out;
}

/**
 * Uploads a wallpaper to the private `wallpapers` bucket and returns the
 * storage path, so it follows the account across devices instead of living
 * in a giant settings blob.
 */
export async function uploadWallpaper(userId: string, file: File): Promise<string> {
  const { supabase } = await import("@/integrations/supabase/client");
  const dataUrl = await fileToWallpaperDataUrl(file);
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${userId}/wallpaper-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from("wallpapers")
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error("Could not upload that wallpaper — please try again.");
  return path;
}

/** Removes a stored wallpaper file (no-op for legacy data URLs). */
export async function deleteWallpaper(path: string | null) {
  if (!path || path.startsWith("data:") || path.startsWith("http")) return;
  const { supabase } = await import("@/integrations/supabase/client");
  await supabase.storage.from("wallpapers").remove([path]);
}
