"use client";

import { useState } from "react";

import { ChatBox } from "~/components/chat/ChatBox";
import { ChatList } from "~/components/chat/ChatList";
import { Header } from "~/components/Header";
import { MainContainer } from "~/components/ui/container";
import { Chat } from "~/prisma/generated/client";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

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
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />
      </MainContainer>
    </>
  );
}
