import { prisma } from "~/utils/db";

import type { Chat, Message } from "~/prisma/generated/client";

export type { Chat, Message };

export const chat = {
  async isOwner(chatId: string, userId: string) {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId,
      },
    });

    return !!chat;
  },

  async createChat(userId: string, title: string) {
    return await prisma.chat.create({
      data: {
        userId,
        title,
      },
    });
  },

  async getChats(userId: string, options: { take: number; skip: number }) {
    const { take, skip } = options;

    const chats = await prisma.chat.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take,
      skip,
    });

    const total = await prisma.chat.count({
      where: {
        userId,
      },
    });

    return {
      chats,
      total,
    };
  },

  async getChatById(chatId: string) {
    return await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        messages: true,
      },
    });
  },

  async createMessage(chatId: string, data: { content: string; role: string }) {
    return await prisma.message.create({
      data: {
        chatId,
        ...data,
      },
    });
  },
};
