import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import { api } from "~/lib/api";

import { NavMain } from "~/components/nav-main";
// import { NavProjects } from "~/components/nav-projects";
import { NavSecondary } from "~/components/nav-secondary";
import { NavUser } from "~/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  items?: { title: string; url: string }[];
};

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [navMain, setNavMain] = React.useState<NavItem[]>([]);

  React.useEffect(() => {
    async function loadProjects() {
      try {
        // GET /projetos -> usa a instância api com baseURL + cookies + Authorization
        const res = await api.get("/projetos");
        const projetos = res.data as { _id: string; name: string }[];

        const projectItems: NavItem[] = projetos.map((projeto) => {
          const basePath = `/app/${projeto._id}`; // ajuste se sua rota for diferente

          return {
            title: projeto.name,
            url: basePath,
            icon: Frame,
            items: [
              {
                title: "Tarefas",
                url: `${basePath}/tasks`,
              },
              {
                title: "Times",
                url: `${basePath}/teams`,
              },
              {
                title: "Configurações",
                url: `${basePath}/settings`,
              },
            ],
          };
        });

        setNavMain([...projectItems]);
      } catch (error) {
        console.error("Erro ao carregar projetos:", error);

        setNavMain([
          {
            title: "Playground",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
              {
                title: "History",
                url: "#",
              },
              {
                title: "Starred",
                url: "#",
              },
              {
                title: "Settings",
                url: "#",
              },
            ],
          },
        ]);
      }
    }

    loadProjects();
  }, []);

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* agora vem do backend */}
        <NavMain items={navMain} />

        {/* se quiser manter uma seção de projetos separada, dá pra montar com os mesmos dados acima */}
        {/* <NavProjects projects={...} /> */}

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
