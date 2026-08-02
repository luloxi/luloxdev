import { auth, isAuthConfigured } from "@/lib/auth/server";

function notConfigured() {
  return Response.json(
    { error: "Auth is not configured" },
    { status: 503 },
  );
}

export const GET = isAuthConfigured() && auth
  ? auth.handler().GET
  : async () => notConfigured();

export const POST = isAuthConfigured() && auth
  ? auth.handler().POST
  : async () => notConfigured();
