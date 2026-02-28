import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useReports } from "@/hooks/useReports";
import { filterReportsByPermission } from "@/lib/reports/reportPermissions";
import type { Period } from "@/types/reports";
import PeriodFilter from "@/components/reports/PeriodFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, ArrowLeft } from "lucide-react";
import { getDepartment } from "@/data/mockData";

const DepartmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { deptId, subId } = useParams();
  const { user } = useAuth();
  const { reports, loading } = useReports();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("monthly");

  const dept = deptId ? getDepartment(deptId) : null;
  const subdept = dept?.subdepartments.find(s => s.id === subId);

  // Filter reports by permissions
  const accessibleReports = filterReportsByPermission(reports, user);

  // Filter by department and subdepartment
  const deptReports = accessibleReports.filter(r => 
    r.departmentId === deptId && (!subId || r.subdepartmentId === subId)
  );

  // Filter by period
  const periodFiltered = deptReports.filter(r => r.period === selectedPeriod);

  // Sort by date (newest first)
  const sortedReports = [...periodFiltered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (!dept) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Department not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              {subdept ? subdept.name : dept.name}
            </h2>
            <Badge
              variant="outline"
              style={{
                backgroundColor: `hsl(${dept.color} / 0.1)`,
                borderColor: `hsl(${dept.color} / 0.3)`,
                color: `hsl(${dept.color})`,
              }}
            >
              {dept.name}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {subdept ? `${dept.name} - ${subdept.name} Reports` : `${dept.name} Department Reports`}
          </p>
        </div>
        <Button asChild>
          <Link to="/reports/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Link>
        </Button>
      </div>

      <PeriodFilter selected={selectedPeriod} onChange={setSelectedPeriod} />

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      ) : sortedReports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            No {selectedPeriod} reports found for this {subdept ? 'subdepartment' : 'department'}
          </p>
          <Button asChild variant="outline">
            <Link to="/reports/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedReports.map((report, i) => {
            const preview = report.content.replace(/<[^>]*>/g, "").slice(0, 150);
            
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link to={`/reports/${report.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-heading font-semibold text-lg line-clamp-2 flex-1">
                        {report.title}
                      </h3>
                      <Badge variant="secondary" className="ml-2 capitalize text-xs">
                        {report.period}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {preview}...
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {report.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {report.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{report.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{report.authorName}</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
        {["daily", "weekly", "monthly", "quarterly", "annual"].map((period) => {
          const count = deptReports.filter(r => r.period === period).length;
          return (
            <Card key={period} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground capitalize">{period}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentPage;
