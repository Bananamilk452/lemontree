import { headers } from "next/headers";

import "server-only";

import { auth } from "~/lib/auth";

export async function getValidSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("세션이 존재하지 않습니다.");
  }

  return session;
}
