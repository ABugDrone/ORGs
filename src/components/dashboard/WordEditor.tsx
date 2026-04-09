import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "min-h-[400px] p-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring prose prose-sm max-w-none",
      },
    },
  });

  useEffect(() => {
    if (documentId && editor) {
      const doc = storageService.getDocument(documentId);
      if (doc) {
        setTitle(doc.title);
        // Use TipTap's setContent — safe, no raw innerHTML assignment
        editor.commands.setContent(doc.content);
      }
    }
  }, [documentId, editor]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    if (!editor) return;

    setIsSaving(true);
    try {
      const content = editor.getHTML();
      const contentJson = editor.getJSON();

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
          author: "current-user",
        });
        toast.success("Document saved successfully");
      }

      setTitle("");
      editor.commands.clearContent();
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
    editor?.commands.clearContent();
    onCancel?.();
  };

  if (!editor) return null;

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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          data-active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          data-active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          data-active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          data-active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          data-active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          data-active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      {/* TipTap Editor */}
      <EditorContent editor={editor} />

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
