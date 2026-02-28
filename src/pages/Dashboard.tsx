import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getDepartment } from "@/data/mockData";
import { FileText, Upload, CalendarDays, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import WorkHistoryTable from "@/components/dashboard/WorkHistoryTable";
import InteractiveCalendar from "@/components/dashboard/InteractiveCalendar";
import WorkstationSelector from "@/components/dashboard/WorkstationSelector";
import FileUploadZone from "@/components/dashboard/FileUploadZone";
import { AttendanceWidget } from "@/components/attendance/AttendanceWidget";

const statCards = [
  { label: "Documents", value: "48", icon: FileText, change: "+3 today" },
  { label: "Uploads", value: "124", icon: Upload, change: "+12 this week" },
  { label: "Events", value: "7", icon: CalendarDays, change: "2 upcoming" },
  { label: "Active Projects", value: "5", icon: Briefcase, change: "1 new" },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const dept = user ? getDepartment(user.departmentId) : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Here's what's happening in{" "}
          {dept && (
            <span
              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `hsl(${dept.color} / 0.15)`,
                color: `hsl(${dept.color})`,
              }}
            >
              {dept.name}
            </span>
          )}{" "}
          today.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
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

      {/* Work History */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <WorkHistoryTable />
      </motion.div>

      {/* Calendar + File Upload + Attendance row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <InteractiveCalendar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <AttendanceWidget />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <FileUploadZone />
        </motion.div>
      </div>

      {/* Workstation Selector */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.55 }}
      >
        <WorkstationSelector />
      </motion.div>
    </div>
  );
};

export default Dashboard;
