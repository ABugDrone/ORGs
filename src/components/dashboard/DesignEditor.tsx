import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, Eraser, Palette } from "lucide-react";
import { storageService, Design } from "@/lib/storage/storageService";
import { toast } from "sonner";

interface DesignEditorProps {
  designId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const DesignEditor: React.FC<DesignEditorProps> = ({ designId, onSave, onCancel }) => {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"canvas" | "notes">("notes");
  const [notesContent, setNotesContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (designId) {
      const design = storageService.getDesign(designId);
      if (design) {
        setTitle(design.title);
        setMode(design.mode);
        if (design.mode === "notes" && design.notesContent) {
          setNotesContent(design.notesContent);
        } else if (design.mode === "canvas" && design.canvasData) {
          loadCanvasData(design.canvasData);
        }
      }
    }
  }, [designId]);

  useEffect(() => {
    if (mode === "canvas" && canvasRef.current) {
      initializeCanvas();
    }
  }, [mode]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.lineCap = "round";
    context.lineJoin = "round";
    contextRef.current = context;
  };

  const loadCanvasData = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    image.onload = () => {
      context.drawImage(image, 0, 0);
    };
    image.src = dataUrl;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "eraser") {
      context.globalCompositeOperation = "destination-out";
      context.lineWidth = brushSize * 3;
    } else {
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = currentColor;
      context.lineWidth = brushSize;
    }

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    const context = contextRef.current;
    if (context) {
      context.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getCanvasData = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return "";
    return canvas.toDataURL("image/png");
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a design title");
      return;
    }

    setIsSaving(true);
    try {
      const canvasData = mode === "canvas" ? getCanvasData() : null;
      const notes = mode === "notes" ? notesContent : null;

      if (designId) {
        const existingDesign = storageService.getDesign(designId);
        if (existingDesign) {
          storageService.updateDesign({
            ...existingDesign,
            title,
            mode,
            canvasData,
            notesContent: notes,
          });
          toast.success("Design updated successfully");
        }
      } else {
        storageService.saveDesign({
          title,
          mode,
          canvasData,
          notesContent: notes,
          author: "current-user",
        });
        toast.success("Design saved successfully");
      }

      // Clear editor
      setTitle("");
      setNotesContent("");
      if (canvasRef.current) {
        clearCanvas();
      }

      onSave?.();
    } catch (error) {
      toast.error("Failed to save design");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setNotesContent("");
    if (canvasRef.current) {
      clearCanvas();
    }
    onCancel?.();
  };

  return (
    <div className="space-y-4">
      {/* Title Input */}
      <div className="space-y-2">
        <Label htmlFor="design-title">Design Title</Label>
        <Input
          id="design-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter design title..."
          className="text-lg font-medium"
        />
      </div>

      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as "canvas" | "notes")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
        </TabsList>

        {/* Notes Mode */}
        <TabsContent value="notes" className="space-y-4">
          <Textarea
            value={notesContent}
            onChange={(e) => setNotesContent(e.target.value)}
            placeholder="Write your design notes here..."
            className="min-h-[400px] resize-none"
          />
        </TabsContent>

        {/* Canvas Mode */}
        <TabsContent value="canvas" className="space-y-4">
          {/* Canvas Tools */}
          <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Button
                variant={tool === "pen" ? "default" : "outline"}
                size="sm"
                onClick={() => setTool("pen")}
              >
                <Palette className="h-4 w-4 mr-2" />
                Pen
              </Button>
              <Button
                variant={tool === "eraser" ? "default" : "outline"}
                size="sm"
                onClick={() => setTool("eraser")}
              >
                <Eraser className="h-4 w-4 mr-2" />
                Eraser
              </Button>
            </div>

            {tool === "pen" && (
              <>
                <div className="flex items-center gap-2">
                  <Label htmlFor="color" className="text-sm">
                    Color:
                  </Label>
                  <input
                    id="color"
                    type="color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="h-8 w-16 rounded border cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="brush-size" className="text-sm">
                    Size:
                  </Label>
                  <input
                    id="brush-size"
                    type="range"
                    min="1"
                    max="10"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground w-6">{brushSize}</span>
                </div>
              </>
            )}

            <Button variant="outline" size="sm" onClick={clearCanvas}>
              Clear
            </Button>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-[400px] border rounded-lg bg-white cursor-crosshair"
            style={{ touchAction: "none" }}
          />

          <p className="text-xs text-muted-foreground">
            Click and drag to draw on the canvas
          </p>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Design"}
        </Button>
      </div>
    </div>
  );
};

export default DesignEditor;
