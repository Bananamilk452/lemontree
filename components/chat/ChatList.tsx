"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PlusIcon } from "lucide-react";

import { getChats } from "~/app/actions/chat";
import { PAGE_SIZE } from "~/constants";
import { Chat } from "~/prisma/generated/client";
import { cn } from "~/utils";

import { Spinner } from "../Spinner";

interface ChatListProps {
  selectedChat: Chat | null;

  setSelectedChat: (chat: Chat | null) => void;
}

export function ChatList({ setSelectedChat, selectedChat }: ChatListProps) {
  const { data, status } = useInfiniteQuery({
    queryKey: ["chatList"],
    queryFn: ({ pageParam = 1 }) =>
      getChats({
        page: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const totalPages = Math.ceil(lastPage.total / 10);

      if (lastPageParam >= totalPages) {
        return undefined;
      }

      return lastPageParam + 1;
    },
  });

  const chatList = data?.pages.flatMap((page) => page.chats) ?? [];

  return (
    <div className="flex shrink-0 gap-4 overflow-x-auto">
      {status === "pending" && (
        <div className="flex items-center justify-center">
          <Spinner className="size-8" />
        </div>
      )}
      {chatList.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          onClick={() => setSelectedChat(chat)}
          isSelected={chat.id === selectedChat?.id}
        />
      ))}
      <div
        onClick={() => setSelectedChat(null)}
        className="flex size-[62px] shrink-0 cursor-pointer items-center justify-center rounded-md border p-2 shadow hover:bg-gray-100"
      >
        <PlusIcon className="size-8" />
      </div>
    </div>
  );
}

type ChatItemProps = {
  chat: Chat;
  isSelected: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function ChatItem({ chat, isSelected, ...props }: ChatItemProps) {
  return (
    <div
      className={cn(
        "w-48 shrink-0 cursor-pointer rounded-md border p-3 shadow hover:bg-gray-100",
        isSelected && "border-black bg-gray-200",
      )}
      {...props}
    >
      <h3 className="text-sm font-medium text-ellipsis">{chat.title}</h3>
      <p className="text-xs text-gray-600">
        {format(chat.createdAt, "yyyy-MM-dd HH:mm")}
      </p>
    </div>
  );
}
