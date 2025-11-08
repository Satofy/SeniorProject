"use client"
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'

export type Notification = {
  id: string
  type: 'info' | 'warning' | 'success' | 'action'
  message: string
  createdAt: string
  actionLabel?: string
  onAction?: () => void
}

type NotificationsContextValue = {
  notifications: Notification[]
  unreadCount: number
  dismiss: (id: string) => void
  refresh: () => Promise<void>
  clearAll: () => void
  addNotification: (notification: {
    message: string
    type?: Notification['type']
    id?: string
    createdAt?: string | number
    actionLabel?: string
    onAction?: () => void
  }) => void
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

function loadDismissed(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem('rcd_dismissed_notifs')
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function saveDismissed(ids: Set<string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem('rcd_dismissed_notifs', JSON.stringify(Array.from(ids)))
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [systemNotifications, setSystemNotifications] = useState<Notification[]>([])
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([])
  const dismissed = React.useRef<Set<string>>(loadDismissed())

  const dismiss = useCallback((id: string) => {
    dismissed.current.add(id)
    saveDismissed(dismissed.current)
    setSystemNotifications((prev) => prev.filter((n) => n.id !== id))
    setLocalNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    const all = [...systemNotifications, ...localNotifications]
    all.forEach((n) => dismissed.current.add(n.id))
    setSystemNotifications([])
    setLocalNotifications([])
    saveDismissed(dismissed.current)
  }, [localNotifications, systemNotifications])

  const refresh = useCallback(async () => {
    if (!user) {
      setSystemNotifications([])
      setLocalNotifications([])
      return
    }
    const list: Notification[] = []

    // Pending requests notification for managers
    try {
      if (user.role === 'team_manager') {
        // fetch team via users teamId maybe: need team membership; call getTeams and find where managerId = user.id
        const teams = await api.getTeams()
        const managed = teams.filter(t => t.managerId === user.id)
        const results = await Promise.all(managed.map(async (t) => {
          try {
            const reqs = await api.getTeamRequests(t.id)
            return { team: t, count: reqs.length }
          } catch {
            return { team: t, count: 0 }
          }
        }))
        for (const { team: t, count } of results) {
          if (count > 0) {
            const id = `pending-${t.id}`
            if (!dismissed.current.has(id)) {
              list.push({
                id,
                type: 'action',
                message: `${count} pending request${count === 1 ? '' : 's'} for team ${t.name}`,
                createdAt: new Date().toISOString(),
                actionLabel: 'Review',
                onAction: () => {
                  window.location.href = `/teams/${t.id}`
                }
              })
            }
          }
        }
      }
    } catch {}

    // Player: show confirmation after a recent join request
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('rcd_last_join_req') : null
      if (raw) {
        const parsed = JSON.parse(raw) as { teamId: string; ts: number }
        const fresh = Date.now() - parsed.ts < 1000 * 60 * 60 * 2 // 2 hours
        const id = `join-${parsed.teamId}`
        if (fresh && !dismissed.current.has(id)) {
          list.push({
            id,
            type: 'success',
            message: 'Your join request was sent successfully.',
            createdAt: new Date(parsed.ts).toISOString(),
            actionLabel: 'View team',
            onAction: () => { window.location.href = `/teams/${parsed.teamId}` },
          })
        }
        if (!fresh) {
          localStorage.removeItem('rcd_last_join_req')
        }
      }
    } catch {}

    // Generic announcement placeholder
    const announceId = 'announce-welcome-v1'
    if (!dismissed.current.has(announceId)) {
      list.push({ id: announceId, type: 'info', message: 'Welcome to RCD Esports – manage teams & tournaments seamlessly.', createdAt: new Date().toISOString() })
    }

    setSystemNotifications(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }, [user])

  useEffect(() => {
    let timer: any
    refresh()
    timer = setInterval(() => {
      refresh()
    }, 60_000)
    const handler = () => refresh()
    if (typeof window !== 'undefined') {
      window.addEventListener('rcd-notifications-refresh', handler)
    }
    return () => {
      clearInterval(timer)
      if (typeof window !== 'undefined') {
        window.removeEventListener('rcd-notifications-refresh', handler)
      }
    }
  }, [refresh])

  const notifications = useMemo(() => {
    return [...systemNotifications, ...localNotifications]
      .filter((n) => !dismissed.current.has(n.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [localNotifications, systemNotifications])

  const unreadCount = notifications.length

  const addNotification: NotificationsContextValue['addNotification'] = useCallback((notification) => {
    const id = notification.id ?? generateId()
    const createdAt = notification.createdAt
      ? new Date(notification.createdAt).toISOString()
      : new Date().toISOString()

    dismissed.current.delete(id)
    setLocalNotifications((prev) => [
      {
        id,
        type: notification.type ?? 'info',
        message: notification.message,
        createdAt,
        actionLabel: notification.actionLabel,
        onAction: notification.onAction,
      },
      ...prev.filter((n) => n.id !== id),
    ])
  }, [])

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, dismiss, refresh, clearAll, addNotification }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
