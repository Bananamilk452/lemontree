import { headers } from "next/headers";

import { auth } from "~/lib/auth";

import { AppSidebarClient } from "./AppSidebarClient";

export async function AppSidebar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // 초기 UI 렌더링 (서버에서)
  return <AppSidebarClient initialSession={session} />;
}
