import "server-only";

import { redirect } from "next/navigation";

import { auth } from "~/lib/auth";

import { safeRedirect } from "~/utils/index";

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
