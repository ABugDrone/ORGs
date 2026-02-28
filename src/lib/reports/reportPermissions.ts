import type { User } from "@/data/mockData";
import type { Report } from "@/types/reports";

export function canEditReport(user: User | null, report: Report): boolean {
  if (!user) return false;
  
  // Super Admin can edit all reports
  if (user.role === "super_admin") return true;
  
  // Report author can edit their own reports
  if (report.authorId === user.id) return true;
  
  // Dept Head can edit reports in their department
  if (user.role === "dept_head" && report.departmentId === user.departmentId) {
    return true;
  }
  
  return false;
}

export function canDeleteReport(user: User | null, report: Report): boolean {
  if (!user) return false;
  
  // Super Admin can delete all reports
  if (user.role === "super_admin") return true;
  
  // Report author can delete their own reports
  if (report.authorId === user.id) return true;
  
  // Dept Head can delete reports in their department
  if (user.role === "dept_head" && report.departmentId === user.departmentId) {
    return true;
  }
  
  return false;
}

export function canViewReport(user: User | null, report: Report): boolean {
  if (!user) return false;
  
  // Super Admin can view all reports
  if (user.role === "super_admin") return true;
  
  // Users can view reports from their department
  if (report.departmentId === user.departmentId) return true;
  
  return false;
}

export function filterReportsByPermission(reports: Report[], user: User | null): Report[] {
  if (!user) return [];
  
  // Super Admin sees all reports
  if (user.role === "super_admin") return reports;
  
  // Other users see only their department's reports
  return reports.filter(report => report.departmentId === user.departmentId);
}
