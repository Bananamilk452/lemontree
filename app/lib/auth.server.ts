import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./utils/db.server";
import { safeRedirect } from "./utils";
import { redirect } from "react-router";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
});

export async function redirectIfAuthenticated(
  request: Request,
  defaultRedirect: string = "/",
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session) {
    const redirectTo = new URL(request.url).searchParams.get("redirectTo");
    return redirectTo
      ? redirect(safeRedirect(redirectTo))
      : redirect(defaultRedirect);
  }

  return null; // 인증되지 않은 경우 null 반환
}
