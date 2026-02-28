import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Save,
  X,
} from "lucide-react";
import { storageService, Document } from "@/lib/storage/storageService";
import { toast } from "sonner";

interface WordEditorProps {
  documentId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const WordEditor: React.FC<WordEditorProps> = ({ documentId, onSave, onCancel }) => {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (documentId) {
      const doc = storageService.getDocument(documentId);
      if (doc) {
        setTitle(doc.title);
        if (editorRef.current) {
          editorRef.current.innerHTML = doc.content;
        }
      }
    }
  }, [documentId]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    if (!editorRef.current) return;

    setIsSaving(true);
    try {
      const content = editorRef.current.innerHTML;
      const contentJson = { html: content }; // Simplified JSON format

      if (documentId) {
        const existingDoc = storageService.getDocument(documentId);
        if (existingDoc) {
          storageService.updateDocument({
            ...existingDoc,
            title,
            content,
            contentJson,
          });
          toast.success("Document updated successfully");
        }
      } else {
        storageService.saveDocument({
          title,
          content,
          contentJson,
          author: "current-user", // In real app, get from auth context
        });
        toast.success("Document saved successfully");
      }

      // Clear editor
      setTitle("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }

      onSave?.();
    } catch (error) {
      toast.error("Failed to save document");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    onCancel?.();
  };

  return (
    <div className="space-y-4">
      {/* Title Input */}
      <div className="space-y-2">
        <Label htmlFor="doc-title">Document Title</Label>
        <Input
          id="doc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter document title..."
          className="text-lg font-medium"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border rounded-lg bg-muted/30">
        {/* Text Formatting */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => execCommand("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => execCommand("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => execCommand("underline")}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => execCommand("formatBlock", "h1")}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => execCommand("formatBlock", "h2")}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => execCommand("insertUnorderedList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => execCommand("insertOrderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Alignment */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => execCommand("justifyLeft")}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => execCommand("justifyCenter")}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => execCommand("justifyRight")}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[400px] p-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring prose prose-sm max-w-none"
        style={{
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
        suppressContentEditableWarning
      />

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Document"}
        </Button>
      </div>
    </div>
  );
};

export default WordEditor;
