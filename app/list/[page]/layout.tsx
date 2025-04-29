import { AppSidebar } from "~/components/AppSidebar";
import { SidebarProvider } from "~/components/ui/sidebar";

export default function ListLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full sm:w-3/4 md:w-3/5 xl:w-1/2 mx-auto pb-6">
        {children}
      </div>
    </SidebarProvider>
  );
}
