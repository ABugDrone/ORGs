import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import { SignInDialog } from "@/components/attendance/SignInDialog";
import { SignOutDialog } from "@/components/attendance/SignOutDialog";
import { OvertimeTimer } from "@/components/attendance/OvertimeTimer";

const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Attendance Components */}
      <SignInDialog />
      <SignOutDialog />
      <OvertimeTimer />
    </SidebarProvider>
  );
};

export default AppLayout;
