"use client";

import { MenuIcon } from "lucide-react";

import { useSidebar } from "~/components/ui/sidebar";

export function Header({ children }: { children: React.ReactNode }) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <div className="flex items-center gap-4 p-6 h-21">
      {!open && (
        <button
          className="hover:bg-sidebar-accent -ml-2 cursor-pointer rounded-md p-2"
          onClick={toggleSidebar}
        >
          <MenuIcon className="size-5" />
        </button>
      )}
      {children}
    </div>
  );
}
