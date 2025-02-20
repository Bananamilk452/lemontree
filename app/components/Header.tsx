import { MenuIcon } from "lucide-react";
import { useSidebar } from "./ui/sidebar";

export function Header({ children }: { children: React.ReactNode }) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <div className="flex h-12 items-center gap-2 p-4">
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
