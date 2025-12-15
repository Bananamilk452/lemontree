"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ChatBox } from "~/components/chat/ChatBox";
import { ChatList } from "~/components/chat/ChatList";
import { Header } from "~/components/Header";
import { MainContainer } from "~/components/ui/container";
import { Chat } from "~/prisma/generated/client";

import { getChatById } from "../actions/chat";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const { data } = useQuery({
    queryKey: ["chat", selectedChat?.id],
    enabled: !!selectedChat,
    queryFn: async () => getChatById(selectedChat!.id),
  });

  const chat = selectedChat ? data : null;

  return (
    <>
      <Header>
        <h1 className="text-2xl font-bold">채팅</h1>
      </Header>

      <MainContainer className="flex h-[calc(100vh-84px)] flex-col gap-6">
        <ChatList
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />

        <hr />

        <ChatBox
          chat={chat!}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />
      </MainContainer>
    </>
  );
}
