import test from "node:test";
import assert from "node:assert/strict";
const { isMediaKey, sniffImage } = await import("../src/lib/media.ts");
test("media keys are strict", () => {
  assert.ok(isMediaKey("blog/2026/123e4567-e89b-12d3-a456-426614174000.png"));
  for (const k of ["../x", "blog/2026/x.svg", "blog/2026/123e4567-e89b-12d3-a456-426614174000.svg", "other/2026/123e4567-e89b-12d3-a456-426614174000.png"]) assert.ok(!isMediaKey(k), k);
});
test("magic bytes", () => {
  assert.equal(sniffImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0])), "image/png");
  assert.equal(sniffImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
  assert.equal(sniffImage(new TextEncoder().encode("<svg xmlns=")), null);
});
