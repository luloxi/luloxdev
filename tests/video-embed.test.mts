import { JSDOM } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body></body></html>");
Object.assign(globalThis, { window: dom.window, document: dom.window.document, Node: dom.window.Node, HTMLElement: dom.window.HTMLElement, DOMParser: dom.window.DOMParser, getComputedStyle: dom.window.getComputedStyle, Element: dom.window.Element });
const test = (await import("node:test")).default;
const assert = (await import("node:assert/strict")).default;
const { parseVideoUrl } = await import("../src/lib/video-embed.ts");
const { Editor, mdExtensions } = await import("../src/lib/md-editor-extensions.ts");

test("allowlisted YouTube URLs parse to a nocookie embed", () => {
  for (const u of ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://youtu.be/dQw4w9WgXcQ", "https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=10", "https://www.youtube.com/shorts/dQw4w9WgXcQ", "https://www.youtube.com/embed/dQw4w9WgXcQ"]) {
    assert.equal(parseVideoUrl(u)?.embedSrc, "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", u);
  }
});
test("Vimeo URLs parse", () => {
  assert.equal(parseVideoUrl("https://vimeo.com/76979871")?.embedSrc, "https://player.vimeo.com/video/76979871?dnt=1");
  assert.equal(parseVideoUrl("https://player.vimeo.com/video/76979871")?.id, "76979871");
});
test("everything else is rejected", () => {
  for (const u of ["javascript:alert(1)", "https://evil.com/watch?v=dQw4w9WgXcQ", "https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ", "https://www.youtube.com/watch?v=bad\"><script>", "https://youtu.be/short", "https://vimeo.com/abc", "https://user:pw@youtube.com/watch?v=dQw4w9WgXcQ", "data:text/html,x", ""]) {
    assert.equal(parseVideoUrl(u), null, u);
  }
});
const rt = (md: string) => { const e = new Editor({ extensions: mdExtensions({ blog: true }), content: md }); const json = e.getJSON(); const out = (e.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown(); e.destroy(); return { json, out }; };
test("a paragraph with only a video link becomes a video node and round-trips", () => {
  const md = "Intro\n\n[Mi charla](https://www.youtube.com/watch?v=dQw4w9WgXcQ)\n\nFin";
  const { json, out } = rt(md);
  assert.ok(JSON.stringify(json).includes('"videoEmbed"'));
  assert.equal(out.trim(), md);
});
test("inline video links in text stay links", () => {
  const md = "Mirá [esto](https://youtu.be/dQw4w9WgXcQ) ahora";
  const { json, out } = rt(md);
  assert.ok(!JSON.stringify(json).includes('"videoEmbed"'));
  assert.equal(out.trim(), md);
});
test("images round-trip", () => {
  const md = "![epígrafe](/media/blog/2026/123e4567-e89b-12d3-a456-426614174000.webp)";
  assert.equal(rt(md).out.trim(), md);
});
test("video then image inserted from the toolbar both survive and serialize", () => {
  const e = new Editor({ extensions: mdExtensions({ blog: true }), content: "Hola" });
  e.chain().setTextSelection(e.state.doc.content.size - 1).insertContent([{ type: "videoEmbed", attrs: { src: "https://youtu.be/dQw4w9WgXcQ", title: "YouTube" } }, { type: "paragraph" }]).run();
  e.chain().insertContent([{ type: "image", attrs: { src: "/media/blog/2026/x.png", alt: "Prueba" } }, { type: "paragraph" }]).run();
  const out = (e.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
  e.destroy();
  assert.match(out, /\[YouTube\]\(https:\/\/youtu\.be\/dQw4w9WgXcQ\)/);
  assert.match(out, /!\[Prueba\]\(\/media\/blog\/2026\/x\.png\)/);
});
