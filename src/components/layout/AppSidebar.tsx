import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Building2, 
  MapPin, 
  Briefcase,
  FileText,
  MessageSquare,
  UserCircle,
  List
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Eventos", url: "/eventos", icon: Calendar },
];

const cadastrosItems = [
  { title: "Pessoas", url: "/pessoas", icon: Users },
  { title: "Cargos e Ministérios", url: "/cargos", icon: Briefcase },
  { title: "Congregações", url: "/congregacoes" },
  { title: "Cidades", url: "/cidades", icon: MapPin },
  { title: "Usuários", url: "/usuarios", icon: UserCircle },
];

const outrosItems = [
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Contato", url: "/contato", icon: MessageSquare },
];

const marcacoesItems = [
  { title: "Marcação de Coletas", url: "/marcacao-coletas", icon: FileText },
  { title: "Marcação de Serviços", url: "/marcacao-servicos", icon: Calendar },
  { title: "Marcação de RJM", url: "/marcacao-rjm", icon: Users },
  { title: "Histórico de Marcações", url: "/marcacoes", icon: List },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="pt-6">
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-sidebar-primary" />
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-sidebar-foreground">Agendar</h2>
                <p className="text-xs text-sidebar-foreground/70">Sistema de Eventos</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Cadastros</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {cadastrosItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Outros</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {outrosItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Marcações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {marcacoesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
