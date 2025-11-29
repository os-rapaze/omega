import { Outlet, useLoaderData } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { loader } from "./__protected.loader"; // se estiver separado, senão mantenha loader aqui

export { loader };

export default function ProtectedLayout() {
  const user = useLoaderData();

  return (
    <div className="[--header-height:calc(--spacing(14))] h-screen">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />

        <div className="flex flex-1">
          <AppSidebar />

          <SidebarInset>
            {/* Aqui vai o conteúdo da rota filha */}
            <div className="flex flex-1 flex-col gap-4 p-4">
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
