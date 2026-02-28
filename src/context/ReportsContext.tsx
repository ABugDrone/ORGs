import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Report, CreateReportInput, UpdateReportInput, Period } from "@/types/reports";
import { mockReportsApi } from "@/lib/reports/mockReportsApi";
import { useAuth } from "@/context/AuthContext";

interface ReportsContextState {
  reports: Report[];
  loading: boolean;
  error: string | null;
}

interface ReportsContextMethods {
  createReport: (data: CreateReportInput) => Promise<Report>;
  updateReport: (id: string, data: UpdateReportInput) => Promise<Report>;
  deleteReport: (id: string) => Promise<void>;
  approveReport: (id: string) => Promise<Report>;
  rejectReport: (id: string, reason: string) => Promise<Report>;
  getReport: (id: string) => Report | undefined;
  getReportsByPeriod: (period: Period) => Report[];
  getReportsByTag: (tag: string) => Report[];
  refreshReports: () => Promise<void>;
}

type ReportsContextType = ReportsContextState & ReportsContextMethods;

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedReports = await mockReportsApi.getReports();
      setReports(fetchedReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mockReportsApi.loadFromStorage();
    refreshReports();
  }, [refreshReports]);

  const createReport = useCallback(async (data: CreateReportInput): Promise<Report> => {
    if (!user) throw new Error("User not authenticated");
    setLoading(true);
    setError(null);
    try {
      const newReport = await mockReportsApi.createReport(data, user);
      setReports(prev => [...prev, newReport]);
      return newReport;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create report";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateReport = useCallback(async (id: string, data: UpdateReportInput): Promise<Report> => {
    if (!user) throw new Error("User not authenticated");
    setLoading(true);
    setError(null);
    try {
      const updatedReport = await mockReportsApi.updateReport(id, data, user.id);
      setReports(prev => prev.map(r => r.id === id ? updatedReport : r));
      return updatedReport;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update report";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteReport = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await mockReportsApi.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete report";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveReport = useCallback(async (id: string): Promise<Report> => {
    if (!user) throw new Error("User not authenticated");
    setLoading(true);
    setError(null);
    try {
      const approved = await mockReportsApi.approveReport(id, user.id, user.name);
      setReports(prev => prev.map(r => r.id === id ? approved : r));
      return approved;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to approve report";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const rejectReport = useCallback(async (id: string, reason: string): Promise<Report> => {
    if (!user) throw new Error("User not authenticated");
    setLoading(true);
    setError(null);
    try {
      const rejected = await mockReportsApi.rejectReport(id, user.id, user.name, reason);
      setReports(prev => prev.map(r => r.id === id ? rejected : r));
      return rejected;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to reject report";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getReport = useCallback((id: string): Report | undefined => {
    return reports.find(r => r.id === id);
  }, [reports]);

  const getReportsByPeriod = useCallback((period: Period): Report[] => {
    return reports
      .filter(r => r.period === period)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reports]);

  const getReportsByTag = useCallback((tag: string): Report[] => {
    return reports
      .filter(r => r.tags.includes(tag))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reports]);

  const value: ReportsContextType = {
    reports,
    loading,
    error,
    createReport,
    updateReport,
    deleteReport,
    approveReport,
    rejectReport,
    getReport,
    getReportsByPeriod,
    getReportsByTag,
    refreshReports,
  };

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
};

export const useReportsContext = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error("useReportsContext must be used within ReportsProvider");
  }
  return context;
};
