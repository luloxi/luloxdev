import { betterAuth } from "better-auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@/lib/db";
import { buildAuthOptions, type AuthEnv } from "@/lib/auth/options";

type Auth = ReturnType<typeof betterAuth>;
type WorkerEnv = AuthEnv & { DB?: D1Database };

let cached: { db: D1Database; auth: Auth } | null = null;

async function getEnv(): Promise<WorkerEnv | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as unknown as WorkerEnv;
  } catch {
    return null;
  }
}

function configured(env: WorkerEnv | null): env is WorkerEnv & { DB: D1Database } {
  return Boolean(
    env?.DB &&
      env.BETTER_AUTH_SECRET &&
      env.GOOGLE_CLIENT_ID &&
      env.GOOGLE_CLIENT_SECRET,
  );
}

/**
 * Better Auth on Cloudflare D1 + Google. Bindings only exist inside a request,
 * so the instance is built lazily (and reused while the D1 binding is the same).
 * Returns null when secrets are missing, so routes can answer "not configured".
 */
export async function getAuth(): Promise<Auth | null> {
  const env = await getEnv();
  if (!configured(env)) return null;
  if (cached && cached.db === env.DB) return cached.auth;
  const auth = betterAuth(buildAuthOptions(env.DB as never, env));
  cached = { db: env.DB, auth };
  return auth;
}

export async function isAuthConfigured() {
  return configured(await getEnv());
}
