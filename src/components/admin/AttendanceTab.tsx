import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, Download, Calendar as CalendarIcon, Search, Users, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { AttendanceRecord, AttendanceStats } from '@/types/attendance';
import { format } from 'date-fns';

export default function AttendanceTab() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = () => {
    const stored = localStorage.getItem('attendance_records');
    if (stored) {
      setAttendance(JSON.parse(stored));
    }
  };

  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const dayAttendance = attendance.filter(r => r.date === dateString);

  // Apply filters
  const filtered = dayAttendance.filter(record => {
    const matchesSearch = record.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.userJobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.userDepartment.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats: AttendanceStats = {
    totalPresent: dayAttendance.length,
    totalSignedOut: dayAttendance.filter(r => r.status === 'signed-out').length,
    totalOnOvertime: dayAttendance.filter(r => r.status === 'overtime').length,
    onTimeSignIns: dayAttendance.filter(r => {
      const signInTime = new Date(r.signInTime);
      return signInTime.getHours() < 9 || (signInTime.getHours() === 9 && signInTime.getMinutes() === 0);
    }).length,
    lateSignIns: dayAttendance.filter(r => {
      const signInTime = new Date(r.signInTime);
      return signInTime.getHours() > 9 || (signInTime.getHours() === 9 && signInTime.getMinutes() > 0);
    }).length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed-in':
        return <Badge variant="default" className="bg-green-500">Present</Badge>;
      case 'overtime':
        return <Badge variant="default" className="bg-orange-500">Overtime</Badge>;
      case 'signed-out':
        return <Badge variant="secondary">Signed Out</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Job Title', 'Department', 'Sign In', 'Sign Out', 'Overtime Hours', 'Status'],
      ...filtered.map(r => [
        r.userName,
        r.userJobTitle,
        r.userDepartment,
        formatTime(r.signInTime),
        r.signOutTime ? formatTime(r.signOutTime) : 'N/A',
        r.overtimeHours.toString(),
        r.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${dateString}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPresent}</p>
                <p className="text-xs text-muted-foreground">Total Present</p>
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
                <p className="text-2xl font-bold">{stats.onTimeSignIns}</p>
                <p className="text-xs text-muted-foreground">On Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lateSignIns}</p>
                <p className="text-xs text-muted-foreground">Late Arrivals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalOnOvertime}</p>
                <p className="text-xs text-muted-foreground">On Overtime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSignedOut}</p>
                <p className="text-xs text-muted-foreground">Signed Out</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily Attendance Records</CardTitle>
              <CardDescription>View and manage employee attendance</CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                />
              </PopoverContent>
            </Popover>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, job title, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="signed-in">Present</SelectItem>
                <SelectItem value="overtime">Overtime</SelectItem>
                <SelectItem value="signed-out">Signed Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Sign In</TableHead>
                  <TableHead>Sign Out</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No attendance records found for this date
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((record, index) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{record.userName}</TableCell>
                      <TableCell>{record.userJobTitle}</TableCell>
                      <TableCell>{record.userDepartment}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatTime(record.signInTime)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.signOutTime ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {formatTime(record.signOutTime)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.overtimeHours > 0 ? (
                          <Badge variant="outline">
                            +{record.overtimeHours}h
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
