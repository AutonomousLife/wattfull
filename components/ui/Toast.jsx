"use client";
import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { Icon } from "./Icon";

/* ═══════════════════════════════════════════════════════════════════════════
   Toast system — context + component.
   Usage:
     1) Wrap your app (or page) with <ToastProvider>
     2) Call useToast() anywhere to get { toast }
     3) toast("Message", { type: "success" | "error" | "info", duration: 3000 })
   ═══════════════════════════════════════════════════════════════════════════ */

const ToastCtx = createContext(null);

const ICONS = { success: "Check", error: "AlertCircle", info: "Info", warn: "AlertTriangle" };
const COLORS = {
  success: { bg: "#d1fae5", border: "#10b981", icon: "#059669", text: "#065f46" },
  error:   { bg: "#fee2e2", border: "#ef4444", icon: "#dc2626", text: "#7f1d1d" },
  info:    { bg: "#eff6ff", border: "#3b82f6", icon: "#2563eb", text: "#1e3a8a" },
  warn:    { bg: "#fef3c7", border: "#f59e0b", icon: "#d97706", text: "#92400e" },
};
const DARK_COLORS = {
  success: { bg: "#064e3b", border: "#10b981", icon: "#34d399", text: "#6ee7b7" },
  error:   { bg: "#450a0a", border: "#ef4444", icon: "#f87171", text: "#fca5a5" },
  info:    { bg: "#1e3a5f", border: "#3b82f6", icon: "#60a5fa", text: "#93c5fd" },
  warn:    { bg: "#451a03", border: "#f59e0b", icon: "#fbbf24", text: "#fde68a" },
};

let _toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 250);
  }, []);

  const toast = useCallback((message, { type = "success", duration = 3200 } = {}) => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  return (
    <ToastCtx.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

function ToastContainer({ toasts, dismiss }) {
  const { dark } = useTheme();
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} dark={dark} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, dark, onDismiss }) {
  const C = dark ? DARK_COLORS[toast.type] : COLORS[toast.type];
  const iconName = ICONS[toast.type];

  return (
    <div
      className={toast.exiting ? "wf-toast-exit" : "wf-toast-enter"}
      style={{
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: "var(--r-lg)",
        background: C.bg,
        border: `1.5px solid ${C.border}`,
        boxShadow: "var(--sh-lg)",
        minWidth: 240,
        maxWidth: 360,
        cursor: "pointer",
      }}
      onClick={onDismiss}
    >
      <Icon name={iconName} size={17} color={C.icon} strokeWidth={2.5} />
      <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>
        {toast.message}
      </span>
      <Icon name="X" size={14} color={C.icon} strokeWidth={2} style={{ opacity: 0.6, flexShrink: 0 }} />
    </div>
  );
}
