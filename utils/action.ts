import { headers } from "next/headers";

import "server-only";

import { auth } from "~/lib/auth";
import { PermissionError } from "~/utils/error";

export async function getValidSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new PermissionError("로그인이 필요합니다.");
  }

  return session;
}
