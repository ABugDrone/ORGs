import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileMetadata } from "@/lib/storage/storageService";
import { FileText, Image, Video, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface DateFilesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  files: FileMetadata[];
}

const getFileIcon = (type: FileMetadata["type"]) => {
  switch (type) {
    case "video":
      return Video;
    case "image":
      return Image;
    case "google-drive-link":
      return ExternalLink;
    default:
      return FileText;
  }
};

const DateFilesPanel: React.FC<DateFilesPanelProps> = ({
  isOpen,
  onClose,
  date,
  files,
}) => {
  const handleFileClick = (file: FileMetadata) => {
    if (file.type === "google-drive-link") {
      window.open(file.url, "_blank");
    } else {
      // For uploaded files, trigger download or open
      window.open(file.url, "_blank");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Files for {date}</SheetTitle>
          <SheetDescription>
            {files.length > 0
              ? `${files.length} file${files.length > 1 ? "s" : ""} uploaded on this date`
              : "No files uploaded on this date"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {files.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm text-muted-foreground">
                No files available for this date
              </p>
            </div>
          ) : (
            files.map((file, i) => {
              const Icon = getFileIcon(file.type);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleFileClick(file)}
                >
                  {/* File Icon */}
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.format} • {file.sizeFormatted}
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileClick(file);
                    }}
                  >
                    {file.type === "google-drive-link" ? (
                      <ExternalLink className="h-4 w-4" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DateFilesPanel;
