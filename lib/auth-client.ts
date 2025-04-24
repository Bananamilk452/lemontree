import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL,
});

export type Session = typeof authClient.$Infer.Session;
