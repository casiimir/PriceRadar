import { Pause, Play, Trash2, Eye, Clock, Globe, AlertCircle } from 'lucide-react'
import type { Id } from '../../convex/_generated/dataModel'

interface Monitor {
  _id: Id<'monitors'>
  queryText: string
  status: string
  sites: string[]
  frequencyMinutes: number
  lastRunAt?: number
  lastErrorAt?: number
  lastErrorMessage?: string
  createdAt: number
}

interface MonitorCardProps {
  monitor: Monitor
  offerCount?: number
  onPause?: (monitorId: Id<'monitors'>) => void
  onResume?: (monitorId: Id<'monitors'>) => void
  onDelete?: (monitorId: Id<'monitors'>) => void
  onViewOffers?: (monitorId: Id<'monitors'>) => void
}

export default function MonitorCard({
  monitor,
  offerCount = 0,
  onPause,
  onResume,
  onDelete,
  onViewOffers,
}: MonitorCardProps) {
  const isActive = monitor.status === 'active'
  const isPaused = monitor.status === 'paused'
  const hasError = monitor.status === 'error'

  const getStatusBadge = () => {
    if (hasError) {
      return <div className="badge badge-error gap-2">Error</div>
    }
    if (isPaused) {
      return <div className="badge badge-warning gap-2">Paused</div>
    }
    if (isActive) {
      return (
        <div className="badge badge-success gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          Active
        </div>
      )
    }
    return <div className="badge badge-ghost">Unknown</div>
  }

  const formatLastRun = (timestamp?: number) => {
    if (!timestamp) return 'Never'
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

  const formatSites = (sites: string[]) => {
    if (sites.length === 0) return 'No sites'
    if (sites.length === 1) return sites[0]
    if (sites.length === 2) return sites.join(', ')
    return `${sites[0]} +${sites.length - 1} more`
  }

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="card-title text-lg mb-2">{monitor.queryText}</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Every {monitor.frequencyMinutes}min</span>
              </div>
              <div className="divider divider-horizontal mx-0"></div>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>{formatSites(monitor.sites)}</span>
              </div>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Error Message */}
        {hasError && monitor.lastErrorMessage && (
          <div className="alert alert-error mt-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{monitor.lastErrorMessage}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div className="stat p-0 flex-1">
            <div className="stat-title text-xs">Offers Found</div>
            <div className="stat-value text-2xl">{offerCount}</div>
          </div>
          <div className="stat p-0 flex-1">
            <div className="stat-title text-xs">Last Scan</div>
            <div className="stat-value text-2xl">{formatLastRun(monitor.lastRunAt)}</div>
          </div>
        </div>

        <div className="divider my-2"></div>

        {/* Actions */}
        <div className="card-actions justify-end">
          <button
            className="btn btn-sm btn-ghost gap-2"
            onClick={() => onViewOffers?.(monitor._id)}
          >
            <Eye className="w-4 h-4" />
            View Offers
          </button>

          {isActive && (
            <button
              className="btn btn-sm btn-outline gap-2"
              onClick={() => onPause?.(monitor._id)}
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          )}

          {(isPaused || hasError) && (
            <button
              className="btn btn-sm btn-outline gap-2"
              onClick={() => onResume?.(monitor._id)}
            >
              <Play className="w-4 h-4" />
              Resume
            </button>
          )}

          <button
            className="btn btn-sm btn-error btn-outline gap-2"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this monitor?')) {
                onDelete?.(monitor._id)
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
