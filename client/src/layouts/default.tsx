import { Link } from "@heroui/link";
import { SidebarProvider, SidebarTrigger } from "@/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Navbar } from "@/components/navbar";
import { useTheme } from "@heroui/use-theme";
import { ThemeSwitch } from "@/components/theme-switch";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <ThemeSwitch className="invisible"></ThemeSwitch>
      <SidebarProvider>
      <AppSidebar />
        <SidebarTrigger />
        <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
          {children}
        </main> 
    </SidebarProvider> 
    </div>
  );
}
