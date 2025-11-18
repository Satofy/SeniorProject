import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Relative time utility used by admin/audit views
export function formatRelativeTime(dateInput: string | number | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  const diffMs = Date.now() - date.getTime()
  const absMs = Math.abs(diffMs)
  const sec = Math.floor(absMs / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  const suffix = diffMs >= 0 ? 'ago' : 'from now'
  if (day > 0) return `${day}d ${suffix}`
  if (hr > 0) return `${hr}h ${suffix}`
  if (min > 0) return `${min}m ${suffix}`
  return `${sec}s ${suffix}`
}

export function formatCurrency(value: number, currency: string = 'USD', locale: string = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
  } catch {
    // Fallback
    return `$${(Number(value) || 0).toFixed(2)}`
  }
}
