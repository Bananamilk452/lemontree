import { AppSidebar } from "~/components/sidebar/AppSidebar";
import { SidebarProvider } from "~/components/ui/sidebar";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="mx-auto w-full pb-6 sm:w-3/4 md:w-3/5 xl:w-1/2">
        {children}
      </div>
    </SidebarProvider>
  );
}
