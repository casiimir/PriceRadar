import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, TrendingUp, Bell, Activity } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import MonitorCard from '../components/MonitorCard'
import MonitorInput from '../components/MonitorInput'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard')({ component: Dashboard })

function Dashboard() {
  // State for modal
  const [showCreateModal, setShowCreateModal] = useState(false)

  // TODO: Get from auth when implemented
  // For now, use first user from database
  const users = useQuery(api.users.getAll)
  const user = users?.[0]

  // Get user's monitors
  const monitors = useQuery(
    api.monitors.getByUserId,
    user ? { userId: user._id as Id<'users'> } : 'skip'
  )

  // Get all offers for this user
  const allOffers = useQuery(
    api.offers.getByUserId,
    user ? { userId: user._id as Id<'users'> } : 'skip'
  )

  // Calculate stats
  const stats = {
    activeMonitors: monitors?.filter((m) => m.status === 'active').length ?? 0,
    totalOffers: allOffers?.length ?? 0,
    newOffers: allOffers?.filter((o) => o.status === 'new').length ?? 0,
    savedAmount: 0, // TODO: Calculate from offers
  }

  // Mutations
  const updateMonitorStatus = useMutation(api.monitors.updateStatus)
  const deleteMonitor = useMutation(api.monitors.remove)
  const archiveOffer = useMutation(api.offers.archive)
  const createMonitor = useMutation(api.monitors.createFromUI)

  // Helper function to get offers for a monitor
  const getOffersForMonitor = (monitorId: Id<'monitors'>) => {
    return allOffers?.filter((offer) => offer.monitorId === monitorId) ?? []
  }

  // Handlers
  const handlePause = async (monitorId: Id<'monitors'>) => {
    await updateMonitorStatus({ monitorId, status: 'paused' })
  }

  const handleResume = async (monitorId: Id<'monitors'>) => {
    await updateMonitorStatus({ monitorId, status: 'active' })
  }

  const handleDelete = async (monitorId: Id<'monitors'>) => {
    await deleteMonitor({ monitorId })
  }

  const handleArchiveOffer = async (offerId: Id<'offers'>) => {
    await archiveOffer({ offerId })
  }

  const handleCreateMonitor = async (query: string) => {
    if (!user) {
      throw new Error('User not found')
    }

    try {
      // Create the monitor in Convex
      const monitorId = await createMonitor({ userId: user._id, queryText: query })
      setShowCreateModal(false)

      // Trigger immediate execution via Worker
      // Note: This runs in background, don't wait for it
      fetch('http://localhost:8787/run-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monitorId }),
      })
        .then((res) => res.json())
        .then((data) => console.log('[MONITOR] Immediate execution triggered:', data))
        .catch((err) => console.warn('[MONITOR] Failed to trigger immediate execution:', err))
    } catch (error) {
      // Error will be shown by MonitorInput component
      throw error
    }
  }

  const isLoading = !user || monitors === undefined

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0] ?? 'there'}!
        </h1>
        <p className="text-base-content/70">
          Here is what is happening with your monitors
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Activity className="w-8 h-8" />
            </div>
            <div className="stat-title">Active Monitors</div>
            <div className="stat-value text-primary">{stats.activeMonitors}</div>
            <div className="stat-desc">
              {user!.plan === 'free' ? '1 max on Free' : '20 max on Pro'}
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <Bell className="w-8 h-8" />
            </div>
            <div className="stat-title">New Offers</div>
            <div className="stat-value text-secondary">{stats.newOffers}</div>
            <div className="stat-desc">Waiting for your review</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-accent">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Offers</div>
            <div className="stat-value text-accent">{stats.totalOffers}</div>
            <div className="stat-desc">All time</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Saved</div>
            <div className="stat-value text-success">€{stats.savedAmount}</div>
            <div className="stat-desc">vs retail price</div>
          </div>
        </div>
      </div>

      {/* Plan Banner */}
      {user!.plan === 'free' && (
        <div className="alert alert-info mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h3 className="font-bold">You are on the Free plan</h3>
            <div className="text-xs">
              Upgrade to Pro for 20 monitors, 3-minute scans, and email notifications!
            </div>
          </div>
          <Link to="/pricing" className="btn btn-sm btn-primary">
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Monitors Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Monitors</h2>
            <button className="btn btn-primary gap-2" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5" />
              New Monitor
            </button>
          </div>

          {!monitors || monitors.length === 0 ? (
            <div className="card bg-base-200">
              <div className="card-body items-center text-center py-16">
                <Activity className="w-16 h-16 text-base-content/20 mb-4" />
                <h3 className="card-title mb-2">No monitors yet</h3>
                <p className="text-base-content/70 mb-6">
                  Create your first monitor to start finding great deals!
                </p>
                <button
                  className="btn btn-primary gap-2"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Monitor
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {monitors.map((monitor) => (
                <MonitorCard
                  key={monitor._id}
                  monitor={monitor}
                  offers={getOffersForMonitor(monitor._id)}
                  onPause={handlePause}
                  onResume={handleResume}
                  onDelete={handleDelete}
                  onArchiveOffer={handleArchiveOffer}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  className="btn btn-outline btn-block justify-start"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  New Monitor
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Recent Activity</h3>
              <div className="text-center py-8 text-base-content/50">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No recent activity</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="card-body">
              <h3 className="card-title text-lg mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-base-content/70">
                Use natural language in your queries! Try "RTX 4080 usata sotto 800 euro" instead
                of keywords.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Monitor Modal */}
      {showCreateModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg mb-4">Create New Monitor</h3>
            <MonitorInput onSubmit={handleCreateMonitor} />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowCreateModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}
