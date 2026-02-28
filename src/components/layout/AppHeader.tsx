import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/context/MessagesContext";
import { useLocation, useNavigate, Link } from "react-router-dom";
import LiveClock from "@/components/LiveClock";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Bell, MessageSquare } from "lucide-react";
import { getDepartment } from "@/data/mockData";
import { SearchBar } from "@/components/search/SearchBar";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/reports": "Reports",
  "/search": "Search",
  "/messages": "Messages",
  "/events": "Events",
  "/settings": "Settings",
  "/admin": "Admin Panel",
};

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useMessages();
  const location = useLocation();
  const navigate = useNavigate();

  const pathBase = "/" + (location.pathname.split("/")[1] || "");
  const pageTitle = pageTitles[pathBase] || "Casi360";
  const dept = user ? getDepartment(user.departmentId) : null;

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div>
          <h1 className="font-heading text-lg font-semibold text-foreground leading-tight">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <SearchBar />
      </div>

      <div className="flex items-center gap-2">
        <LiveClock compact />

        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-muted-foreground"
          asChild
        >
          <Link to="/messages">
            <MessageSquare className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Link>
        </Button>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg hover:bg-muted transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground leading-tight">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{user?.jobTitle}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              {dept && (
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    backgroundColor: `hsl(${dept.color} / 0.15)`,
                    color: `hsl(${dept.color})`,
                  }}
                >
                  {dept.name}
                </span>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2" asChild>
              <Link to="/settings">
                <User className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive" onClick={logout}>
              <LogOut className="h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
