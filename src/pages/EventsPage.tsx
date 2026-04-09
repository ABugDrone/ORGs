import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar as CalendarIcon, Clock, Bell, Trash2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Reminder {
  id: string;
  title: string;
  note: string;
  date: string;
  time: string;
  status: 'upcoming' | 'done';
}

const STORAGE_KEY = 'orgs_reminders';

export default function EventsPage() {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', note: '', date: '', time: '' });

  const persist = (data: Reminder[]) => {
    setReminders(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handleCreate = () => {
    if (!formData.title || !formData.date) {
      toast({ title: 'Title and date are required', variant: 'destructive' });
      return;
    }
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: formData.title,
      note: formData.note,
      date: formData.date,
      time: formData.time,
      status: 'upcoming',
    };
    persist([...reminders, newReminder]);
    toast({ title: 'Reminder created' });
    setDialogOpen(false);
    setFormData({ title: '', note: '', date: '', time: '' });
  };

  const handleDelete = (id: string) => {
    persist(reminders.filter(r => r.id !== id));
  };

  const handleToggleDone = (id: string) => {
    persist(reminders.map(r =>
      r.id === id ? { ...r, status: r.status === 'done' ? 'upcoming' : 'done' } : r
    ));
  };

  const getForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reminders.filter(r => r.date === dateStr);
  };

  // Dates that have reminders — for calendar highlighting
  const reminderDates = reminders.map(r => new Date(r.date + 'T00:00:00'));

  const upcoming = reminders
    .filter(r => r.status === 'upcoming' && new Date(r.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.date + 'T' + (a.time || '00:00')).getTime() - new Date(b.date + 'T' + (b.time || '00:00')).getTime());

  const selectedDateReminders = selectedDate ? getForDate(selectedDate) : [];

  return (
    <div className="container max-w-7xl py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Personal Reminders</h1>
          <p className="text-muted-foreground text-sm mt-1">Set reminders for yourself — deadlines, follow-ups, anything.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Personal Reminder</DialogTitle>
              <DialogDescription>Set a reminder for yourself</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Back up files to Google Drive"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Optional details..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Create Reminder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{ hasReminder: reminderDates }}
              modifiersClassNames={{ hasReminder: 'bg-primary/20 font-bold text-primary rounded-full' }}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Selected date reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateReminders.length > 0 ? (
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {selectedDateReminders.map(r => (
                      <div key={r.id} className="p-3 border rounded-lg flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${r.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                            {r.title}
                          </p>
                          {r.time && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />{r.time}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleToggleDone(r.id)}>
                            <Bell className={`h-3 w-3 ${r.status === 'done' ? 'text-muted-foreground' : 'text-primary'}`} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleDelete(r.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No reminders for this date</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              {upcoming.length > 0 ? (
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {upcoming.slice(0, 8).map(r => (
                      <div key={r.id} className="p-3 border rounded-lg flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{r.title}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(r.date + 'T00:00:00').toLocaleDateString()}
                            {r.time && <><Clock className="h-3 w-3 ml-1" />{r.time}</>}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">upcoming</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No upcoming reminders</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
