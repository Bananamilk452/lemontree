import { chat } from "~/lib/models/chat";
import { PermissionError } from "~/utils/error";

interface ChatServiceDeps {
  userId: string;
}

export class ChatService {
  private userId: string;

  constructor({ userId }: ChatServiceDeps) {
    this.userId = userId;
  }

  private async checkOwnership(chatId: string): Promise<void> {
    const isOwner = await chat.isOwner(chatId, this.userId);
    if (!isOwner) {
      throw new PermissionError();
    }
  }

  async createChat(title: string) {
    return await chat.createChat(this.userId, title);
  }

  async getChats(options: { limit: number; page: number }) {
    const { limit, page } = options;
    const take = limit;
    const skip = (page - 1) * limit;

    const data = await chat.getChats(this.userId, { take, skip });

    if (!data) {
      return { chats: [], total: 0 };
    }

    return data;
  }

  async getChatById(chatId: string) {
    await this.checkOwnership(chatId);
    return await chat.getChatById(chatId);
  }

  async createMessage(chatId: string, data: { content: string; role: string }) {
    await this.checkOwnership(chatId);
    return await chat.createMessage(chatId, data);
  }
}
