import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ReportsProvider } from "@/context/ReportsContext";
import { SearchProvider } from "@/context/SearchContext";
import { MessagesProvider } from "@/context/MessagesContext";
import { AttendanceProvider } from "@/context/AttendanceContext";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ReportsPage from "@/pages/Reports/ReportsPage";
import ReportFormPage from "@/pages/Reports/ReportFormPage";
import ReportDetailPage from "@/pages/Reports/ReportDetailPage";
import DepartmentPage from "@/pages/DepartmentPage";
import AdminPanel from "@/pages/AdminPanel";
import SearchPage from "@/pages/SearchPage";
import MessagesPage from "@/pages/MessagesPage";
import EventsPage from "@/pages/EventsPage";
import SettingsPage from "@/pages/SettingsPage";
import UserProfilePage from "@/pages/UserProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center text-muted-foreground">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      <p className="text-sm mt-2">Coming soon</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ReportsProvider>
        <SearchProvider>
          <MessagesProvider>
            <AttendanceProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/reports/new" element={<ReportFormPage />} />
                      <Route path="/reports/:id" element={<ReportDetailPage />} />
                      <Route path="/reports/:id/edit" element={<ReportFormPage />} />
                      <Route path="/dept/:deptId" element={<DepartmentPage />} />
                      <Route path="/dept/:deptId/:subId" element={<DepartmentPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/messages" element={<MessagesPage />} />
                      <Route path="/events" element={<EventsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/profile/:userId" element={<UserProfilePage />} />
                      <Route path="/admin" element={<AdminPanel />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </AttendanceProvider>
          </MessagesProvider>
        </SearchProvider>
      </ReportsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
