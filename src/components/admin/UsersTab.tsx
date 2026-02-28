import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Key } from "lucide-react";
import { users, departments, type User, type Role } from "@/data/mockData";
import { toast } from "sonner";

const UsersTab: React.FC = () => {
  const [usersList, setUsersList] = useState<User[]>(users);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff" as Role,
    departmentId: "",
    subdepartmentId: "",
    jobTitle: "",
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.departmentId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const user: User = {
      id: `U${String(usersList.length + 1).padStart(3, "0")}`,
      ...newUser,
      avatar: "",
    };

    setUsersList([...usersList, user]);
    toast.success("User created successfully");
    setShowAddUser(false);
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "staff",
      departmentId: "",
      subdepartmentId: "",
      jobTitle: "",
    });
  };

  const handleResetPassword = () => {
    if (!selectedUser) return;
    toast.success(`Password reset for ${selectedUser.name}`);
    setShowResetPassword(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    setUsersList(usersList.filter(u => u.id !== userId));
    toast.success("User deleted successfully");
  };

  const getRoleBadge = (role: Role) => {
    const colors = {
      super_admin: "bg-red-500/10 text-red-500 border-red-500/30",
      dept_head: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      staff: "bg-gray-500/10 text-gray-500 border-gray-500/30",
    };
    const labels = {
      super_admin: "Super Admin",
      dept_head: "Dept Head",
      staff: "Staff",
    };
    return (
      <Badge variant="outline" className={colors[role]}>
        {labels[role]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Create, edit, and manage user accounts
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddUser(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.map((user) => {
                const dept = departments.find(d => d.id === user.departmentId);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-sm">{dept?.name || "N/A"}</TableCell>
                    <TableCell className="text-sm">{user.jobTitle}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowResetPassword(true);
                          }}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account for your organization
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="john@casi360.com"
              />
            </div>
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label>Role *</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as Role })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="dept_head">Department Head</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department *</Label>
              <Select value={newUser.departmentId} onValueChange={(value) => setNewUser({ ...newUser, departmentId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Job Title</Label>
              <Input
                value={newUser.jobTitle}
                onChange={(e) => setNewUser({ ...newUser, jobTitle: e.target.value })}
                placeholder="Manager"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>New Password</Label>
            <Input type="password" placeholder="Enter new password" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPassword(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersTab;
