"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PlusIcon } from "lucide-react";
import { useEffect } from "react";
import { useIntersectionObserver } from "usehooks-ts";

import { getChats } from "~/app/actions/chat";
import { PAGE_SIZE } from "~/constants";
import { Chat } from "~/prisma/generated/client";
import { cn } from "~/utils";

import { Skeleton } from "../ui/skeleton";

interface ChatListProps {
  selectedChat: Chat | null;

  setSelectedChat: (chat: Chat | null) => void;
}

export function ChatList({ setSelectedChat, selectedChat }: ChatListProps) {
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.5,
  });

  const { data, status, fetchNextPage } = useInfiniteQuery({
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

  useEffect(() => {
    if (isIntersecting) {
      fetchNextPage();
    }
  }, [isIntersecting, fetchNextPage]);

  const chatList = data?.pages.flatMap((page) => page.chats) ?? [];

  return (
    <div className="flex shrink-0 gap-4 overflow-x-auto py-4">
      <div
        onClick={() => setSelectedChat(null)}
        className="flex size-[62px] shrink-0 cursor-pointer items-center justify-center rounded-md border p-2 shadow hover:bg-gray-100"
      >
        <PlusIcon className="size-8" />
      </div>
      {status === "pending" &&
        Array.from({ length: 3 }).map((_, index) => (
          <ChatItemSkeleton key={index} />
        ))}
      {chatList.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          onClick={() => setSelectedChat(chat)}
          isSelected={chat.id === selectedChat?.id}
        />
      ))}
      <div className="w-2 shrink-0" ref={ref} />
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
      <h3 className="line-clamp-1 overflow-hidden text-sm font-medium text-ellipsis">
        {chat.title}
      </h3>
      <p className="text-xs text-gray-600">
        {format(chat.createdAt, "yyyy-MM-dd HH:mm")}
      </p>
    </div>
  );
}

export function ChatItemSkeleton() {
  return (
    <div className="w-48 shrink-0 cursor-pointer rounded-md border p-3 shadow hover:bg-gray-100">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
