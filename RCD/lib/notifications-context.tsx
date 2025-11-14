"use client"
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { api } from "./api";
import { toast } from "sonner";

// Lightweight stub aligning with esports-rcd-frontend interface to satisfy imports in shared code builds.
export type Notification = {
  id: string
  type: 'info' | 'warning' | 'success' | 'action'
  message: string
  createdAt: string
  actionLabel?: string
  onAction?: () => void
}

type NotificationsContextValue = {
  notifications: Notification[];
  unreadCount: number;
  dismiss: (id: string) => void;
  refresh: () => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification: (notification: {
    message: string;
    type?: Notification["type"];
    id?: string;
    createdAt?: string | number;
    actionLabel?: string;
    onAction?: () => void;
  }) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2)
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false);
  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])
  const clearAll = useCallback(async () => {
    setNotifications([]);
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("rcd_token") || ""}`,
        },
      });
    } catch {}
  }, []);
  const addNotification: NotificationsContextValue['addNotification'] = useCallback((n) => {
    const id = n.id || uuid()
    const createdAt = n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString()
    setNotifications(prev => [{ id, type: n.type || 'info', message: n.message, createdAt, actionLabel: n.actionLabel, onAction: n.onAction }, ...prev.filter(x => x.id !== id)])
  }, [])
  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Direct fetch to avoid circular dependency complexity; we already imported api
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("rcd_token")
          : null;
      if (!token) {
        setNotifications((prev) => prev);
        return;
      }
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        // Unauthorized - clear client notifications silently
        setNotifications([]);
        return;
      }
      if (res.status >= 500) {
        try {
          const err = await res.json().catch(() => ({}));
          console.error("Notifications fetch server error", err);
          toast("Failed to load notifications", {
            description: err.message || `HTTP ${res.status}`,
          });
        } catch {}
        return;
      }
      if (res.ok) {
        const raw = await res.json();
        const mapped: Notification[] = raw.map((r: any) => ({
          id: r.id,
          type: (r.type as any) || "info",
          message: r.message,
          createdAt: r.createdAt,
          actionLabel: r.teamId ? "View Team" : undefined,
          onAction: r.teamId
            ? () => {
                window.location.href = `/teams/${r.teamId}`;
              }
            : undefined,
        }));
        // Merge without duplicating existing IDs, track newly added
        setNotifications((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const newlyAdded: Notification[] = [];
          for (const m of mapped) {
            if (!ids.has(m.id)) {
              newlyAdded.push(m);
            }
          }
          // Prepend newest first
          const next = [...newlyAdded, ...prev];
          // Toast and dispatch events for approvals
          newlyAdded.forEach((n) => {
            try {
              toast(n.message, {
                description: new Date(n.createdAt).toLocaleString(),
              });
            } catch {}
            if (
              n.type === "success" &&
              /approved to join team/i.test(n.message)
            ) {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("rcd:team-approved"));
              }
            }
          });
          return next;
        });
      }
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);
  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const unreadCount = notifications.length;
  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      dismiss,
      refresh,
      clearAll,
      addNotification,
    }),
    [notifications, unreadCount, dismiss, refresh, clearAll, addNotification]
  );
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (ctx) return ctx;
  // Fallback no-op context to avoid hard crashes if provider isn't mounted yet
  return {
    notifications: [],
    unreadCount: 0,
    dismiss: () => {},
    refresh: async () => {},
    clearAll: async () => {},
    addNotification: () => {},
  };
}
