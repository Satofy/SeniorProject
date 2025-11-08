"use client"
import React from 'react'
import { useNotifications } from '@/lib/notifications-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Info, AlertCircle, CheckCircle2, Bell, X } from 'lucide-react'

const iconFor: Record<string, React.ReactNode> = {
  info: <Info className="w-4 h-4" />,
  warning: <AlertCircle className="w-4 h-4" />,
  success: <CheckCircle2 className="w-4 h-4" />,
  action: <Bell className="w-4 h-4" />,
}

export function NotificationBar() {
  const { user } = useAuth()
  const { notifications, dismiss, clearAll } = useNotifications()
  
  // Only show for logged-in users
  if (!user) return null
  
  // Always show the bar when logged in, even if empty
  return (
    <div className="border-b border-border bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-2">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-between gap-4 rounded-md px-3 py-2 text-sm bg-card/60 border border-border shadow-sm">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="font-medium text-muted-foreground">No new notifications</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearAll()}
                className="h-6 px-2 text-xs"
              >
                Clear All
              </Button>
            </div>
            {notifications.map(n => (
              <div
                key={n.id}
                className={cn(
                  'flex items-center justify-between gap-4 rounded-md px-3 py-2 text-sm',
                  'bg-card/60 border border-border shadow-sm',
                )}
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 text-primary">{iconFor[n.type]}</span>
                  <span className="font-medium truncate" title={n.message}>{n.message}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {n.onAction && n.actionLabel && (
                    <Button size="sm" variant="outline" onClick={n.onAction} aria-label={n.actionLabel}>{n.actionLabel}</Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Dismiss notification"
                    onClick={() => dismiss(n.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
