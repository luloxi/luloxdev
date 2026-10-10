import { getAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const auth = await getAuth();
  if (!auth) {
    return Response.json({ error: "Auth is not configured" }, { status: 503 });
  }
  return auth.handler(request);
}

export const GET = handle;
export const POST = handle;
