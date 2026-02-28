import { useState, useEffect } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function OvertimeTimer() {
  const { userTodayRecord, isSignedIn, overtimeRemaining, signOut } = useAttendance();
  const [showReminder, setShowReminder] = useState(false);
  const [lastReminderTime, setLastReminderTime] = useState<number>(0);

  useEffect(() => {
    if (!isSignedIn || !userTodayRecord) return;

    const checkReminder = () => {
      const now = Date.now();
      const minutesRemaining = overtimeRemaining;

      // Show reminder every 15 minutes
      if (minutesRemaining > 0 && now - lastReminderTime >= 15 * 60 * 1000) {
        setShowReminder(true);
        setLastReminderTime(now);

        // Auto-hide after 10 seconds
        setTimeout(() => setShowReminder(false), 10000);
      }
    };

    // Check every minute
    const interval = setInterval(checkReminder, 60000);
    checkReminder(); // Check immediately

    return () => clearInterval(interval);
  }, [isSignedIn, userTodayRecord, overtimeRemaining, lastReminderTime]);

  const handleSignOut = () => {
    signOut();
    setShowReminder(false);
  };

  if (!isSignedIn || !userTodayRecord || overtimeRemaining === 0) return null;

  const hours = Math.floor(overtimeRemaining / 60);
  const minutes = overtimeRemaining % 60;

  return (
    <>
      {/* Floating Timer Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={handleSignOut}
          className="h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all"
          title="Click to sign out"
        >
          <div className="flex flex-col items-center">
            <Clock className="h-5 w-5 mb-1" />
            <span className="text-xs font-bold">
              {hours > 0 ? `${hours}h` : ''} {minutes}m
            </span>
          </div>
        </Button>
      </motion.div>

      {/* Reminder Banner */}
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
          >
            <div className="mx-4 bg-card border shadow-lg rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Overtime Reminder</p>
                  <p className="text-xs text-muted-foreground">
                    {hours > 0 && `${hours} hour${hours > 1 ? 's' : ''} `}
                    {minutes} minute{minutes !== 1 ? 's' : ''} remaining
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowReminder(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
