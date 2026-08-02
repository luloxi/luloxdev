/**
 * Only these identities can edit the blog.
 * Neon Auth currently supports Google (and GitHub / Vercel), not X.
 * Google: lucianoolivabianco@gmail.com
 */
export const ADMIN_EMAILS = ["lucianoolivabianco@gmail.com"] as const;

export type AuthUser = {
  email?: string | null;
  name?: string | null;
};

export function isAdminUser(user: AuthUser | null | undefined): boolean {
  if (!user?.email) return false;
  const email = user.email.trim().toLowerCase();
  return (ADMIN_EMAILS as readonly string[]).includes(email);
}
