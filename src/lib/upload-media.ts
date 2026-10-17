/** Client: upload one image to the admin-only media store (R2). Returns its public URL. */
export const MEDIA_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"] as const;
export const MEDIA_MAX_BYTES = 8 * 1024 * 1024;

export async function uploadMedia(file: File): Promise<{ url?: string; error?: string }> {
  if (!(MEDIA_TYPES as readonly string[]).includes(file.type)) return { error: "type" };
  if (file.size > MEDIA_MAX_BYTES) return { error: "size" };
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/media", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok) return { error: res.status === 401 ? "session" : (data.error ?? String(res.status)) };
  return { url: data.url };
}

/** Opens the OS file picker for one image. */
export function pickImageFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = MEDIA_TYPES.join(",");
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.addEventListener("cancel", () => resolve(null));
    input.click();
  });
}
