import React, { createContext, useContext, useState, useCallback } from "react";
import { users, type User, type Role } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isSuperAdmin: boolean;
  isDeptHead: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("casi360_user");
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const login = useCallback((email: string, password: string) => {
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { success: false, error: "Invalid email or password" };
    setUser(found);
    localStorage.setItem("casi360_user", JSON.stringify(found));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("casi360_user");
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("casi360_user", JSON.stringify(updatedUser));
    
    // Also update in users list
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.id === updatedUser.id);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(allUsers));
    }
  }, []);

  const isSuperAdmin = user?.role === "super_admin";
  const isDeptHead = user?.role === "dept_head";

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      const role: string = user.role;
      if (role === "super_admin") return true;
      if (permission === "create_event" && (role === "dept_head" || role === "super_admin")) return true;
      if (permission === "admin_panel" && role === "super_admin") return true;
      if (permission === "cross_department" && role === "super_admin") return true;
      return false;
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser, isSuperAdmin, isDeptHead, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
