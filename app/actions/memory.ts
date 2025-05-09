"use server";

import { revalidatePath } from "next/cache";

import { memory } from "~/lib/models/memory";
import { getValidSession } from "~/utils/action";

async function checkMemoryOwner(memoryId: string, userId: string) {
  const m = await memory.isOwner(memoryId, userId);
  if (!m) {
    throw new Error("이 메모리에 대한 권한이 없습니다.");
  }
}

export async function updateMemoryById(memoryId: string, content: string) {
  const session = await getValidSession();
  await checkMemoryOwner(memoryId, session.user.id);

  const updatedMemory = await memory.updateMemoryById(
    memoryId,
    session.user.id,
    content,
  );

  if (!updatedMemory) {
    throw new Error("메모리 업데이트에 실패했습니다.");
  }

  revalidatePath("/home");
  revalidatePath("/new");
  revalidatePath("/list/[page]", "page");

  return updatedMemory;
}

export async function deleteMemoryById(memoryId: string) {
  const session = await getValidSession();
  await checkMemoryOwner(memoryId, session.user.id);

  await memory.deleteMemoryById(memoryId, session.user.id);

  revalidatePath("/home");
  revalidatePath("/new");
  revalidatePath("/list/[page]", "page");
}
