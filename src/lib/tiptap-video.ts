import { Node, mergeAttributes } from "@tiptap/core";
import { parseVideoUrl, VIDEO_IFRAME_ALLOW } from "@/lib/video-embed";

/** True when the <p> holds nothing but one allowlisted video link. */
function soleVideoLink(el: HTMLElement): HTMLAnchorElement | null {
  const kids = Array.from(el.childNodes).filter((n) => !(n.nodeType === 3 && !(n.textContent ?? "").trim()));
  if (kids.length !== 1) return null;
  const a = kids[0] as HTMLElement;
  if (a.nodeType !== 1 || a.tagName !== "A") return null;
  return parseVideoUrl(a.getAttribute("href")) ? (a as HTMLAnchorElement) : null;
}

/**
 * Block video embed for the blog editor. Markdown: `[title](url)` alone in a
 * paragraph (same thing the public render turns into an iframe).
 */
export const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return { src: { default: null }, title: { default: "" } };
  },
  parseHTML() {
    return [
      {
        tag: "div[data-video-embed]",
        getAttrs: (el) => {
          const src = (el as HTMLElement).getAttribute("data-video-embed");
          return parseVideoUrl(src) ? { src, title: (el as HTMLElement).getAttribute("data-title") ?? "" } : false;
        },
      },
      {
        tag: "p",
        priority: 1000,
        getAttrs: (el) => {
          const a = soleVideoLink(el as HTMLElement);
          return a ? { src: a.getAttribute("href"), title: (a.textContent ?? "").trim() } : false;
        },
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const v = parseVideoUrl(node.attrs.src as string);
    const title = (node.attrs.title as string) || (v?.provider === "vimeo" ? "Vimeo" : "YouTube");
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: "blog-embed", "data-video-embed": node.attrs.src, "data-title": title, contenteditable: "false" }),
      v
        ? ["iframe", { src: v.embedSrc, title, allow: VIDEO_IFRAME_ALLOW, allowfullscreen: "true", loading: "lazy", class: "blog-embed-frame", referrerpolicy: "strict-origin-when-cross-origin" }]
        : ["span", {}, title],
    ];
  },
  addStorage() {
    return {
      markdown: {
        serialize(state: { write: (s: string) => void; closeBlock: (n: unknown) => void; esc: (s: string) => string }, node: { attrs: { src: string; title: string } }) {
          const title = (node.attrs.title || "Video").replace(/[[\]\\]/g, "");
          state.write(`[${title}](${node.attrs.src})`);
          state.closeBlock(node);
        },
        parse: {},
      },
    };
  },
});
