import { useState, useEffect } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function SignOutDialog() {
  const { user } = useAuth();
  const { userTodayRecord, signOut, addOvertime, canSignOut, isSignedIn } = useAttendance();
  const [showDialog, setShowDialog] = useState(false);
  const [overtimeChoice, setOvertimeChoice] = useState<string>('0');

  useEffect(() => {
    if (!user || !isSignedIn || !userTodayRecord) return;

    const checkSignOutTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Check if it's 5:00 PM or later (considering overtime)
      const signInTime = new Date(userTodayRecord.signInTime);
      const endTime = new Date(signInTime);
      endTime.setHours(17 + userTodayRecord.overtimeHours, 0, 0, 0);

      if (now >= endTime) {
        // Check if already shown
        const shownKey = `signout_shown_${user.id}_${userTodayRecord.id}`;
        const shown = sessionStorage.getItem(shownKey);
        
        if (!shown) {
          setShowDialog(true);
          sessionStorage.setItem(shownKey, 'true');
        }
      }
    };

    // Check immediately
    checkSignOutTime();

    // Check every minute
    const interval = setInterval(checkSignOutTime, 60000);

    return () => clearInterval(interval);
  }, [user, isSignedIn, userTodayRecord]);

  const handleSignOut = () => {
    signOut(parseInt(overtimeChoice));
    setShowDialog(false);
    setOvertimeChoice('0');
    
    toast.success('Signed out successfully', {
      description: 'Have a great evening! See you tomorrow.'
    });
  };

  const handleAddOvertime = () => {
    const hours = parseInt(overtimeChoice);
    if (hours > 0) {
      addOvertime(hours);
      setShowDialog(false);
      setOvertimeChoice('0');
      
      toast.success(`${hours} hour(s) overtime added`, {
        description: `You can work until ${new Date(new Date().setHours(17 + (userTodayRecord?.overtimeHours || 0) + hours, 0, 0, 0)).toLocaleTimeString()}`
      });
    }
  };

  if (!showDialog) return null;

  const currentOvertime = userTodayRecord?.overtimeHours || 0;
  const maxAdditionalOvertime = 3 - currentOvertime;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <LogOut className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">Time to Sign Out</DialogTitle>
              <DialogDescription>Your work day has ended</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Sign Out Options</p>
            <p className="text-xs text-muted-foreground">
              You can sign out now or add overtime if you need to work longer.
            </p>
          </div>

          {maxAdditionalOvertime > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Need more time?</Label>
              <RadioGroup value={overtimeChoice} onValueChange={setOvertimeChoice}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="no-overtime" />
                  <Label htmlFor="no-overtime" className="cursor-pointer">
                    Sign out now
                  </Label>
                </div>
                {[1, 2, 3].slice(0, maxAdditionalOvertime).map(hours => (
                  <div key={hours} className="flex items-center space-x-2">
                    <RadioGroupItem value={hours.toString()} id={`overtime-${hours}`} />
                    <Label htmlFor={`overtime-${hours}`} className="cursor-pointer">
                      Add {hours} hour{hours > 1 ? 's' : ''} overtime
                      <span className="text-xs text-muted-foreground ml-2">
                        (until {new Date(new Date().setHours(17 + currentOvertime + hours, 0, 0, 0)).toLocaleTimeString()})
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {currentOvertime > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-500/10 p-2 rounded">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Current overtime: {currentOvertime} hour{currentOvertime > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Dismiss
          </Button>
          {parseInt(overtimeChoice) > 0 ? (
            <Button onClick={handleAddOvertime}>
              Add Overtime
            </Button>
          ) : (
            <Button onClick={handleSignOut}>
              Sign Out Now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
