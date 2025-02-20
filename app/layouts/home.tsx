import { Outlet } from "react-router";
import { AppSidebar } from "~/components/AppSidebar";
import { SidebarProvider } from "~/components/ui/sidebar";

export default function HomeLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
