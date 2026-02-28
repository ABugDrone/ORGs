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
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function SignInDialog() {
  const { user } = useAuth();
  const { userTodayRecord, signIn } = useAttendance();
  const [showDialog, setShowDialog] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    // Check if user should see sign-in dialog
    if (!user) return;
    if (userTodayRecord) return; // Already signed in

    // Check if it's a workday and within sign-in hours (6 AM - 10 AM)
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Skip weekends
    if (day === 0 || day === 6) return;

    // Show dialog between 6 AM and 10 AM
    if (hour >= 6 && hour < 10) {
      // Check if already shown today
      const shownToday = localStorage.getItem(`signin_shown_${user.id}_${now.toISOString().split('T')[0]}`);
      if (!shownToday) {
        setShowDialog(true);
        localStorage.setItem(`signin_shown_${user.id}_${now.toISOString().split('T')[0]}`, 'true');
      }
    }
  }, [user, userTodayRecord]);

  const handleSignIn = () => {
    if (!acknowledged) {
      toast.error('Please acknowledge your attendance');
      return;
    }

    signIn();
    setShowDialog(false);
    setAcknowledged(false);
    
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const isLate = hour > 9 || (hour === 9 && minute > 0);

    toast.success(
      isLate 
        ? 'Signed in (Late arrival noted)' 
        : 'Signed in successfully',
      {
        description: `Welcome! Your attendance has been recorded at ${now.toLocaleTimeString()}`
      }
    );
  };

  const handleDismiss = () => {
    setShowDialog(false);
    setAcknowledged(false);
  };

  if (!showDialog) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Good Morning!</DialogTitle>
              <DialogDescription>Time to sign in for work</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Attendance Acknowledgement</p>
            <p className="text-xs text-muted-foreground">
              By signing in, you confirm that you have arrived at work and are ready to begin your duties for today.
            </p>
          </div>

          <div className="flex items-start space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
            />
            <label
              htmlFor="acknowledge"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I acknowledge that I have arrived at work and I am signing in for today's attendance.
            </label>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            <span>Your sign-in time will be recorded automatically</span>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleDismiss}>
            Remind Me Later
          </Button>
          <Button onClick={handleSignIn} disabled={!acknowledged}>
            Sign In Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
