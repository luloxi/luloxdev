/**
 * Only allowlisted admin emails can get a Better Auth account.
 * Runs Better Auth against an in-memory SQLite DB with the real options.
 *   pnpm test
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { buildAuthOptions } from "../src/lib/auth/options.ts";
import { isAdminUser } from "../src/lib/auth/admin.ts";

async function makeAuth() {
  const options = buildAuthOptions(new DatabaseSync(":memory:") as never, {
    BETTER_AUTH_SECRET: "test-only-secret-not-used-anywhere-0123456789",
    GOOGLE_CLIENT_ID: "test",
    GOOGLE_CLIENT_SECRET: "test",
  });
  const { runMigrations } = await getMigrations(options);
  await runMigrations();
  return betterAuth(options);
}

test("isAdminUser allowlist", () => {
  assert.equal(isAdminUser({ email: "LucianoOlivaBianco@gmail.com " }), true);
  assert.equal(isAdminUser({ email: "someone@example.com" }), false);
  assert.equal(isAdminUser(null), false);
});

test("non-admin emails cannot create an account", async () => {
  const ctx = await (await makeAuth()).$context;
  const blocked = await ctx.internalAdapter
    .createUser({ email: "someone@example.com", name: "x", emailVerified: true })
    .catch(() => null);
  assert.equal(blocked ?? null, null);
  const admin = await ctx.internalAdapter.createUser({
    email: "lucianoolivabianco@gmail.com",
    name: "Luciano",
    emailVerified: true,
  });
  assert.equal(admin?.email, "lucianoolivabianco@gmail.com");
});
