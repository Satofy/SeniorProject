import React from 'react'
import { cn } from '@/lib/utils'

// Consolidated single Skeleton component
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-muted/40 dark:bg-muted/20', className)}
      aria-busy="true"
      aria-hidden="true"
      {...props}
    />
  )
}
