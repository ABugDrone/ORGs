import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, Link as LinkIcon, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { storageService, FileMetadata } from "@/lib/storage/storageService";
import { validationService } from "@/lib/validation/validationService";
import VideoPlayer from "./VideoPlayer";

interface FileUpload {
  id: string;
  file: File;
  type: "video" | "document" | "image";
  preview?: string;
  status: "pending" | "uploading" | "complete" | "error";
  progress: number;
}

const FileUploadZone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [googleDriveLink, setGoogleDriveLink] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([]);
  const [playingVideo, setPlayingVideo] = useState<FileMetadata | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = (fileList: File[]) => {
    const validFiles: FileUpload[] = [];

    fileList.forEach((file) => {
      const validation = validationService.validateFile(file);
      
      if (!validation.valid) {
        toast.error(validation.error || "Invalid file");
        return;
      }

      const fileType = validationService.getFileType(file);
      const fileUpload: FileUpload = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: fileType,
        status: "pending",
        progress: 0,
      };

      // Create preview for videos and images
      if (fileType === "video" || fileType === "image") {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileUpload.preview = e.target?.result as string;
          setFiles((prev) =>
            prev.map((f) => (f.id === fileUpload.id ? fileUpload : f))
          );
        };
        reader.readAsDataURL(file);
      }

      validFiles.push(fileUpload);
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("No files to upload");
      return;
    }

    // Simulate upload with progress
    for (const fileUpload of files) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileUpload.id ? { ...f, status: "uploading" } : f
        )
      );

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileUpload.id ? { ...f, progress } : f
          )
        );
      }

      // Save to storage
      try {
        const today = new Date().toISOString().split("T")[0];
        const fileMetadata: Omit<FileMetadata, "id" | "uploadTimestamp"> = {
          name: fileUpload.file.name,
          type: fileUpload.type,
          format: fileUpload.file.name.split(".").pop()?.toUpperCase() || "FILE",
          size: fileUpload.file.size,
          sizeFormatted: validationService.formatFileSize(fileUpload.file.size),
          url: fileUpload.preview || URL.createObjectURL(fileUpload.file),
          uploadDate: today,
        };

        const saved = storageService.saveFile(fileMetadata);
        setUploadedFiles((prev) => [...prev, saved]);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileUpload.id ? { ...f, status: "complete" } : f
          )
        );
      } catch (error) {
        console.error("Upload error:", error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileUpload.id ? { ...f, status: "error" } : f
          )
        );
        toast.error(`Failed to upload ${fileUpload.file.name}`);
      }
    }

    toast.success(`${files.length} file(s) uploaded successfully!`);
    setFiles([]);
  };

  const handleGoogleDriveLink = () => {
    if (!googleDriveLink.trim()) {
      toast.error("Please enter a Google Drive link");
      return;
    }

    const validation = validationService.validateGoogleDriveUrl(googleDriveLink);
    
    if (!validation.valid) {
      toast.error(validation.error || "Invalid Google Drive link");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const saved = storageService.saveGoogleDriveLink(googleDriveLink, today);
      setUploadedFiles((prev) => [...prev, saved]);
      toast.success("Google Drive link added successfully");
      setGoogleDriveLink("");
    } catch (error) {
      console.error("Error saving Google Drive link:", error);
      toast.error("Failed to save Google Drive link");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">File Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground mb-1">
                Drag and drop files here
              </p>
              <p className="text-sm text-muted-foreground">
                Supports videos (MP4, WebM, AVI, MOV), documents, and images (max 100MB)
              </p>
            </div>
            <Input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              accept=".pdf,.docx,.xlsx,.jpg,.png,.mp4,.webm,.avi,.mov"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Browse Files
              </label>
            </Button>
          </div>
        </div>

        {/* Google Drive Link Input */}
        <div className="space-y-2">
          <Label htmlFor="google-drive-link">Or add a Google Drive video link</Label>
          <div className="flex gap-2">
            <Input
              id="google-drive-link"
              value={googleDriveLink}
              onChange={(e) => setGoogleDriveLink(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="flex-1"
            />
            <Button onClick={handleGoogleDriveLink} variant="outline">
              <LinkIcon className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Only Google Drive links are supported. YouTube, Facebook, TikTok, and Instagram links are not allowed.
          </p>
        </div>

        {/* Pending Files */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className="text-sm font-medium text-foreground">
                Files to upload ({files.length})
              </p>
              {files.map((fileUpload) => (
                <motion.div
                  key={fileUpload.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {fileUpload.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {validationService.formatFileSize(fileUpload.file.size)}
                        {fileUpload.status === "uploading" && ` • ${fileUpload.progress}%`}
                      </p>
                    </div>
                  </div>
                  {fileUpload.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => removeFile(fileUpload.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
              <Button onClick={handleUpload} className="w-full mt-3">
                Upload {files.length} file(s)
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Recently Uploaded ({uploadedFiles.length})
            </p>
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file.format} • {file.sizeFormatted}
                      </p>
                    </div>
                  </div>
                  {file.type === "video" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPlayingVideo(file)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                  )}
                </div>
                
                {/* Video Player */}
                {playingVideo?.id === file.id && file.type === "video" && (
                  <div className="mt-3">
                    <VideoPlayer
                      src={file.url}
                      type="file"
                      onError={(error) => console.error("Video error:", error)}
                    />
                  </div>
                )}
                
                {/* Google Drive Player */}
                {playingVideo?.id === file.id && file.type === "google-drive-link" && (
                  <div className="mt-3">
                    <VideoPlayer
                      src={file.url}
                      type="google-drive"
                      onError={(error) => console.error("Video error:", error)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadZone;
