"use server";

import { MemoryService } from "~/lib/services";
import { getValidSession } from "~/utils/action";

export async function updateMemoryById(memoryId: string, content: string) {
  const session = await getValidSession();
  const memoryService = new MemoryService({ userId: session.user.id });

  return await memoryService.updateMemoryById(memoryId, content);
}

export async function deleteMemoryById(memoryId: string) {
  const session = await getValidSession();
  const memoryService = new MemoryService({ userId: session.user.id });

  return await memoryService.deleteMemoryById(memoryId);
}

export async function semanticSearch(
  searchTerm: string,
  options: {
    limit: number;
    page: number;
  },
) {
  const session = await getValidSession();
  const memoryService = new MemoryService({ userId: session.user.id });

  return await memoryService.semanticSearch(searchTerm, options);
}

export async function fullTextSearch(
  searchTerm: string,
  options: {
    limit: number;
    page: number;
  },
) {
  const session = await getValidSession();
  const memoryService = new MemoryService({ userId: session.user.id });

  return await memoryService.fullTextSearch(searchTerm, options);
}
