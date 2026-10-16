import type { BetterAuthOptions } from "better-auth";

export type AuthEnv = {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

export const ALLOWED_HOSTS = [
  "lulox.com.ar",
  "www.lulox.com.ar",
  "luloxdev.lucianoolivabianco.workers.dev",
  "localhost:*",
];

/** Origins that may start / finish the Google sign-in flow. */
export const TRUSTED_ORIGINS = [
  "https://lulox.com.ar",
  "https://www.lulox.com.ar",
  "https://luloxdev.lucianoolivabianco.workers.dev",
  "http://localhost:3000",
  "http://localhost:8787",
];

/**
 * Better Auth config shared by the Worker runtime and the schema generator
 * (scripts/generate-auth-migration.mts). `database` is the D1 binding at
 * runtime, a local SQLite handle when generating SQL.
 */
export function buildAuthOptions(
  database: BetterAuthOptions["database"],
  env: AuthEnv,
): BetterAuthOptions {
  return {
    appName: "lulox.dev",
    database,
    secret: env.BETTER_AUTH_SECRET,
    // One Worker answers on several hosts (www, apex, workers.dev, localhost),
    // so the base URL follows the request host but only for these hosts.
    baseURL: env.BETTER_AUTH_URL || {
      allowedHosts: ALLOWED_HOSTS,
      fallback: "https://lulox.com.ar",
    },
    trustedOrigins: TRUSTED_ORIGINS,
    emailAndPassword: { enabled: false },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
        prompt: "select_account",
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    advanced: {
      // Lax so the Google redirect back to the app keeps the session cookie.
      defaultCookieAttributes: { sameSite: "lax" },
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
    },
    // Public visitors may sign in with Google (contact form email autofill).
    // That grants nothing: every admin API checks requireAdminSession(), which
    // enforces the ADMIN_EMAILS allowlist (isAdminUser) on each request.
    // Google scopes are Better Auth defaults only: openid, email, profile.
    telemetry: { enabled: false },
  };
}
