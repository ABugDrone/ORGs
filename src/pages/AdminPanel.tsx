import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Building2, Settings as SettingsIcon, Download, Upload, AlertTriangle } from "lucide-react";
import DepartmentsTab from "@/components/admin/DepartmentsTab";
import UsersTab from "@/components/admin/UsersTab";
import SystemTab from "@/components/admin/SystemTab";
import AttendanceTab from "@/components/admin/AttendanceTab";
import AttendanceApprovalTab from "@/components/admin/AttendanceApprovalTab";

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Access denied. Super Admin privileges required.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h2 className="font-heading text-2xl font-bold text-foreground">Super Admin Panel</h2>
        </div>
        <p className="text-muted-foreground">
          Manage users, departments, and system settings
        </p>
      </div>

      <Tabs defaultValue="attendance-approval" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="attendance-approval" className="gap-2">
            <Shield className="h-4 w-4" />
            Approvals
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <Users className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <Building2 className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance-approval">
          <AttendanceApprovalTab />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTab />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentsTab />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        <TabsContent value="system">
          <SystemTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
