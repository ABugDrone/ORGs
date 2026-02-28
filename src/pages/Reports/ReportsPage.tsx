import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useReports } from "@/hooks/useReports";
import { filterReportsByPermission } from "@/lib/reports/reportPermissions";
import type { Period } from "@/types/reports";
import PeriodFilter from "@/components/reports/PeriodFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Search } from "lucide-react";
import { getDepartment } from "@/data/mockData";

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reports, loading } = useReports();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("monthly");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter reports by permissions
  const accessibleReports = filterReportsByPermission(reports, user);

  // Filter by period
  const periodFiltered = accessibleReports.filter(r => r.period === selectedPeriod);

  // Filter by tag if selected
  const tagFiltered = selectedTag
    ? periodFiltered.filter(r => r.tags.includes(selectedTag))
    : periodFiltered;

  // Filter by search query
  const filtered = searchQuery
    ? tagFiltered.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : tagFiltered;

  // Sort by date (newest first)
  const sortedReports = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (!user?.departmentId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>You must be assigned to a department to view reports</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Reports</h2>
          <p className="text-muted-foreground mt-1">
            View and manage departmental reports
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

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {(selectedTag || searchQuery) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedTag(null);
              setSearchQuery("");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {selectedTag && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtered by tag:</span>
          <Badge variant="secondary" className="gap-1">
            {selectedTag}
            <button
              onClick={() => setSelectedTag(null)}
              className="ml-1 hover:text-destructive"
            >
              ×
            </button>
          </Badge>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      ) : sortedReports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            {selectedTag ? "No reports match your filters" : "No reports found for this period"}
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
            const dept = getDepartment(report.departmentId);
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
                    <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-2">
                      {report.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {preview}...
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {report.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-primary/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(tag);
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{report.authorName}</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    {dept && (
                      <Badge
                        variant="outline"
                        className="mt-2"
                        style={{
                          backgroundColor: `hsl(${dept.color} / 0.1)`,
                          borderColor: `hsl(${dept.color} / 0.3)`,
                          color: `hsl(${dept.color})`,
                        }}
                      >
                        {dept.name}
                      </Badge>
                    )}
                    {report.approvalStatus === 'pending' && (
                      <Badge variant="secondary" className="mt-2 ml-2">
                        Pending Approval
                      </Badge>
                    )}
                    {report.approvalStatus === 'rejected' && (
                      <Badge variant="destructive" className="mt-2 ml-2">
                        Rejected
                      </Badge>
                    )}
                    {report.approvalStatus === 'approved' && (
                      <Badge className="mt-2 ml-2 bg-green-500">
                        Approved
                      </Badge>
                    )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
