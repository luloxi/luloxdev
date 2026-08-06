import { NextResponse } from "next/server";
import type { PastProjectId, ProjectStatus } from "@/content/projects";
import {
  getMergedPastProjects,
  requireAdminSession,
  upsertProjectOverride,
} from "@/lib/projects";

export const dynamic = "force-dynamic";

const VALID_IDS: PastProjectId[] = ["mochi", "sami", "punksociety"];
const VALID_STATUSES: ProjectStatus[] = ["live", "disabled", "archive"];

export async function GET() {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.reason }, { status: 401 });
  }
  const projects = await getMergedPastProjects();
  return NextResponse.json({ projects });
}

export async function PUT(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.reason }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const data = body as {
    id?: string;
    status?: string;
    disabledReason?: { es?: string; en?: string };
    liveUrl?: string;
  };

  if (!data?.id || !VALID_IDS.includes(data.id as PastProjectId)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  if (!data.status || !VALID_STATUSES.includes(data.status as ProjectStatus)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  await upsertProjectOverride({
    id: data.id as PastProjectId,
    status: data.status as ProjectStatus,
    disabledReason: {
      es: data.disabledReason?.es ?? "",
      en: data.disabledReason?.en ?? "",
    },
    liveUrl: data.liveUrl ?? "",
  });

  const projects = await getMergedPastProjects();
  return NextResponse.json({ ok: true, projects });
}
