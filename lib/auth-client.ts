import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL,
  plugins: [adminClient()],
});

export type Session = typeof authClient.$Infer.Session;
