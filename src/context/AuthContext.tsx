// ORGs is a single-user desktop app — no login, no roles.
// This context just holds the user's display name (optional, settable in Settings).
import React, { createContext, useContext, useState, useCallback } from "react";

interface AuthContextType {
  displayName: string;
  setDisplayName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [displayName, setDisplayNameState] = useState<string>(() => {
    return localStorage.getItem("orgs_display_name") || "User";
  });

  const setDisplayName = useCallback((name: string) => {
    setDisplayNameState(name);
    localStorage.setItem("orgs_display_name", name);
  }, []);

  return (
    <AuthContext.Provider value={{ displayName, setDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
