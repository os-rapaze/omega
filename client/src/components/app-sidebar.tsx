import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  Mailbox,
  Kanban,
  LayoutDashboard,
  UsersRound,
  FolderKanban,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [ 
    {
      name: "Ômega Corp.",
      logo: Command,
      plan: "Alternar Workspace",
    },
  ], 
  projects: [
    {
      name: "Painel de Controle",
      url: "/dashboard",
      isCollapsible: false,
      icon: LayoutDashboard,
    },
    {
      name: "Tarefas",
      url: "#",
      isCollapsible: true,
      icon: FolderKanban,
      items: [
        {
          name: "testando",
          url: "/kanban",
          icon: Kanban,
        }
      ],
    },
    {
      name: "Equipes",
      url: "#",
      isCollapsible: false,
      icon: UsersRound,
    },
    {
      name: "Mensagens",
      url: "#",
      isCollapsible: false,
      icon: Mailbox,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects items={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
