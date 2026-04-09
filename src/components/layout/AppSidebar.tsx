import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Home, Search, MessageSquare, Bell, Settings, FolderOpen, Upload, Moon, Sun } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { applyTheme, ThemeId, THEMES } from "@/lib/themes/themeEngine";

const mainNav = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Files", url: "/files", icon: FolderOpen },
  { title: "Upload", url: "/upload", icon: Upload },
  { title: "Search", url: "/search", icon: Search },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Reminders", url: "/events", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  // Dark mode toggle — preserves the user's active theme family
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    const currentTheme = (localStorage.getItem('orgs_theme') as ThemeId) || 'default';
    const accent = localStorage.getItem('orgs_accent') || '#10b981';
    const isDark = document.documentElement.classList.contains('dark');
    const currentDef = THEMES.find(t => t.id === currentTheme);

    let newTheme: ThemeId;
    if (isDark) {
      // Switching to light: map dark themes to their light counterpart
      const lightCounterparts: Partial<Record<ThemeId, ThemeId>> = {
        dark: 'default',
        vista: 'win11',
        neon: 'default',
        glass: 'default',
      };
      newTheme = lightCounterparts[currentTheme] ?? (currentDef?.dark ? 'default' : currentTheme as ThemeId);
    } else {
      // Switching to dark: map light themes to their dark counterpart
      const darkCounterparts: Partial<Record<ThemeId, ThemeId>> = {
        default: 'dark',
        win11: 'dark',
        macos: 'dark',
        win7: 'dark',
        winxp: 'dark',
        win95: 'dark',
      };
      newTheme = darkCounterparts[currentTheme] ?? 'dark';
    }

    applyTheme(newTheme, accent);
    setDark(!isDark);
  };

  return (
    <Sidebar className="border-r-0">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src="/ORGs.png" alt="ORGs" className="h-8 w-8 rounded-lg object-cover shrink-0" />
            <div className="leading-tight min-w-0">
              <span className="font-heading font-bold text-base text-sidebar-foreground">ORGs</span>
              <p className="text-[9px] text-sidebar-foreground/50 leading-none truncate">Org. Reports Gathering</p>
            </div>
          </div>
        )}
        {collapsed && (
          <img src="/ORGs.png" alt="ORGs" className="h-8 w-8 rounded-lg object-cover mx-auto" />
        )}
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground"
          onClick={() => toggleDark()}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}        </Button>
      </div>

      <SidebarContent className="scrollbar-thin">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-widest">
            Navigation
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
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
