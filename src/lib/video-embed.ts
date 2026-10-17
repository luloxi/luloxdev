/**
 * Video embeds in Markdown: a paragraph that is only a link to an allowlisted
 * YouTube/Vimeo URL renders as a responsive iframe. Stored as a plain link
 * ([title](url)), so the Markdown stays safe and readable. Only the parsed,
 * validated id ever reaches the iframe src.
 */
export type VideoEmbed = { provider: "youtube" | "vimeo"; id: string; embedSrc: string };

const YT_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be", "www.youtube-nocookie.com", "youtube-nocookie.com"]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);
const YT_ID = /^[\w-]{11}$/;
const VIMEO_ID = /^\d{6,12}$/;

export function parseVideoUrl(href: string | null | undefined): VideoEmbed | null {
  if (!href || typeof href !== "string") return null;
  let u: URL;
  try {
    u = new URL(href.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (u.username || u.password || u.port) return null;
  const host = u.hostname.toLowerCase();
  const seg = u.pathname.split("/").filter(Boolean);
  if (YT_HOSTS.has(host)) {
    let id: string | null = null;
    if (host === "youtu.be") id = seg[0] ?? null;
    else if (seg[0] === "watch") id = u.searchParams.get("v");
    else if (seg[0] === "embed" || seg[0] === "shorts" || seg[0] === "live" || seg[0] === "v") id = seg[1] ?? null;
    else if (seg.length === 0) id = u.searchParams.get("v");
    if (!id || !YT_ID.test(id)) return null;
    return { provider: "youtube", id, embedSrc: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  if (VIMEO_HOSTS.has(host)) {
    const id = host === "player.vimeo.com" ? (seg[0] === "video" ? seg[1] : null) : seg.find((s) => VIMEO_ID.test(s)) ?? null;
    if (!id || !VIMEO_ID.test(id)) return null;
    return { provider: "vimeo", id, embedSrc: `https://player.vimeo.com/video/${id}?dnt=1` };
  }
  return null;
}

export const VIDEO_IFRAME_ALLOW = "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
