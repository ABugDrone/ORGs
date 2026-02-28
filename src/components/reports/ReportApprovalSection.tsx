import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import type { Report } from '@/types/reports';

interface ReportApprovalSectionProps {
  report: Report;
  isSuperAdmin: boolean;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}

export function ReportApprovalSection({
  report,
  isSuperAdmin,
  onApprove,
  onReject
}: ReportApprovalSectionProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    
    setLoading(true);
    try {
      await onReject(rejectionReason);
      setShowRejectDialog(false);
      setRejectionReason('');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (report.approvalStatus) {
      case 'approved':
        return (
          <Badge className="bg-green-500 gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-2">
            <XCircle className="h-4 w-4" />
            Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="secondary" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending Approval
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Display */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Approval Status:</span>
          {getStatusBadge()}
        </div>
        
        {report.approvedBy && report.approvedAt && (
          <div className="text-xs text-muted-foreground">
            {report.approvalStatus === 'approved' ? 'Approved' : 'Reviewed'} by {report.approvedBy}
            <br />
            {new Date(report.approvedAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Rejection Reason */}
      {report.approvalStatus === 'rejected' && report.rejectionReason && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Rejection Reason:</p>
            <p className="text-sm">{report.rejectionReason}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Admin Actions */}
      {isSuperAdmin && report.approvalStatus === 'pending' && (
        <div className="flex gap-3 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
          <Button
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve Report
          </Button>
          
          <Button
            onClick={() => setShowRejectDialog(true)}
            disabled={loading}
            variant="destructive"
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject Report
          </Button>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Report</DialogTitle>
            <DialogDescription>
              Please provide feedback on what needs to be improved
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Explain what needs to be improved or corrected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || loading}
            >
              Reject Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
