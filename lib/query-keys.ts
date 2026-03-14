export const queryKeys = {
  chats: { all: ["chatList"] as const },
  messages: { byChatId: (id: string) => ["messages", id] as const },
  memories: { all: ["memories"] as const },
  settings: { all: ["settings"] as const },
};
