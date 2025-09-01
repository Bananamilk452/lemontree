"use server";

import { headers } from "next/headers";

import { auth } from "~/lib/auth";
import { DiaryService } from "~/lib/services";
import { getValidSession } from "~/utils/action";
import { PermissionError } from "~/utils/error";

export async function removeUser(userId: string, removeData: boolean) {
  const session = await getValidSession();

  if (session.user.role !== "admin") {
    throw new PermissionError("Unauthorized");
  }

  await auth.api.removeUser({ body: { userId }, headers: await headers() });

  // 아마도 onDelete: Cascade 들어가있어서 일기만 다 삭제해도 되지 않을까요..?
  if (removeData) {
    const diaryService = new DiaryService({ userId });
    await diaryService.deleteAllDiaries();
  }
}
