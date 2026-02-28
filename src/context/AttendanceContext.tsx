import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AttendanceRecord } from '@/types/attendance';

interface AttendanceContextType {
  todayAttendance: AttendanceRecord[];
  userTodayRecord: AttendanceRecord | null;
  signIn: () => void;
  signOut: (overtimeHours?: number) => void;
  addOvertime: (hours: number) => void;
  getAllAttendance: () => AttendanceRecord[];
  getAttendanceByDate: (date: string) => AttendanceRecord[];
  isSignedIn: boolean;
  canSignOut: boolean;
  overtimeRemaining: number;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Load attendance from localStorage
    const stored = localStorage.getItem('attendance_records');
    if (stored) {
      setAttendance(JSON.parse(stored));
    }

    // Load current user
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const saveAttendance = useCallback((records: AttendanceRecord[]) => {
    setAttendance(records);
    localStorage.setItem('attendance_records', JSON.stringify(records));
  }, []);

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const todayAttendance = attendance.filter(r => r.date === getTodayDate());

  const userTodayRecord = todayAttendance.find(r => r.userId === currentUser?.id) || null;

  const isSignedIn = userTodayRecord?.status === 'signed-in' || userTodayRecord?.status === 'overtime';

  const canSignOut = useCallback(() => {
    if (!userTodayRecord || !isSignedIn) return false;
    
    const now = new Date();
    const signInTime = new Date(userTodayRecord.signInTime);
    const endOfDay = new Date(signInTime);
    endOfDay.setHours(17, 0, 0, 0); // 5:00 PM
    
    // Add overtime hours
    endOfDay.setHours(endOfDay.getHours() + userTodayRecord.overtimeHours);
    
    return now >= endOfDay;
  }, [userTodayRecord, isSignedIn]);

  const overtimeRemaining = useCallback(() => {
    if (!userTodayRecord || !isSignedIn) return 0;
    
    const now = new Date();
    const signInTime = new Date(userTodayRecord.signInTime);
    const endOfDay = new Date(signInTime);
    endOfDay.setHours(17, 0, 0, 0); // 5:00 PM
    endOfDay.setHours(endOfDay.getHours() + userTodayRecord.overtimeHours);
    
    const diff = endOfDay.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60))); // minutes remaining
  }, [userTodayRecord, isSignedIn]);

  const signIn = useCallback(() => {
    if (!currentUser) return;
    if (userTodayRecord) return; // Already signed in today

    const dept = JSON.parse(localStorage.getItem('departments') || '[]')
      .find((d: any) => d.id === currentUser.departmentId);

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userJobTitle: currentUser.jobTitle,
      userDepartment: dept?.name || 'Unknown',
      date: getTodayDate(),
      signInTime: new Date().toISOString(),
      overtimeHours: 0,
      status: 'signed-in',
      approvalStatus: 'pending'
    };

    saveAttendance([...attendance, newRecord]);
  }, [currentUser, userTodayRecord, attendance, saveAttendance]);

  const signOut = useCallback((overtimeHours: number = 0) => {
    if (!userTodayRecord) return;

    const updated = attendance.map(r => {
      if (r.id === userTodayRecord.id) {
        return {
          ...r,
          signOutTime: new Date().toISOString(),
          actualSignOutTime: new Date().toISOString(),
          status: 'signed-out' as const,
          overtimeHours: overtimeHours || r.overtimeHours
        };
      }
      return r;
    });

    saveAttendance(updated);
  }, [userTodayRecord, attendance, saveAttendance]);

  const addOvertime = useCallback((hours: number) => {
    if (!userTodayRecord) return;
    if (userTodayRecord.overtimeHours + hours > 3) return; // Max 3 hours

    const updated = attendance.map(r => {
      if (r.id === userTodayRecord.id) {
        return {
          ...r,
          overtimeHours: Math.min(3, r.overtimeHours + hours),
          status: 'overtime' as const
        };
      }
      return r;
    });

    saveAttendance(updated);
  }, [userTodayRecord, attendance, saveAttendance]);

  const getAllAttendance = useCallback(() => {
    return attendance;
  }, [attendance]);

  const getAttendanceByDate = useCallback((date: string) => {
    return attendance.filter(r => r.date === date);
  }, [attendance]);

  return (
    <AttendanceContext.Provider
      value={{
        todayAttendance,
        userTodayRecord,
        signIn,
        signOut,
        addOvertime,
        getAllAttendance,
        getAttendanceByDate,
        isSignedIn,
        canSignOut: canSignOut(),
        overtimeRemaining: overtimeRemaining()
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within AttendanceProvider');
  }
  return context;
};
