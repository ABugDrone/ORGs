import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkEntry } from "@/lib/storage/storageService";
import { toast } from "sonner";

interface EditWorkEntryDialogProps {
  entry: WorkEntry | null;
  onSave: (entry: WorkEntry) => void;
  onCancel: () => void;
}

const EditWorkEntryDialog: React.FC<EditWorkEntryDialogProps> = ({
  entry,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<WorkEntry>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (entry) {
      setFormData(entry);
      setErrors({});
    }
  }, [entry]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.fileId?.trim()) {
      newErrors.fileId = "File ID is required";
    }
    if (!formData.format?.trim()) {
      newErrors.format = "Format is required";
    }
    if (!formData.date?.trim()) {
      newErrors.date = "Date is required";
    }
    if (!formData.size?.trim()) {
      newErrors.size = "Size is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSave(formData as WorkEntry);
    toast.success("Work entry updated successfully");
  };

  const handleChange = (field: keyof WorkEntry, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={!!entry} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Work Entry</DialogTitle>
          <DialogDescription>
            Update the details of your work entry. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter work entry name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileId">File ID</Label>
            <Input
              id="fileId"
              value={formData.fileId || ""}
              onChange={(e) => handleChange("fileId", e.target.value)}
              placeholder="Enter file ID"
              className={errors.fileId ? "border-destructive" : ""}
            />
            {errors.fileId && (
              <p className="text-sm text-destructive">{errors.fileId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Input
                id="format"
                value={formData.format || ""}
                onChange={(e) => handleChange("format", e.target.value)}
                placeholder="e.g., PDF"
                className={errors.format ? "border-destructive" : ""}
              />
              {errors.format && (
                <p className="text-sm text-destructive">{errors.format}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size || ""}
                onChange={(e) => handleChange("size", e.target.value)}
                placeholder="e.g., 2.4 MB"
                className={errors.size ? "border-destructive" : ""}
              />
              {errors.size && (
                <p className="text-sm text-destructive">{errors.size}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date || ""}
              onChange={(e) => handleChange("date", e.target.value)}
              className={errors.date ? "border-destructive" : ""}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditWorkEntryDialog;
