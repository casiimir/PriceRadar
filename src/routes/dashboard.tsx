import { createFileRoute } from '@tanstack/react-router'
import { Plus, TrendingUp, Bell, Activity } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({ component: Dashboard })

function Dashboard() {
  // TODO: Replace with real data from Convex
  const user = {
    name: 'Demo User',
    email: 'demo@example.com',
    plan: 'free' as const,
  }

  const stats = {
    activeMonitors: 0,
    totalOffers: 0,
    newOffers: 0,
    savedAmount: 0,
  }

  const monitors = [] // Will be populated from Convex

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user.name.split(' ')[0]}!
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
              {user.plan === 'free' ? '1 max on Free' : '20 max on Pro'}
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
      {user.plan === 'free' && (
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
          <button className="btn btn-sm btn-primary">Upgrade Now</button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Monitors Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Monitors</h2>
            <button className="btn btn-primary gap-2">
              <Plus className="w-5 h-5" />
              New Monitor
            </button>
          </div>

          {monitors.length === 0 ? (
            <div className="card bg-base-200">
              <div className="card-body items-center text-center py-16">
                <Activity className="w-16 h-16 text-base-content/20 mb-4" />
                <h3 className="card-title mb-2">No monitors yet</h3>
                <p className="text-base-content/70 mb-6">
                  Create your first monitor to start finding great deals!
                </p>
                <button className="btn btn-primary gap-2">
                  <Plus className="w-5 h-5" />
                  Create Your First Monitor
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Monitor cards will go here */}
              <p>Monitors will appear here...</p>
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
                <button className="btn btn-outline btn-block justify-start">
                  <Plus className="w-4 h-4" />
                  New Monitor
                </button>
                <button className="btn btn-outline btn-block justify-start">
                  <Bell className="w-4 h-4" />
                  View All Offers
                </button>
                <button className="btn btn-outline btn-block justify-start">
                  <TrendingUp className="w-4 h-4" />
                  View History
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
    </div>
  )
}
