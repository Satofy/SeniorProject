"use client"
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { toast } from "sonner";

// Lightweight stub aligning with esports-rcd-frontend interface to satisfy imports in shared code builds.
export type Notification = {
  id: string;
  type: "info" | "warning" | "success" | "action";
  message: string;
  createdAt: string;
  actionLabel?: string;
  onAction?: () => void;
  read?: boolean;
};

type NotificationsContextValue = {
  notifications: Notification[];
  unreadCount: number;
  dismiss: (id: string) => void;
  refresh: () => Promise<void>;
  clearAll: () => Promise<void>;
  markAllRead: () => Promise<void>;
  addNotification: (notification: {
    message: string;
    type?: Notification["type"];
    id?: string;
    createdAt?: string | number;
    actionLabel?: string;
    onAction?: () => void;
  }) => void;
};

const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  const isReal = API_BASE.length > 0;
  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rcd_token") : null;
      if (token && isReal) {
        fetch(`${API_BASE}/api/notifications/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch {}
  }, [API_BASE, isReal]);
  const clearAll = useCallback(async () => {
    setNotifications([]);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rcd_token") : null;
      if (!token) return;
      const url = isReal ? `${API_BASE}/api/notifications` : `/api/notifications`;
      await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  }, [API_BASE, isReal]);
  const addNotification: NotificationsContextValue["addNotification"] =
    useCallback((n) => {
      const id = n.id || uuid();
      const createdAt = n.createdAt
        ? new Date(n.createdAt).toISOString()
        : new Date().toISOString();
      setNotifications((prev) => [
        {
          id,
          type: n.type || "info",
          message: n.message,
          createdAt,
          actionLabel: n.actionLabel,
          onAction: n.onAction,
          read: false,
        },
        ...prev.filter((x) => x.id !== id),
      ]);
    }, []);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rcd_token") : null;
      if (!token) return;
      const url = isReal ? `${API_BASE}/api/notifications` : `/api/notifications`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        if (res.status >= 500) {
          const err = await res.json().catch(() => ({}));
          console.error("Notifications fetch server error", err);
          try {
            toast("Failed to load notifications", { description: err.message || `HTTP ${res.status}` });
          } catch {}
        }
        return;
      }
      const raw = await res.json();
      const mapped: Notification[] = (raw || []).map((r: any) => ({
        id: String(r.id || r._id || uuid()),
        type: (r.type as any) || "info",
        message: r.message,
        createdAt: r.createdAt || new Date().toISOString(),
        actionLabel: r?.metadata?.teamId ? "View Team" : undefined,
        onAction: r?.metadata?.teamId
          ? () => {
              window.location.href = `/teams/${r.metadata.teamId}`;
            }
          : undefined,
        read: typeof r.read === "boolean" ? r.read : false,
      }));
      setNotifications((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const newlyAdded: Notification[] = [];
        for (const m of mapped) {
          if (!ids.has(m.id)) newlyAdded.push(m);
        }
        newlyAdded.forEach((n) => {
          try {
            toast(n.message, { description: new Date(n.createdAt).toLocaleString() });
          } catch {}
          if (n.type === "success" && /approved to join team/i.test(n.message)) {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("rcd:team-approved"));
            }
          }
        });
        return [...newlyAdded, ...prev];
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }, [API_BASE, isReal]);
  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const markAllRead = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rcd_token") : null;
      if (!token) return;
      const url = isReal ? `${API_BASE}/api/notifications/read` : `/api/notifications/read`;
      await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  }, [API_BASE, isReal]);

  useEffect(() => {
    load();
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("rcd_token");
    let cleanup: (() => void) | undefined;
    if (isReal && token && typeof EventSource !== "undefined") {
      let stopped = false;
      let source: EventSource | null = null;
      let retryMs = 2000;
      const connect = () => {
        if (stopped) return;
        source = new EventSource(`${API_BASE}/api/notifications/stream?token=${encodeURIComponent(token)}`);
        const onNotification = (event: MessageEvent) => {
          try {
            const payload = JSON.parse(event.data) as any;
            const mapped: Notification = {
              id: String(payload.id || payload._id || uuid()),
              type: (payload.type as any) || "info",
              message: payload.message,
              createdAt: payload.createdAt || new Date().toISOString(),
              actionLabel: payload?.metadata?.teamId ? "View Team" : undefined,
              onAction: payload?.metadata?.teamId
                ? () => {
                    window.location.href = `/teams/${payload.metadata.teamId}`;
                  }
                : undefined,
              read: typeof payload.read === "boolean" ? payload.read : false,
            };
            setNotifications((prev) => [mapped, ...prev.filter((n) => n.id !== mapped.id)]);
          } catch (err) {
            console.error("Failed to parse notification payload", err);
          }
        };
        // Some servers send named events; also handle default message
        source.addEventListener("notification", onNotification as any);
        source.onmessage = onNotification;
        source.onopen = () => {
          retryMs = 2000;
        };
        source.onerror = () => {
          try { source && source.close(); } catch {}
          if (stopped) return;
          setTimeout(connect, retryMs);
          retryMs = Math.min(retryMs * 2, 15000);
        };
      };
      connect();
      const fallback = setInterval(() => {
        load();
      }, 5 * 60_000);
      cleanup = () => {
        stopped = true;
        try { source && source.close(); } catch {}
        clearInterval(fallback);
      };
      return cleanup;
    } else {
      const interval = setInterval(load, 15000);
      cleanup = () => clearInterval(interval);
      return cleanup;
    }
  }, [API_BASE, isReal, load]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      dismiss,
      refresh,
      clearAll,
      addNotification,
      markAllRead,
    }),
    [
      notifications,
      unreadCount,
      dismiss,
      refresh,
      clearAll,
      addNotification,
      markAllRead,
    ]
  );
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (ctx) return ctx;
  // Fallback no-op context to avoid hard crashes if provider isn't mounted yet
  return {
    notifications: [],
    unreadCount: 0,
    dismiss: () => {},
    refresh: async () => {},
    clearAll: async () => {},
    markAllRead: async () => {},
    addNotification: () => {},
  };
}
