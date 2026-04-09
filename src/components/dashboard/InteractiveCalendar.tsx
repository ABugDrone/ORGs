import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, FileText, Image, Video, Archive, Clock, FolderOpen } from "lucide-react";
import { fileIndexService } from "@/lib/fileIndex/fileIndexService";
import { FileIndexEntry, FormatCategory } from "@/lib/fileIndex/types";
import { openWithDefault } from "@/lib/electron/electronBridge";
import { motion } from "framer-motion";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Documents: FileText,
  Spreadsheets: FileText,
  Presentations: FileText,
  Images: Image,
  Videos: Video,
  Archives: Archive,
  'ORGs Files': FolderOpen,
  Other: FileText,
};

const CATEGORY_COLORS: Record<string, string> = {
  Documents: 'hsl(217 91% 60%)',
  Spreadsheets: 'hsl(142 76% 36%)',
  Presentations: 'hsl(25 95% 53%)',
  Images: 'hsl(280 89% 60%)',
  Videos: 'hsl(340 82% 52%)',
  Archives: 'hsl(199 89% 48%)',
  'ORGs Files': 'hsl(262 83% 58%)',
  Other: 'hsl(0 0% 50%)',
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const InteractiveCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [datesWithFiles, setDatesWithFiles] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateFiles, setDateFiles] = useState<{ time: string; entry: FileIndexEntry }[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setDatesWithFiles(fileIndexService.getDatesWithFiles());
  }, [panelOpen]); // refresh when panel closes (after potential upload)

  const dateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const handleDayClick = (day: number) => {
    const d = dateStr(day);
    setSelectedDate(d);
    setDateFiles(fileIndexService.getTimelineForDate(d));
    setPanelOpen(true);
  };

  const handleOpenFile = async (entry: FileIndexEntry) => {
    if (entry.localPath) {
      await openWithDefault(entry.localPath);
    } else if (entry.url) {
      window.open(entry.url, '_blank');
    }
  };

  // Build calendar grid
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);
  for (let day = 1; day <= daysInMonth; day++) {
    const d = dateStr(day);
    const isToday = d === todayStr;
    const hasFiles = datesWithFiles.has(d);
    cells.push(
      <button
        key={day}
        onClick={() => handleDayClick(day)}
        className={`relative h-10 w-full rounded-lg text-sm font-medium transition-all
          ${isToday ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}
          ${hasFiles && !isToday ? 'font-bold' : ''}
        `}
      >
        {day}
        {hasFiles && (
          <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full
            ${isToday ? 'bg-primary-foreground' : 'bg-primary'}`}
          />
        )}
      </button>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">Calendar</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2 min-w-[120px] text-center">
                {MONTH_NAMES[month]} {year}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">{cells}</div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary inline-block" />
              Has files
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary/80 inline-block" />
              Today
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date detail panel */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {selectedDate
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })
                : ''}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              {dateFiles.length > 0
                ? `${dateFiles.length} file${dateFiles.length > 1 ? 's' : ''} uploaded`
                : 'No files uploaded on this date'}
            </p>
          </SheetHeader>

          <ScrollArea className="flex-1 mt-4">
            {dateFiles.length === 0 ? (
              <div className="text-center py-16">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm text-muted-foreground">No files for this date</p>
              </div>
            ) : (
              <div className="space-y-2 pr-2">
                {dateFiles.map(({ time, entry }, i) => {
                  const Icon = CATEGORY_ICONS[entry.category] ?? FileText;
                  const color = CATEGORY_COLORS[entry.category] ?? 'hsl(0 0% 50%)';
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => handleOpenFile(entry)}
                    >
                      {/* Time */}
                      <div className="text-xs text-muted-foreground w-12 shrink-0 text-right font-mono">
                        {time}
                      </div>
                      {/* Icon */}
                      <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}20` }}>
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{entry.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {entry.extension}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{entry.sizeFormatted}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default InteractiveCalendar;
