import { JSDOM } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body></body></html>");
Object.assign(globalThis, { window: dom.window, document: dom.window.document, Node: dom.window.Node, HTMLElement: dom.window.HTMLElement, DOMParser: dom.window.DOMParser, getComputedStyle: dom.window.getComputedStyle, Element: dom.window.Element });
const { readFileSync } = await import("node:fs");
const test = (await import("node:test")).default; const assert = (await import("node:assert/strict")).default;
const { Editor } = await import("../src/lib/md-editor-extensions.ts");
const { mdExtensions } = await import("../src/lib/md-editor-extensions.ts");
const React = await import("react"); const { renderToStaticMarkup } = await import("react-dom/server");
const RM0 = (await import("react-markdown")).default; const gfm0 = (await import("remark-gfm")).default; const breaks0 = (await import("remark-breaks")).default;
const { splitSections } = await import("../src/lib/md-sections.ts");
const md = readFileSync(new URL("./fixtures/about-body-es.md", import.meta.url),"utf8");
const prep = (t:string)=>t.replace(/\r\n?/g,"\n").replace(/^([ \t]*)\*(?=[ \t])/gm,"$1\\*");
const html = (t:string)=>renderToStaticMarkup(React.createElement(RM0,{remarkPlugins:[gfm0,breaks0],skipHtml:true},prep(t))).replace(/\s+/g," ").replace(/> </g,"><").trim();
const rt = (t:string, blog=false)=>{ const e=new Editor({extensions: mdExtensions({blog}), content: prep(t)}); const out=(e.storage as unknown as {markdown:{getMarkdown:()=>string}}).markdown.getMarkdown(); e.destroy(); return out; };
const sp = splitSections(md);
let ok=0, bad=0;
const parts = [sp.intro.join("\n"), ...sp.sections.map(s=>s.lines.join("\n"))];
for (const [i,p] of parts.entries()) { const out=rt(p); if (html(p)===html(out)) ok++; else { bad++; console.log("DIFF part",i,"\nA:",html(p).slice(0,400),"\nB:",html(out).slice(0,400)); } }
console.log("about.body parts ok",ok,"bad",bad);
const last = rt(sp.sections.at(-1)!.lines.join("\n")); console.log("footnote:", JSON.stringify(last.split("\n").at(-1)));
const RM = (await import("react-markdown")).default; const gfm = (await import("remark-gfm")).default;
const bhtml = (t:string)=>renderToStaticMarkup(React.createElement(RM,{remarkPlugins:[gfm]},t)).replace(/\s+/g," ").replace(/> </g,"><").trim();
const posts = JSON.parse(readFileSync(new URL("./fixtures/blog-bodies.json", import.meta.url),"utf8"));
let bok=0,bbad=0;
for (const p of posts) for (const k of ["body_es","body_en"]) { const a=p[k]; const out=rt(a,true); if (bhtml(a)===bhtml(out)) bok++; else { bbad++; const A=bhtml(a),B=bhtml(out); let i=0; while(A[i]===B[i]) i++; console.log("BLOG DIFF",p.slug,k,"\nA:",A.slice(Math.max(0,i-120),i+160),"\nB:",B.slice(Math.max(0,i-120),i+160)); } }
console.log("blog ok",bok,"bad",bbad);

test("about.body sections round-trip to the same render", () => assert.equal(bad, 0));
test("footnote '* ' stays a literal asterisk", () => assert.match(last.split("\n").at(-1)!, /^\\\* Respecto a Lulox/));
test("blog bodies round-trip to the same render", () => assert.equal(bbad, 0));
