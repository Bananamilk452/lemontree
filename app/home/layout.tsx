import { AppSidebar } from "~/components/AppSidebar";
import { SidebarProvider } from "~/components/ui/sidebar";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      {children}
    </SidebarProvider>
  );
}
