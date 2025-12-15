import { useMutation } from "@tanstack/react-query";
import { SendHorizonalIcon } from "lucide-react";
import { useState } from "react";

import { createChat, createMessage } from "~/app/actions/chat";
import { Chat, Message } from "~/prisma/generated/client";

import { getQueryClient } from "../Providers";
import { Textarea } from "../ui/textarea";
import { ChatMessage } from "./ChatMessage";

export type ChatWithMessages = Chat & { messages: Message[] };

interface ChatBoxProps {
  chat: ChatWithMessages | null;
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
}

export function ChatBox({ chat, selectedChat, setSelectedChat }: ChatBoxProps) {
  const queryClient = getQueryClient();

  const [input, setInput] = useState("");
  const { mutate: sendChat } = useMutation({
    mutationFn: async () => {
      if (!selectedChat) {
        const chat = await createChat(input);
        await createMessage(chat.id, {
          role: "user",
          content: input,
        });
        setSelectedChat(chat);
      } else {
        await createMessage(selectedChat.id, {
          role: "user",
          content: input,
        });
      }
    },
    onSuccess: () => {
      setInput("");
      queryClient.invalidateQueries({ queryKey: ["chatList"] });
    },
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex grow flex-col items-start gap-4">
        {chat?.messages.map((message) => (
          <ChatMessage key={message.id} message={message.content} />
        ))}
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
          className="rounded-full border p-2"
        >
          <SendHorizonalIcon className="text-gray-500" />
        </button>
      </form>
    </div>
  );
}
