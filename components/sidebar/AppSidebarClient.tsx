"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChevronUpIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LockIcon,
  LogOutIcon,
  MemoryStickIcon,
  MessageCircleMoreIcon,
  NotebookIcon,
  PencilLineIcon,
  SearchIcon,
  SquarePenIcon,
  TableOfContentsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { authClient, Session } from "~/lib/auth-client";

import { ChangeNameModal } from "./ChangeNameModal";
import { ChangePasswordModal } from "./ChangePasswordModal";

interface AppSidebarClientProps {
  initialSession: Session | null;
}

export function AppSidebarClient({ initialSession }: AppSidebarClientProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeNameOpen, setIsChangeNameOpen] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const result = await authClient.getSession();
      return result.data;
    },
    initialData: initialSession,
  });
  const router = useRouter();

  function handleSignOut() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  }

  return (
    <>
      {session && (
        <>
          <Sidebar>
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div className="flex items-center gap-4">
                    <h1 className="flex items-center gap-1 text-xl font-bold">
                      🍋 레몬트리
                    </h1>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                      <Link href="/home">
                        <HomeIcon />
                        <span>홈</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                      <Link href="/chat">
                        <MessageCircleMoreIcon />
                        <span>채팅</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>
                  <NotebookIcon className="mr-1.5" />
                  일기
                </SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                      <Link href="/new">
                        <PencilLineIcon />
                        <span>일기 쓰기</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                      <Link href="/diary/list/1">
                        <TableOfContentsIcon />
                        <span>일기 목록</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                      <Link href="/diary/search">
                        <SearchIcon />
                        <span>일기 검색</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>
                  <MemoryStickIcon className="mr-1.5" />
                  메모리
                </SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                      <Link href="/memory/list/1">
                        <TableOfContentsIcon />
                        <span>메모리 목록</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                      <Link href="/memory/search">
                        <SearchIcon />
                        <span>메모리 검색</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>

              {session.user.role === "admin" && (
                <SidebarGroup>
                  <SidebarGroupLabel>
                    <LayoutDashboardIcon className="mr-1.5" />
                    대시보드
                  </SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton size="lg" asChild>
                        <Link href="/dashboard/users">
                          <UsersIcon />
                          <span>사용자 목록</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              )}
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton size="lg">
                        <UserIcon />
                        <span>{session.user.name} 님</span>
                        <ChevronUpIcon className="ml-auto" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      className="w-[--radix-popper-anchor-width]"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={handleSignOut}
                      >
                        <LogOutIcon />
                        <span>로그아웃</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setIsChangePasswordOpen(true)}
                      >
                        <LockIcon />
                        <span>비밀번호 변경</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setIsChangeNameOpen(true)}
                      >
                        <SquarePenIcon />
                        <span>이름 변경</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        </>
      )}

      <ChangePasswordModal
        open={isChangePasswordOpen}
        setOpen={setIsChangePasswordOpen}
      />
      <ChangeNameModal open={isChangeNameOpen} setOpen={setIsChangeNameOpen} />
    </>
  );
}
