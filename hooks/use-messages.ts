import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getMessagesAction } from "~/app/actions/chat";
import { queryKeys } from "~/lib/query-keys";

import type { Message, StreamChunk, ToolCallEvent } from "~/lib/types";

export function useMessages(chatId: string) {
  return useQuery({
    queryKey: queryKeys.messages.byChatId(chatId),
    enabled: !!chatId,
    queryFn: async () => {
      const result = await getMessagesAction(chatId);
      if (!result.success) throw new Error(result.error);
      return result.data as Message[];
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      content,
    }: {
      chatId: string;
      content: string;
    }) => {
      const tempUserId = `temp-user-${crypto.randomUUID()}`;
      const tempAssistantId = `temp-assistant-${crypto.randomUUID()}`;
      const now = new Date();

      // Optimistic update: add temp user + streaming assistant messages
      queryClient.setQueryData(
        queryKeys.messages.byChatId(chatId),
        (prev: Message[] | undefined) => [
          ...(prev ?? []),
          {
            id: tempUserId,
            chatId,
            role: "user",
            content,
            createdAt: now,
            updatedAt: now,
          } satisfies Message,
          {
            id: tempAssistantId,
            chatId,
            role: "assistant",
            content: "",
            isStreaming: true,
            createdAt: new Date(now.getTime() + 1),
            updatedAt: new Date(now.getTime() + 1),
          } satisfies Message,
        ],
      );

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          let chunk: StreamChunk;
          try {
            chunk = JSON.parse(jsonStr) as StreamChunk;
          } catch {
            continue;
          }

          if (chunk.type === "message") {
            queryClient.setQueryData(
              queryKeys.messages.byChatId(chatId),
              (prev: Message[] | undefined) =>
                (prev ?? []).map((m) =>
                  m.id === tempAssistantId
                    ? { ...m, content: m.content + chunk.content }
                    : m,
                ),
            );
          } else if (chunk.type === "thinking") {
            queryClient.setQueryData(
              queryKeys.messages.byChatId(chatId),
              (prev: Message[] | undefined) =>
                (prev ?? []).map((m) =>
                  m.id === tempAssistantId
                    ? { ...m, thinking: (m.thinking ?? "") + chunk.content }
                    : m,
                ),
            );
          } else if (chunk.type === "tool_call") {
            queryClient.setQueryData(
              queryKeys.messages.byChatId(chatId),
              (prev: Message[] | undefined) =>
                (prev ?? []).map((m) =>
                  m.id === tempAssistantId
                    ? {
                        ...m,
                        toolCalls: [
                          ...((m.toolCalls as ToolCallEvent[]) ?? []),
                          chunk.toolCall,
                        ],
                      }
                    : m,
                ),
            );
          }
        }
      }

      return { chatId };
    },

    onSuccess: ({ chatId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byChatId(chatId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
    },

    onError: (error, { chatId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byChatId(chatId),
      });
      toast.error("메시지 전송에 실패했습니다.");
      console.error("useSendMessage error:", error);
    },
  });
}
