import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";
import { departments, type Department } from "@/data/mockData";
import { toast } from "sonner";

const DepartmentsTab: React.FC = () => {
  const [depts, setDepts] = useState<Department[]>(departments);
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'dept' | 'sub', id: string, parentId?: string } | null>(null);

  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptColor, setNewDeptColor] = useState("199 89% 48%");
  const [newSubName, setNewSubName] = useState("");

  const handleAddDepartment = () => {
    if (!newDeptName.trim()) {
      toast.error("Department name is required");
      return;
    }

    const newDept: Department = {
      id: newDeptName.toLowerCase().replace(/\s+/g, "-"),
      name: newDeptName,
      color: newDeptColor,
      subdepartments: [],
    };

    setDepts([...depts, newDept]);
    toast.success("Department added successfully");
    setShowAddDept(false);
    setNewDeptName("");
    setNewDeptColor("199 89% 48%");
  };

  const handleAddSubdepartment = () => {
    if (!selectedDept || !newSubName.trim()) {
      toast.error("Subdepartment name is required");
      return;
    }

    const updatedDepts = depts.map(d => {
      if (d.id === selectedDept.id) {
        return {
          ...d,
          subdepartments: [
            ...d.subdepartments,
            {
              id: `${d.id}-${newSubName.toLowerCase().replace(/\s+/g, "-")}`,
              name: newSubName,
            },
          ],
        };
      }
      return d;
    });

    setDepts(updatedDepts);
    toast.success("Subdepartment added successfully");
    setShowAddSub(false);
    setNewSubName("");
    setSelectedDept(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'dept') {
      setDepts(depts.filter(d => d.id !== deleteTarget.id));
      toast.success("Department deleted successfully");
    } else {
      const updatedDepts = depts.map(d => {
        if (d.id === deleteTarget.parentId) {
          return {
            ...d,
            subdepartments: d.subdepartments.filter(s => s.id !== deleteTarget.id),
          };
        }
        return d;
      });
      setDepts(updatedDepts);
      toast.success("Subdepartment deleted successfully");
    }

    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Department Structure</CardTitle>
              <CardDescription>
                Manage departments and subdepartments for your organization
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDept(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {depts.map((dept) => (
              <Card key={dept.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <FolderTree className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-lg">{dept.name}</h3>
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: `hsl(${dept.color} / 0.1)`,
                            borderColor: `hsl(${dept.color} / 0.3)`,
                            color: `hsl(${dept.color})`,
                          }}
                        >
                          {dept.subdepartments.length} subdepartments
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDept(dept);
                          setShowAddSub(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Sub
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleteTarget({ type: 'dept', id: dept.id });
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {dept.subdepartments.length > 0 && (
                    <div className="ml-8 space-y-2">
                      {dept.subdepartments.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <span className="text-sm">{sub.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeleteTarget({ type: 'sub', id: sub.id, parentId: dept.id });
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Department Dialog */}
      <Dialog open={showAddDept} onOpenChange={setShowAddDept}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Create a new department for your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Department Name</Label>
              <Input
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="e.g., Human Resources"
              />
            </div>
            <div>
              <Label>Color (HSL format)</Label>
              <Input
                value={newDeptColor}
                onChange={(e) => setNewDeptColor(e.target.value)}
                placeholder="e.g., 199 89% 48%"
              />
              <div
                className="mt-2 h-8 rounded"
                style={{ backgroundColor: `hsl(${newDeptColor})` }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDept(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDepartment}>Add Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subdepartment Dialog */}
      <Dialog open={showAddSub} onOpenChange={setShowAddSub}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subdepartment</DialogTitle>
            <DialogDescription>
              Add a subdepartment to {selectedDept?.name}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Subdepartment Name</Label>
            <Input
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              placeholder="e.g., Recruitment"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSub(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubdepartment}>Add Subdepartment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteTarget?.type === 'dept' ? 'department' : 'subdepartment'}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentsTab;
