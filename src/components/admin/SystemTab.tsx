import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, Upload, AlertTriangle, Database, FileJson } from "lucide-react";
import { departments, users } from "@/data/mockData";
import { toast } from "sonner";

const SystemTab: React.FC = () => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExportSettings = () => {
    try {
      // Get all data from localStorage
      const reports = localStorage.getItem("casi360_reports");
      
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        departments,
        users,
        reports: reports ? JSON.parse(reports) : [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `casi360-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Settings exported successfully");
    } catch (error) {
      toast.error("Failed to export settings");
      console.error(error);
    }
  };

  const handleImportSettings = () => {
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        // Validate the import data structure
        if (!importData.version || !importData.departments || !importData.users) {
          toast.error("Invalid backup file format");
          return;
        }

        // Restore data to localStorage
        if (importData.reports) {
          localStorage.setItem("casi360_reports", JSON.stringify(importData.reports));
        }

        toast.success("Settings imported successfully. Please refresh the page.");
        setShowImportDialog(false);
        setImportFile(null);
      } catch (error) {
        toast.error("Failed to import settings. Invalid file format.");
        console.error(error);
      }
    };
    reader.readAsText(importFile);
  };

  const handleResetApp = () => {
    try {
      // Clear all localStorage data
      localStorage.clear();
      
      toast.success("App reset to default. Please refresh the page.");
      setShowResetDialog(false);
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error("Failed to reset app");
      console.error(error);
    }
  };

  const getSystemStats = () => {
    const reports = localStorage.getItem("casi360_reports");
    const reportCount = reports ? JSON.parse(reports).length : 0;
    
    return {
      departments: departments.length,
      subdepartments: departments.reduce((acc, d) => acc + d.subdepartments.length, 0),
      users: users.length,
      reports: reportCount,
    };
  };

  const stats = getSystemStats();

  return (
    <div className="space-y-6">
      {/* System Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Current system statistics and information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{stats.departments}</div>
              <div className="text-sm text-muted-foreground">Departments</div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{stats.subdepartments}</div>
              <div className="text-sm text-muted-foreground">Subdepartments</div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{stats.users}</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{stats.reports}</div>
              <div className="text-sm text-muted-foreground">Reports</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>
            Export and import organizational settings for disaster recovery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg border">
            <Database className="h-5 w-5 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Export Settings</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Download a backup file containing all departments, users, and reports
              </p>
              <Button onClick={handleExportSettings} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg border">
            <FileJson className="h-5 w-5 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Import Settings</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Restore organizational settings from a backup file
              </p>
              <Button onClick={() => setShowImportDialog(true)} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that will affect the entire system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4 p-4 rounded-lg border border-destructive/50 bg-destructive/5">
            <AlertTriangle className="h-5 w-5 text-destructive mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Reset Application</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Clear all data and reset the application to default settings. This action cannot be undone.
              </p>
              <Button
                onClick={() => setShowResetDialog(true)}
                variant="destructive"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reset App to Default
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Settings Dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Select a backup file to restore organizational settings. This will overwrite current data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="import-file">Backup File (JSON)</Label>
            <Input
              id="import-file"
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setImportFile(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleImportSettings}>
              Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all data including departments, users, and reports.
              This action cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetApp}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset App
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SystemTab;
