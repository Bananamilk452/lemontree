"use client";

import { SendHorizonalIcon } from "lucide-react";
import { useState } from "react";

import { createChat } from "~/app/actions/chat";
import { useSendMessage, useMessages } from "~/hooks/use-messages";
import { Chat } from "~/prisma/generated/client";

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
  const [input, setInput] = useState("");

  const { data: messages = [], isLoading } = useMessages(
    selectedChat?.id ?? "",
  );
  const { mutate: sendMessage, isPending } = useSendMessage();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const content = input;
    setInput("");

    if (!selectedChat) {
      const newChat = await createChat(content.slice(0, 30));
      setSelectedChat(newChat);
      sendMessage({ chatId: newChat.id, content });
    } else {
      sendMessage({ chatId: selectedChat.id, content });
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 grow flex-col items-start gap-4 overflow-y-auto">
        {messages.map((message) =>
          message.content.length === 0 && message.isStreaming ? (
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
      <form className="flex items-start gap-4" onSubmit={handleSubmit}>
        <Textarea
          placeholder="이번 달 내 일기 어때? 등의 질문을 해보세요."
          className="h-24 w-full resize-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          disabled={!input || isPending}
          type="submit"
          className="cursor-pointer rounded-full border p-2 disabled:cursor-auto disabled:opacity-50"
        >
          <SendHorizonalIcon className="text-gray-500" />
        </button>
      </form>
    </div>
  );
}
