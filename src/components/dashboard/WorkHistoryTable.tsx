import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, FileSpreadsheet, Image, Video, Download, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { storageService, WorkEntry } from "@/lib/storage/storageService";
import EditWorkEntryDialog from "./EditWorkEntryDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { toast } from "sonner";

// Initialize with mock data if storage is empty
const initializeMockData = () => {
  const existing = storageService.getWorkEntries();
  if (existing.length === 0) {
    const mockData = [
      { name: "Q4 Financial Report", fileId: "FIN-2024-Q4", format: "PDF", date: "2024-02-20", size: "2.4 MB" },
      { name: "Marketing Campaign Assets", fileId: "MKT-2024-001", format: "ZIP", date: "2024-02-19", size: "15.8 MB" },
      { name: "Employee Handbook v3", fileId: "HR-2024-003", format: "DOCX", date: "2024-02-18", size: "1.2 MB" },
      { name: "Budget Spreadsheet 2024", fileId: "FIN-2024-BUD", format: "XLSX", date: "2024-02-17", size: "856 KB" },
      { name: "Product Launch Presentation", fileId: "MKT-2024-002", format: "PPTX", date: "2024-02-16", size: "4.3 MB" },
    ];
    mockData.forEach(entry => storageService.addWorkEntry(entry));
  }
};

const getFileIcon = (format: string) => {
  const fmt = format.toLowerCase();
  if (fmt.includes("pdf") || fmt.includes("doc")) return FileText;
  if (fmt.includes("xls") || fmt.includes("sheet")) return FileSpreadsheet;
  if (fmt.includes("jpg") || fmt.includes("png") || fmt.includes("img")) return Image;
  if (fmt.includes("mp4") || fmt.includes("video")) return Video;
  return FileText;
};

const WorkHistoryTable: React.FC = () => {
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<WorkEntry | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Load entries from storage on mount
  useEffect(() => {
    initializeMockData();
    loadEntries();
  }, []);

  const loadEntries = () => {
    const entries = storageService.getWorkEntries();
    setWorkEntries(entries);
  };

  const handleEdit = (entry: WorkEntry) => {
    setEditingEntry(entry);
  };

  const handleSaveEdit = (updatedEntry: WorkEntry) => {
    try {
      storageService.updateWorkEntry(updatedEntry);
      loadEntries();
      setEditingEntry(null);
    } catch (error) {
      toast.error("Failed to update work entry");
      console.error(error);
    }
  };

  const handleDelete = () => {
    if (!deletingEntry) return;
    
    try {
      storageService.deleteWorkEntry(deletingEntry.id);
      loadEntries();
      toast.success("Work entry deleted successfully");
      setDeletingEntry(null);
    } catch (error) {
      toast.error("Failed to delete work entry");
      console.error(error);
    }
  };

  const filteredItems = workEntries
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fileId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-xl">Work History</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === "name" ? "date" : "name")}
            >
              Sort: {sortBy === "name" ? "A-Z" : "Date"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredItems.map((item, i) => {
            const Icon = getFileIcon(item.format);
            const isHovered = hoveredId === item.id;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.fileId} • {item.format} • {item.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                  
                  {/* Action buttons - visible on hover */}
                  <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEdit(item)}
                      title="Edit entry"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeletingEntry(item)}
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Edit Dialog */}
        <EditWorkEntryDialog
          entry={editingEntry}
          onSave={handleSaveEdit}
          onCancel={() => setEditingEntry(null)}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={!!deletingEntry}
          onConfirm={handleDelete}
          onCancel={() => setDeletingEntry(null)}
          entryName={deletingEntry?.name}
        />
      </CardContent>
    </Card>
  );
};

export default WorkHistoryTable;
