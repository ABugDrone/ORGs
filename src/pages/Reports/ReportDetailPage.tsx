import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useReports } from "@/hooks/useReports";
import { useReportsContext } from "@/context/ReportsContext";
import { useMessages } from "@/context/MessagesContext";
import { generateMockSummary } from "@/lib/reports/aiSummarizer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Trash2, Sparkles, Download, ArrowLeft, Printer, Share2 } from "lucide-react";
import { getDepartment } from "@/data/mockData";
import { toast } from "sonner";
import type { AISummary } from "@/types/reports";
import { ReportApprovalSection } from "@/components/reports/ReportApprovalSection";

const ReportDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isSuperAdmin } = useAuth();
  const { getReport, deleteReport } = useReports();
  const { approveReport, rejectReport } = useReportsContext();
  const { createConversation, sendMessage } = useMessages();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const report = id ? getReport(id) : null;

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Report not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/reports">Back to Reports</Link>
        </Button>
      </div>
    );
  }

  // Check if user can edit (only if rejected or pending and is author)
  const canEditReport = report && (
    (report.approvalStatus === 'rejected' || report.approvalStatus === 'pending') &&
    report.authorId === user?.id
  );

  // Check if user can delete (only if rejected or pending and is author)
  const canDeleteReport = report && (
    (report.approvalStatus === 'rejected' || report.approvalStatus === 'pending') &&
    report.authorId === user?.id
  );

  const dept = getDepartment(report.departmentId);
  const canEdit = canEditReport;
  const canDelete = canDeleteReport;

  const handleDelete = async () => {
    try {
      await deleteReport(report.id);
      toast.success("Report deleted successfully");
      navigate("/reports");
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const generatedSummary = await generateMockSummary(report);
      setSummary(generatedSummary);
    } catch (error) {
      toast.error("Failed to generate summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const handleDownload = () => {
    const content = `
CASI 360 Report
===============

Title: ${report.title}
Author: ${report.authorName}
Department: ${dept?.name || 'N/A'}
Period: ${report.period}
Created: ${new Date(report.createdAt).toLocaleString()}

Tags: ${report.tags.join(', ')}

Content:
${report.content}

---
Generated on ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[^a-z0-9]/gi, '_')}_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded");
  };

  const handleShare = () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const participantNames = selectedUsers.map(userId => {
      const u = users.find((user: any) => user.id === userId);
      return u?.name || 'Unknown';
    });

    const convId = createConversation(selectedUsers, participantNames);
    const shareMessage = `📄 Report Shared: "${report.title}"\n\nI've shared a report with you. View it here: /reports/${report.id}\n\nPeriod: ${report.period}\nDepartment: ${dept?.name || 'N/A'}`;
    
    sendMessage(convId, shareMessage);
    
    toast.success(`Report shared with ${selectedUsers.length} user(s)`);
    setShowShareDialog(false);
    setSelectedUsers([]);
  };

  const allUsers = JSON.parse(localStorage.getItem('users') || '[]')
    .filter((u: any) => u.id !== user?.id);

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approveReport(id);
      toast.success('Report approved successfully');
    } catch (error) {
      toast.error('Failed to approve report');
    }
  };

  const handleReject = async (reason: string) => {
    if (!id) return;
    try {
      await rejectReport(id, reason);
      toast.success('Report rejected with feedback');
    } catch (error) {
      toast.error('Failed to reject report');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/reports">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={() => setShowShareDialog(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {canEdit && (
            <Button variant="outline" asChild>
              <Link to={`/reports/${report.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          )}
          {canDelete && (
            <Button variant="outline" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          {/* Approval Section */}
          <ReportApprovalSection
            report={report}
            isSuperAdmin={isSuperAdmin || false}
            onApprove={handleApprove}
            onReject={handleReject}
          />

          <div className="h-6" />

          <h1 className="font-heading text-3xl font-bold mb-4">{report.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {report.tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <span className="text-muted-foreground">Author:</span>
              <span className="ml-2 font-medium">{report.authorName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Period:</span>
              <span className="ml-2 font-medium capitalize">{report.period}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2 font-medium">
                {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>
              <span className="ml-2 font-medium">
                {new Date(report.updatedAt).toLocaleString()}
              </span>
            </div>
            {dept && (
              <div>
                <span className="text-muted-foreground">Department:</span>
                <Badge
                  variant="outline"
                  className="ml-2"
                  style={{
                    backgroundColor: `hsl(${dept.color} / 0.1)`,
                    borderColor: `hsl(${dept.color} / 0.3)`,
                    color: `hsl(${dept.color})`,
                  }}
                >
                  {dept.name}
                </Badge>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap">{report.content}</div>
          </div>

          {report.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Attachments</h3>
              <div className="space-y-2">
                {report.attachments.map(attachment => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    download={attachment.name}
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">{attachment.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary || report.content.length < 100}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGeneratingSummary ? "Generating Summary..." : "AI Summarize"}
          </Button>

          {summary && (
            <Card className="mt-6 bg-muted/50">
              <CardContent className="p-6">
                <div dangerouslySetInnerHTML={{ __html: summary.summary }} />
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Report</DialogTitle>
            <DialogDescription>
              Select users to share this report with via internal messaging
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ScrollArea className="h-64 border rounded-md p-4">
              {allUsers.map((u: any) => (
                <div key={u.id} className="flex items-center space-x-3 py-2">
                  <Checkbox
                    checked={selectedUsers.includes(u.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers([...selectedUsers, u.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.jobTitle}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="flex gap-2">
              <Button onClick={handleShare} className="flex-1">
                Share with {selectedUsers.length} user(s)
              </Button>
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportDetailPage;
