"use client";

import { createAuthClient } from "better-auth/react";

/** Talks to /api/auth on the current origin (www.lulox.dev, workers.dev, localhost). */
export const authClient = createAuthClient();
