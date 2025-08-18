"use client";

import { MenuIcon } from "lucide-react";

import { useSidebar } from "~/components/ui/sidebar";

export function Header({ children }: { children: React.ReactNode }) {
  const { toggleSidebar } = useSidebar();

  return (
    <>
      <div className="fixed top-0 left-0 z-50 flex w-full items-center gap-4 bg-white p-6 shadow-md md:left-64">
        <button
          className="hover:bg-sidebar-accent -ml-2 cursor-pointer rounded-md p-2 md:hidden"
          onClick={toggleSidebar}
        >
          <MenuIcon className="size-5" />
        </button>
        {children}
      </div>
      <div className="h-21"></div>
    </>
  );
}
