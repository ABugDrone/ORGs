import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { storageService, FileMetadata } from "@/lib/storage/storageService";
import DateFilesPanel from "./DateFilesPanel";

const nigerianHolidays = [
  { date: "2024-01-01", name: "New Year's Day" },
  { date: "2024-03-29", name: "Good Friday" },
  { date: "2024-04-01", name: "Easter Monday" },
  { date: "2024-05-01", name: "Workers' Day" },
  { date: "2024-06-12", name: "Democracy Day" },
  { date: "2024-10-01", name: "Independence Day" },
  { date: "2024-12-25", name: "Christmas Day" },
  { date: "2024-12-26", name: "Boxing Day" },
];

const InteractiveCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filesForDate, setFilesForDate] = useState<FileMetadata[]>([]);
  const [showFilesPanel, setShowFilesPanel] = useState(false);
  const [datesWithFiles, setDatesWithFiles] = useState<Set<string>>(new Set());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Load dates with files when component mounts or month changes
  useEffect(() => {
    loadDatesWithFiles();
  }, [month, year]);

  const loadDatesWithFiles = () => {
    const files = storageService.getFiles();
    const dates = new Set<string>();
    files.forEach(file => {
      dates.add(file.uploadDate);
    });
    setDatesWithFiles(dates);
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isHoliday = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return nigerianHolidays.some((h) => h.date === dateStr);
  };

  const hasUpload = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return datesWithFiles.has(dateStr);
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    
    const files = storageService.getFilesByDate(dateStr);
    setFilesForDate(files);
    setShowFilesPanel(true);
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`h-10 rounded-lg text-sm font-medium transition-colors relative ${
          isHoliday(day)
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "hover:bg-muted text-foreground"
        }`}
      >
        {day}
        {hasUpload(day) && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </button>
    );
  }

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-lg">Calendar</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">{monthNames[month]} {year}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>

        {/* Date Files Panel */}
        <DateFilesPanel
          isOpen={showFilesPanel}
          onClose={() => setShowFilesPanel(false)}
          date={selectedDate}
          files={filesForDate}
        />
      </CardContent>
    </Card>
  );
};

export default InteractiveCalendar;
