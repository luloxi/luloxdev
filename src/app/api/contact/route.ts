import { NextResponse } from "next/server";

/**
 * The call-request form was retired: calls are booked on Google Calendar now
 * (see CALL_BOOKING_URL in src/content/site.ts). Stored request data is kept.
 */
const gone = () =>
  NextResponse.json({ ok: false, error: "gone" }, { status: 410, headers: { "Cache-Control": "no-store" } });

export const GET = gone;
export const POST = gone;
