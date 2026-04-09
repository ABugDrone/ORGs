import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FolderOpen, FileText, Table2, Palette, Video } from "lucide-react";
import FileUploadZone from "@/components/dashboard/FileUploadZone";
import FileBrowser from "@/components/files/FileBrowser";
import WordEditor from "@/components/dashboard/WordEditor";
import SheetEditor from "@/components/dashboard/SheetEditor";
import DesignEditor from "@/components/dashboard/DesignEditor";
import VideoPlayer from "@/components/dashboard/VideoPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

type EditorType = "word" | "sheet" | "design" | "video" | null;

const editors = [
  { id: "word" as const, label: "Document", icon: FileText, color: "hsl(217 91% 60%)", desc: "Create & edit rich text documents" },
  { id: "sheet" as const, label: "Spreadsheet", icon: Table2, color: "hsl(142 76% 36%)", desc: "Build spreadsheets with formulas" },
  { id: "design" as const, label: "Design", icon: Palette, color: "hsl(280 89% 60%)", desc: "Draw, sketch and design" },
  { id: "video" as const, label: "Video", icon: Video, color: "hsl(25 95% 53%)", desc: "Play uploaded video files" },
];

const FileManagementPage: React.FC = () => {
  const [activeEditor, setActiveEditor] = useState<EditorType>(null);

  const renderEditor = () => {
    switch (activeEditor) {
      case "word":
        return <WordEditor onSave={() => setActiveEditor(null)} onCancel={() => setActiveEditor(null)} />;
      case "sheet":
        return <SheetEditor onSave={() => setActiveEditor(null)} onCancel={() => setActiveEditor(null)} />;
      case "design":
        return <DesignEditor onSave={() => setActiveEditor(null)} onCancel={() => setActiveEditor(null)} />;
      case "video":
        return (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">Select a video file from your Files tab to play it here.</p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">File Management</h2>
        <p className="text-muted-foreground mt-1">Upload, organize, browse, and create files — all in one place.</p>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" /> Upload
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-2">
            <FolderOpen className="h-4 w-4" /> Files
          </TabsTrigger>
          <TabsTrigger value="create" className="gap-2">
            <FileText className="h-4 w-4" /> Create
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <FileUploadZone />
        </TabsContent>

        {/* Files Browser Tab */}
        <TabsContent value="files">
          <FileBrowser />
        </TabsContent>

        {/* Create / Editors Tab */}
        <TabsContent value="create">
          <div className="space-y-6">
            {/* Editor picker */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {editors.map((editor) => (
                <motion.button
                  key={editor.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveEditor(activeEditor === editor.id ? null : editor.id)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    activeEditor === editor.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${editor.color}20` }}
                  >
                    <editor.icon className="h-6 w-6" style={{ color: editor.color }} />
                  </div>
                  <p className="font-semibold text-sm text-foreground">{editor.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{editor.desc}</p>
                </motion.button>
              ))}
            </div>

            {/* Active editor */}
            <AnimatePresence>
              {activeEditor && (
                <motion.div
                  key={activeEditor}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {renderEditor()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FileManagementPage;
