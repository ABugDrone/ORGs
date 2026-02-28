import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) setError(result.error || "Login failed");
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-sidebar-accent to-navy opacity-80" />
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/10"
              style={{
                width: 80 + i * 60,
                height: 80 + i * 60,
                top: `${20 + i * 12}%`,
                left: `${10 + i * 15}%`,
              }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
        <motion.div
          className="relative z-10 text-center px-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="font-heading text-5xl font-bold text-primary-foreground mb-4 tracking-tight">
            Casi<span className="text-primary">360</span>
          </h1>
          <p className="text-sidebar-foreground text-lg max-w-md leading-relaxed">
            Your unified internal dashboard for seamless department management, collaboration, and reporting.
          </p>
          <div className="mt-8 flex items-center gap-3 justify-center flex-wrap">
            {["Management", "Finance", "Sales", "Relations", "Education", "IT"].map((dept) => (
              <span
                key={dept}
                className="px-3 py-1 rounded-full text-xs font-medium bg-sidebar-accent text-sidebar-foreground border border-sidebar-border"
              >
                {dept}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your Casi360 account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@casi360.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" className="w-full h-11 font-semibold text-base" disabled={loading}>
              {loading ? (
                <motion.div
                  className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-lg bg-muted border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Demo Accounts</p>
            <div className="space-y-1">
              {[
                { email: "admin@casi360.com", pw: "admin123", label: "Super Admin" },
                { email: "management@casi360.com", pw: "mgmt1234", label: "Management (HR)" },
                { email: "finance@casi360.com", pw: "fin1234", label: "Finance Director" },
                { email: "sales@casi360.com", pw: "sales1234", label: "Sales & Marketing" },
                { email: "relations@casi360.com", pw: "rel1234", label: "Customer Relations" },
                { email: "education@casi360.com", pw: "edu1234", label: "Research & Dev" },
                { email: "it@casi360.com", pw: "it1234", label: "IT Support" },
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => { setEmail(demo.email); setPassword(demo.pw); }}
                  className="w-full text-left text-xs px-3 py-1.5 rounded-md hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-colors flex justify-between"
                >
                  <span>{demo.label}</span>
                  <span className="font-mono">{demo.email}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
