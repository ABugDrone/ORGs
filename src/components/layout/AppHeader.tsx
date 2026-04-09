import React from "react";
import { useMessages } from "@/context/MessagesContext";
import { useLocation, Link } from "react-router-dom";
import LiveClock from "@/components/LiveClock";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, MessageSquare, Bell } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/files": "Files",
  "/upload": "Upload",
  "/search": "Search",
  "/messages": "Notes",
  "/events": "Reminders",
  "/settings": "Settings",
};

const AppHeader: React.FC = () => {
  const { unreadCount } = useMessages();
  const location = useLocation();
  const pathBase = "/" + (location.pathname.split("/")[1] || "");
  const pageTitle = pageTitles[pathBase] || "ORGs";

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="font-heading text-lg font-semibold text-foreground leading-tight">{pageTitle}</h1>
      </div>

      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <SearchBar />
      </div>

      <div className="flex items-center gap-2">
        <LiveClock compact />

        <Button variant="ghost" size="icon" className="relative text-muted-foreground" asChild>
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

        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
          <Link to="/settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;
