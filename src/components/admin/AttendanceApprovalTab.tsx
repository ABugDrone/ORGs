import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import type { AttendanceRecord } from '@/types/attendance';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function AttendanceApprovalTab() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = () => {
    const stored = localStorage.getItem('attendance_records');
    if (stored) {
      setAttendance(JSON.parse(stored));
    }
  };

  const saveAttendance = (records: AttendanceRecord[]) => {
    setAttendance(records);
    localStorage.setItem('attendance_records', JSON.stringify(records));
  };

  const handleApprove = (record: AttendanceRecord) => {
    const updated = attendance.map(r => {
      if (r.id === record.id) {
        return {
          ...r,
          approvalStatus: 'approved' as const,
          approvedBy: user?.name,
          approvedAt: new Date().toISOString(),
          rejectionReason: undefined
        };
      }
      return r;
    });
    saveAttendance(updated);
    toast.success(`Attendance approved for ${record.userName}`);
  };

  const handleReject = () => {
    if (!selectedRecord || !rejectionReason.trim()) return;

    const updated = attendance.map(r => {
      if (r.id === selectedRecord.id) {
        return {
          ...r,
          approvalStatus: 'rejected' as const,
          approvedBy: user?.name,
          approvedAt: new Date().toISOString(),
          rejectionReason
        };
      }
      return r;
    });
    saveAttendance(updated);
    toast.success(`Attendance rejected for ${selectedRecord.userName}`);
    setShowRejectDialog(false);
    setSelectedRecord(null);
    setRejectionReason('');
  };

  const openRejectDialog = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setShowRejectDialog(true);
  };

  const pendingRecords = attendance.filter(r => r.approvalStatus === 'pending');
  const approvedRecords = attendance.filter(r => r.approvalStatus === 'approved');
  const rejectedRecords = attendance.filter(r => r.approvalStatus === 'rejected');

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 gap-1"><CheckCircle2 className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
  };

  const renderTable = (records: AttendanceRecord[], showActions: boolean = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Sign In</TableHead>
          <TableHead>Sign Out</TableHead>
          <TableHead>Overtime</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showActions ? 8 : 7} className="text-center py-8 text-muted-foreground">
              No records found
            </TableCell>
          </TableRow>
        ) : (
          records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{formatDate(record.date)}</TableCell>
              <TableCell className="font-medium">{record.userName}</TableCell>
              <TableCell>{record.userDepartment}</TableCell>
              <TableCell>{formatTime(record.signInTime)}</TableCell>
              <TableCell>
                {record.signOutTime ? formatTime(record.signOutTime) : '-'}
              </TableCell>
              <TableCell>
                {record.overtimeHours > 0 ? `+${record.overtimeHours}h` : '-'}
              </TableCell>
              <TableCell>{getStatusBadge(record.approvalStatus)}</TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(record)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openRejectDialog(record)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRecords.length}</p>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedRecords.length}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedRecords.length}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Review and approve attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            {renderTable(pendingRecords, true)}
          </div>
        </CardContent>
      </Card>

      {/* Approved Records */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            {renderTable(approvedRecords)}
          </div>
        </CardContent>
      </Card>

      {/* Rejected Records */}
      {rejectedRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rejected Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              {renderTable(rejectedRecords)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Attendance</DialogTitle>
            <DialogDescription>
              Provide feedback on why this attendance record is being rejected
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm"><strong>Employee:</strong> {selectedRecord.userName}</p>
                <p className="text-sm"><strong>Date:</strong> {formatDate(selectedRecord.date)}</p>
                <p className="text-sm"><strong>Sign In:</strong> {formatTime(selectedRecord.signInTime)}</p>
              </div>

              <Textarea
                placeholder="Explain why this attendance is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedRecord(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
