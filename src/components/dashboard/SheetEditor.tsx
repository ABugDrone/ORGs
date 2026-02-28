import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, X } from "lucide-react";
import { storageService, Spreadsheet, CellData } from "@/lib/storage/storageService";
import { formulaEngine } from "@/lib/formulas/formulaEngine";
import { toast } from "sonner";

interface SheetEditorProps {
  spreadsheetId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const ROWS = 20;
const COLS = 10;
const COL_LETTERS = "ABCDEFGHIJ".split("");

const SheetEditor: React.FC<SheetEditorProps> = ({ spreadsheetId, onSave, onCancel }) => {
  const [title, setTitle] = useState("");
  const [cells, setCells] = useState<Record<string, CellData>>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (spreadsheetId) {
      const sheet = storageService.getSpreadsheet(spreadsheetId);
      if (sheet) {
        setTitle(sheet.title);
        setCells(sheet.cells);
      }
    }
  }, [spreadsheetId]);

  const getCellId = (row: number, col: number): string => {
    return `${COL_LETTERS[col]}${row + 1}`;
  };

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId);
  };

  const handleCellDoubleClick = (cellId: string) => {
    setEditingCell(cellId);
    const cell = cells[cellId];
    setEditValue(cell?.value || "");
  };

  const handleCellChange = (cellId: string, value: string) => {
    const newCells = { ...cells };

    if (!value.trim()) {
      // Clear cell
      delete newCells[cellId];
    } else if (value.startsWith("=")) {
      // Formula
      const computed = formulaEngine.evaluate(value, newCells);
      newCells[cellId] = { value, formula: value, computed };
    } else {
      // Plain value
      newCells[cellId] = { value, formula: null, computed: value };
    }

    // Recalculate dependent cells
    Object.keys(newCells).forEach((id) => {
      const cell = newCells[id];
      if (cell.formula) {
        cell.computed = formulaEngine.evaluate(cell.formula, newCells);
      }
    });

    setCells(newCells);
    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, cellId: string) => {
    if (e.key === "Enter") {
      handleCellChange(cellId, editValue);
    } else if (e.key === "Escape") {
      setEditingCell(null);
      setEditValue("");
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a spreadsheet title");
      return;
    }

    setIsSaving(true);
    try {
      if (spreadsheetId) {
        const existingSheet = storageService.getSpreadsheet(spreadsheetId);
        if (existingSheet) {
          storageService.updateSpreadsheet({
            ...existingSheet,
            title,
            cells,
          });
          toast.success("Spreadsheet updated successfully");
        }
      } else {
        storageService.saveSpreadsheet({
          title,
          cells,
          rows: ROWS,
          cols: COLS,
          author: "current-user",
        });
        toast.success("Spreadsheet saved successfully");
      }

      // Clear editor
      setTitle("");
      setCells({});
      setSelectedCell(null);

      onSave?.();
    } catch (error) {
      toast.error("Failed to save spreadsheet");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setCells({});
    setSelectedCell(null);
    onCancel?.();
  };

  const getCellDisplay = (cellId: string): string => {
    const cell = cells[cellId];
    if (!cell) return "";
    if (cell.computed !== null && cell.computed !== undefined) {
      return String(cell.computed);
    }
    return cell.value;
  };

  return (
    <div className="space-y-4">
      {/* Title Input */}
      <div className="space-y-2">
        <Label htmlFor="sheet-title">Spreadsheet Title</Label>
        <Input
          id="sheet-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter spreadsheet title..."
          className="text-lg font-medium"
        />
      </div>

      {/* Selected Cell Info */}
      {selectedCell && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{selectedCell}:</span>
          <span className="text-muted-foreground">
            {cells[selectedCell]?.value || "(empty)"}
          </span>
        </div>
      )}

      {/* Spreadsheet Grid */}
      <div className="border rounded-lg overflow-auto max-h-[500px]">
        <div className="inline-block min-w-full">
          {/* Header Row */}
          <div className="flex bg-muted/50 sticky top-0 z-10">
            <div className="w-12 h-8 flex items-center justify-center border-r border-b font-medium text-xs">
              #
            </div>
            {COL_LETTERS.map((letter) => (
              <div
                key={letter}
                className="w-24 h-8 flex items-center justify-center border-r border-b font-medium text-xs"
              >
                {letter}
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {Array.from({ length: ROWS }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex">
              {/* Row Number */}
              <div className="w-12 h-10 flex items-center justify-center border-r border-b bg-muted/30 font-medium text-xs">
                {rowIndex + 1}
              </div>

              {/* Cells */}
              {COL_LETTERS.map((_, colIndex) => {
                const cellId = getCellId(rowIndex, colIndex);
                const isSelected = selectedCell === cellId;
                const isEditing = editingCell === cellId;

                return (
                  <div
                    key={cellId}
                    className={`w-24 h-10 border-r border-b relative ${
                      isSelected ? "ring-2 ring-primary ring-inset" : ""
                    }`}
                    onClick={() => handleCellClick(cellId)}
                    onDoubleClick={() => handleCellDoubleClick(cellId)}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleCellChange(cellId, editValue)}
                        onKeyDown={(e) => handleKeyDown(e, cellId)}
                        className="w-full h-full px-2 text-sm border-none focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <div className="w-full h-full px-2 flex items-center text-sm truncate">
                        {getCellDisplay(cellId)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Click a cell to select, double-click to edit</p>
        <p>• Start with "=" for formulas (e.g., =SUM(A1:A5), =A1+B1)</p>
        <p>• Supported functions: SUM, AVERAGE, MIN, MAX</p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Spreadsheet"}
        </Button>
      </div>
    </div>
  );
};

export default SheetEditor;
