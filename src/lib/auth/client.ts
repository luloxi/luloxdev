"use client";

import { createAuthClient } from "better-auth/react";

/** Talks to /api/auth on the current origin (lulox.com.ar, workers.dev, localhost). */
export const authClient = createAuthClient();
