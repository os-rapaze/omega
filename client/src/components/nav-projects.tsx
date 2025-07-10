import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate, Link } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavProjects({
  items,
}: {
  items: {
    name: string
    isCollapsible: boolean
    url: string
    icon: LucideIcon
  }[]
}) {
  const navigate = useNavigate();
  const { isMobile } = useSidebar() 

  return (
<SidebarGroup className="group-data-[collapsible=icon]:hidden">
  <SidebarMenu>
    {items.map((item) =>
      item.isCollapsible ? (
        <Collapsible
          key={item.name}
          asChild
          defaultOpen={item.isActive}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.name}>
                {item.icon && <item.icon />}
                <span>{item.name}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.name}>
                    <SidebarMenuSubButton asChild>
                      <Link to={subItem.url}>
                        <span>{subItem.name}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      ) : (
        <SidebarMenuItem key={item.name}>
          <SidebarMenuButton asChild>
            <Link to={item.url}>
              <item.icon />
              <span>{item.name}</span>
            </Link>  
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    )}
  </SidebarMenu>
</SidebarGroup>
  )
}
