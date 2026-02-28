export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userJobTitle: string;
  userDepartment: string;
  date: string; // YYYY-MM-DD
  signInTime: string; // ISO timestamp
  signOutTime?: string; // ISO timestamp
  overtimeHours: number; // 0, 1, 2, or 3
  status: 'signed-in' | 'signed-out' | 'overtime';
  actualSignOutTime?: string; // ISO timestamp when they actually signed out
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface AttendanceStats {
  totalPresent: number;
  totalSignedOut: number;
  totalOnOvertime: number;
  onTimeSignIns: number;
  lateSignIns: number;
}
