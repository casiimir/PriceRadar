/**
 * Helper functions for Convex queries and mutations
 */

/**
 * Plan limits configuration
 */
export const PLAN_LIMITS = {
  free: {
    maxMonitors: 1,
    minFrequencyMinutes: 30,
    maxSites: 1,
    hasEmailNotifications: false,
  },
  pro: {
    maxMonitors: 20,
    minFrequencyMinutes: 3,
    maxSites: 100, // Unlimited
    hasEmailNotifications: true,
  },
} as const

/**
 * Supported sites configuration
 */
export const SUPPORTED_SITES = [
  { id: 'ebay', name: 'eBay', domain: 'ebay.it' },
  { id: 'subito', name: 'Subito.it', domain: 'subito.it' },
  { id: 'amazon', name: 'Amazon', domain: 'amazon.it' },
  // Add more sites as needed
] as const

/**
 * Monitor status types
 */
export const MONITOR_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  ERROR: 'error',
} as const

/**
 * Offer status types
 */
export const OFFER_STATUS = {
  NEW: 'new',
  ARCHIVED: 'archived',
  CLICKED: 'clicked',
} as const

/**
 * Currency formatting
 */
export function formatPrice(price: number, currency: string): string {
  const formatter = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency,
  })
  return formatter.format(price)
}

/**
 * Time ago formatting
 */
export function timeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.href
  } catch {
    return ''
  }
}
