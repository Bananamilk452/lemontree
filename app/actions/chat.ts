"use server";

import { ChatService } from "~/lib/services";
import { getValidSession } from "~/utils/action";

export async function createChat(title: string) {
  const session = await getValidSession();
  const chatService = new ChatService({ userId: session.user.id });

  return await chatService.createChat(title);
}

export async function getChats(
  options: Parameters<typeof ChatService.prototype.getChats>[0],
) {
  const session = await getValidSession();
  const chatService = new ChatService({ userId: session.user.id });

  return await chatService.getChats(options);
}

export async function getChatById(chatId: string) {
  const session = await getValidSession();
  const chatService = new ChatService({ userId: session.user.id });

  return await chatService.getChatById(chatId);
}

export async function createMessage(
  chatId: string,
  data: { content: string; role: string },
) {
  const session = await getValidSession();
  const chatService = new ChatService({ userId: session.user.id });

  return await chatService.createMessage(chatId, data);
}
