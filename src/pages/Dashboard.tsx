import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Bell, HardDrive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import InteractiveCalendar from "@/components/dashboard/InteractiveCalendar";
import WorkstationSelector from "@/components/dashboard/WorkstationSelector";
import FileUploadZone from "@/components/dashboard/FileUploadZone";
import { fileIndexService } from "@/lib/fileIndex/fileIndexService";
import { formatBytes } from "@/lib/fileIndex/types";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ total: 0, today: 0, totalBytes: 0 });
  const [reminders, setReminders] = useState(0);

  useEffect(() => {
    const s = fileIndexService.getStats();
    setStats({ total: s.total, today: s.today, totalBytes: s.totalBytes });
    // Count upcoming reminders
    try {
      const stored = localStorage.getItem('orgs_reminders');
      const rems = stored ? JSON.parse(stored) : [];
      const upcoming = rems.filter((r: any) => r.status === 'upcoming' && new Date(r.date) >= new Date(new Date().toDateString()));
      setReminders(upcoming.length);
    } catch { /* ignore */ }
  }, []);

  const statCards = [
    { label: "Total Files", value: stats.total.toString(), icon: FileText, change: "All formats" },
    { label: "Uploaded Today", value: stats.today.toString(), icon: Upload, change: "New files" },
    { label: "Reminders", value: reminders.toString(), icon: Bell, change: "Upcoming" },
    { label: "Storage Used", value: formatBytes(stats.totalBytes), icon: HardDrive, change: "Local folder" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="font-heading text-2xl font-bold text-foreground">Welcome to ORGs 👋</h2>
        <p className="text-muted-foreground mt-1">All your files, organized. One search away.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}>
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-3xl font-heading font-bold text-foreground mt-1">{card.value}</p>
                    <p className="text-xs text-primary font-medium mt-1">{card.change}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <card.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Calendar + File Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <InteractiveCalendar />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}>
          <FileUploadZone />
        </motion.div>
      </div>

      {/* Editors */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
        <WorkstationSelector />
      </motion.div>
    </div>
  );
};

export default Dashboard;
