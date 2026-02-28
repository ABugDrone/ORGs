import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Table2, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WordEditor from "./WordEditor";
import SheetEditor from "./SheetEditor";
import DesignEditor from "./DesignEditor";

type WorkstationType = "word" | "sheet" | "design" | null;

const workstations = [
  { id: "word" as const, label: "Word", icon: FileText, color: "hsl(217 91% 60%)" },
  { id: "sheet" as const, label: "Sheet", icon: Table2, color: "hsl(142 76% 36%)" },
  { id: "design" as const, label: "Design", icon: Palette, color: "hsl(280 89% 60%)" },
];

const WorkstationSelector: React.FC = () => {
  const [activeStation, setActiveStation] = useState<WorkstationType>(null);

  const handleEditorSave = () => {
    setActiveStation(null);
  };

  const handleEditorCancel = () => {
    setActiveStation(null);
  };

  const renderEditor = () => {
    switch (activeStation) {
      case "word":
        return <WordEditor onSave={handleEditorSave} onCancel={handleEditorCancel} />;
      case "sheet":
        return <SheetEditor onSave={handleEditorSave} onCancel={handleEditorCancel} />;
      case "design":
        return <DesignEditor onSave={handleEditorSave} onCancel={handleEditorCancel} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Workstation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {workstations.map((station) => (
            <motion.button
              key={station.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveStation(station.id)}
              className={`p-6 rounded-xl border-2 transition-all ${
                activeStation === station.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className="h-14 w-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${station.color}15` }}
                >
                  <station.icon className="h-7 w-7" style={{ color: station.color }} />
                </div>
                <span className="font-medium text-foreground">{station.label}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {activeStation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              {renderEditor()}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default WorkstationSelector;
