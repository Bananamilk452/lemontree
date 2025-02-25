import {
  ChevronUpIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  PencilLineIcon,
  TableOfContentsIcon,
  UserIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

import { authClient } from "~/lib/auth";
import { useUserData } from "~/lib/utils";

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

export function AppSidebar() {
  const { user } = useUserData();
  const { toggleSidebar } = useSidebar();

  const navigate = useNavigate();
  function handleSignOut() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/sign-in");
        },
      },
    });
  }

  return (
    <>
      {user && (
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div className="flex items-center gap-2">
                    <button
                      className="hover:bg-sidebar-accent cursor-pointer rounded-md"
                      onClick={toggleSidebar}
                    >
                      <MenuIcon className="size-5" />
                    </button>
                    <h1 className="flex items-center gap-1 text-lg font-bold">
                      <span className="text-xl">🍋</span> 레몬트리
                    </h1>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/">
                      <HomeIcon />
                      <span>홈</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/new">
                      <PencilLineIcon />
                      <span>일기 쓰기</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/list">
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
                    <SidebarMenuButton>
                      <UserIcon />
                      <span>{user.name} 님</span>
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
