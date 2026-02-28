import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation, Link } from "react-router-dom";
import { departments, getDepartment } from "@/data/mockData";
import { NavLink } from "@/components/NavLink";
import {
  Home, FileText, Search, MessageSquare, CalendarDays, Settings, Shield,
  ChevronDown, ChevronRight, FolderTree,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainNav = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Search", url: "/search", icon: Search },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Events", url: "/events", icon: CalendarDays },
  { title: "Settings", url: "/settings", icon: Settings },
];

const AppSidebar: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const visibleDepartments = isSuperAdmin
    ? departments
    : departments.filter((d) => d.id === user?.departmentId);

  return (
    <Sidebar className="border-r-0">
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-sm">C</span>
            </div>
            <span className="font-heading font-bold text-lg text-sidebar-foreground">
              Casi<span className="text-primary">360</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-heading font-bold text-sm">C</span>
          </div>
        )}
      </div>

      <SidebarContent className="scrollbar-thin">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-widest">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-200"
                      activeClassName="bg-sidebar-accent text-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Department tree */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-widest">
              Departments
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-1 px-2">
                {visibleDepartments.map((dept) => (
                  <DeptTree key={dept.id} dept={dept} currentPath={location.pathname} />
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin panel link */}
        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-200"
                      activeClassName="bg-primary/20 text-primary font-semibold"
                    >
                      <Shield className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">Admin Panel</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

const DeptTree: React.FC<{ dept: typeof departments[0]; currentPath: string }> = ({ dept, currentPath }) => {
  const isActive = currentPath.includes(`/dept/${dept.id}`);

  return (
    <Collapsible defaultOpen={isActive}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors group">
        <FolderTree className="h-3.5 w-3.5 text-sidebar-foreground/60" />
        <span className="flex-1 text-left text-xs font-medium">{dept.name}</span>
        <ChevronRight className="h-3 w-3 text-sidebar-foreground/40 transition-transform group-data-[state=open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-5 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
          {dept.subdepartments.map((sub) => (
            <NavLink
              key={sub.id}
              to={`/dept/${dept.id}/${sub.id}`}
              className="block px-2 py-1 rounded text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              activeClassName="text-primary font-medium"
            >
              {sub.name}
            </NavLink>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AppSidebar;
