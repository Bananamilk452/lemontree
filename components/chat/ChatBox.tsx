import { useMutation, useQuery } from "@tanstack/react-query";
import { SendHorizonalIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { createChat, createMessage, getChatById } from "~/app/actions/chat";
import { Chat, Message } from "~/prisma/generated/client";

import { getQueryClient } from "../Providers";
import { Spinner } from "../Spinner";
import { Textarea } from "../ui/textarea";
import {
  ChatAgentMessage,
  ChatMessageSkeleton,
  ChatUserMessage,
} from "./ChatMessage";

interface ChatBoxProps {
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
}

export function ChatBox({ selectedChat, setSelectedChat }: ChatBoxProps) {
  const queryClient = getQueryClient();

  const { data: chat, isLoading } = useQuery({
    queryKey: ["chat", selectedChat?.id],
    enabled: !!selectedChat,
    queryFn: async () => getChatById(selectedChat!.id),
  });

  const [input, setInput] = useState("");
  const [addedMessages, setAddedMessages] = useState<Message[]>([]);
  const messages = useMemo(() => {
    if (!chat) return addedMessages;
    return [...chat.messages, ...addedMessages];
  }, [chat, addedMessages]);
  useEffect(() => {
    setAddedMessages([]);
  }, [selectedChat?.id]);

  async function streamMessage(chatId: string, content: string) {
    const id = crypto.randomUUID();
    let chatContent = "";

    const message = {
      id,
      chatId,
      role: "assistant",
      content: chatContent,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setAddedMessages((prev) => [...prev, message]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatId, message: content }),
    });
    const reader = response.body?.getReader();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        const text = new TextDecoder().decode(value);
        if (done) break;

        chatContent += text;

        const newMessage = {
          ...message,
          content: chatContent,
        };

        setAddedMessages((prev) => {
          return [...prev.slice(0, -1), newMessage];
        });
      }
    }
  }

  const { mutate: sendChat } = useMutation({
    mutationFn: async () => {
      if (!selectedChat) {
        const chat = await createChat(input);
        await createMessage(chat.id, { role: "user", content: input });
        streamMessage(chat.id, input);
        setSelectedChat(chat);
      } else {
        await createMessage(selectedChat.id, { role: "user", content: input });
        streamMessage(selectedChat.id, input);
        setAddedMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            chatId: selectedChat.id,
            role: "user",
            content: input,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
    },
    onSuccess: () => {
      setInput("");
      queryClient.invalidateQueries({ queryKey: ["chatList"] });
    },
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 grow flex-col items-start gap-4 overflow-y-auto">
        {messages.map((message) =>
          message.content.length === 0 ? (
            <ChatMessageSkeleton key={message.id} />
          ) : message.role === "assistant" ? (
            <ChatAgentMessage key={message.id} message={message.content} />
          ) : (
            <ChatUserMessage key={message.id} message={message.content} />
          ),
        )}

        {selectedChat === null && (
          <div className="flex size-full items-center justify-center">
            <h2 className="text-gray-500">
              새로운 채팅을 시작하려면 왼쪽에서 채팅을 선택하거나 플러스
              아이콘을 클릭하세요.
            </h2>
          </div>
        )}

        {isLoading && (
          <div className="flex size-full items-center justify-center">
            <Spinner />
          </div>
        )}
      </div>
      <hr className="my-4" />
      <form
        className="flex items-start gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          sendChat();
        }}
      >
        <Textarea
          placeholder="이번 달 내 일기 어때? 등의 질문을 해보세요."
          className="h-24 w-full resize-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          disabled={!input}
          type="submit"
          className="cursor-pointer rounded-full border p-2 disabled:cursor-auto disabled:opacity-50"
        >
          <SendHorizonalIcon className="text-gray-500" />
        </button>
      </form>
    </div>
  );
}
