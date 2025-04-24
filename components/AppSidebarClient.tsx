"use client";

import {
  ChevronUpIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  PencilLineIcon,
  TableOfContentsIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { authClient, Session } from "~/lib/auth-client";

interface AppSidebarClientProps {
  initialSession: Session | null;
}

export function AppSidebarClient({ initialSession }: AppSidebarClientProps) {
  const { data } = authClient.useSession();
  const { toggleSidebar } = useSidebar();
  const router = useRouter();

  const session = initialSession || data;

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
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-4">
                  <button
                    className="hover:bg-sidebar-accent cursor-pointer rounded-md p-2 -ml-2"
                    onClick={toggleSidebar}
                  >
                    <MenuIcon className="size-5" />
                  </button>
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
                    <Link href="/new">
                      <PencilLineIcon />
                      <span>일기 쓰기</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" asChild>
                    <Link href="/list">
                      <TableOfContentsIcon />
                      <span>일기 목록</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup />
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      )}
    </>
  );
}
