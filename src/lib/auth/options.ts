import type { BetterAuthOptions } from "better-auth";
import { isAdminUser } from "./admin";

export type AuthEnv = {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

export const ALLOWED_HOSTS = [
  "www.lulox.dev",
  "lulox.dev",
  "luloxdev.lucianoolivabianco.workers.dev",
  "localhost:*",
];

/** Origins that may start / finish the Google sign-in flow. */
export const TRUSTED_ORIGINS = [
  "https://www.lulox.dev",
  "https://lulox.dev",
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
      fallback: "https://www.lulox.dev",
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
    databaseHooks: {
      user: {
        create: {
          // Only allowlisted admins can ever get an account (no open sign-up).
          before: async (user) => (isAdminUser(user) ? { data: user } : false),
        },
      },
    },
    telemetry: { enabled: false },
  };
}
