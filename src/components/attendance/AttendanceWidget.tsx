import { useAttendance } from '@/context/AttendanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, LogIn, LogOut, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export function AttendanceWidget() {
  const { userTodayRecord, isSignedIn, signIn, signOut, addOvertime, canSignOut } = useAttendance();
  const [showOvertimeDialog, setShowOvertimeDialog] = useState(false);
  const [overtimeChoice, setOvertimeChoice] = useState<string>('1');

  const handleSignIn = () => {
    signIn();
    toast.success('Signed in successfully');
  };

  const handleSignOut = () => {
    if (!canSignOut) {
      toast.error('You can only sign out after 5:00 PM or when overtime ends');
      return;
    }
    signOut();
    toast.success('Signed out successfully');
  };

  const handleAddOvertime = () => {
    const hours = parseInt(overtimeChoice);
    addOvertime(hours);
    setShowOvertimeDialog(false);
    toast.success(`${hours} hour(s) overtime added`);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const currentOvertime = userTodayRecord?.overtimeHours || 0;
  const maxAdditionalOvertime = 3 - currentOvertime;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSignedIn ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You haven't signed in today
            </p>
            <Button onClick={handleSignIn} className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="default" className="bg-green-500">
                {userTodayRecord?.status === 'overtime' ? 'On Overtime' : 'Present'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sign In:</span>
              <span className="text-sm font-medium">
                {userTodayRecord && formatTime(userTodayRecord.signInTime)}
              </span>
            </div>

            {currentOvertime > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overtime:</span>
                <Badge variant="outline">+{currentOvertime}h</Badge>
              </div>
            )}

            <div className="flex gap-2">
              {maxAdditionalOvertime > 0 && (
                <Dialog open={showOvertimeDialog} onOpenChange={setShowOvertimeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Overtime
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Overtime</DialogTitle>
                      <DialogDescription>
                        Select additional hours you need to work
                      </DialogDescription>
                    </DialogHeader>
                    <RadioGroup value={overtimeChoice} onValueChange={setOvertimeChoice}>
                      {[1, 2, 3].slice(0, maxAdditionalOvertime).map(hours => (
                        <div key={hours} className="flex items-center space-x-2">
                          <RadioGroupItem value={hours.toString()} id={`ot-${hours}`} />
                          <Label htmlFor={`ot-${hours}`} className="cursor-pointer">
                            {hours} hour{hours > 1 ? 's' : ''}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <DialogFooter>
                      <Button onClick={handleAddOvertime}>Add Overtime</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              <Button
                onClick={handleSignOut}
                disabled={!canSignOut}
                variant={canSignOut ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {!canSignOut && (
              <p className="text-xs text-muted-foreground text-center">
                You can sign out after 5:00 PM
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
