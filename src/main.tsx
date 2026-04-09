import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/themes.css";
import React from "react";
import { loadSavedTheme } from "./lib/themes/themeEngine";

// Apply saved theme before first render to avoid flash
loadSavedTheme();

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', color: 'red', background: '#0a0a0a', minHeight: '100vh' }}>
          <h2 style={{ color: '#ff4444' }}>App crashed — please report this error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#ff8888' }}>
            {(this.state.error as Error).message}
            {'\n\n'}
            {(this.state.error as Error).stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
