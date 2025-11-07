import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import type { Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/test-worker')({ component: TestWorker })

function TestWorker() {
  const [userId, setUserId] = useState<Id<'users'> | null>(null)
  const [monitorId, setMonitorId] = useState<Id<'monitors'> | null>(null)

  // Queries
  const users = useQuery(api.users.getAll)
  const monitors = useQuery(api.monitors.getAll)
  const allOffers = useQuery(api.offers.getAll, { limit: 20 })
  const offers = useQuery(
    api.offers.getByMonitorId,
    monitorId ? { monitorId } : 'skip'
  )

  // Mutations
  const createUser = useMutation(api.users.create)
  const createMonitor = useMutation(api.monitors.create)

  const handleCreateUser = async () => {
    try {
      const id = await createUser({
        email: `test-${Date.now()}@example.com`,
        name: 'Test Worker User',
        plan: 'free',
      })
      setUserId(id)
      alert(`User created: ${id}`)
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  const handleCreateMonitor = async () => {
    if (!userId) {
      alert('Please create a user first')
      return
    }

    try {
      const id = await createMonitor({
        userId,
        queryText: 'RTX 4080 under 800 EUR',
        queryJson: {
          item: 'RTX 4080',
          price_max: 800,
          condition: 'new',
        },
        sites: ['ebay'], // Free plan only allows 1 site
        frequencyMinutes: 30,
      })
      setMonitorId(id)
      alert(`Monitor created: ${id}`)
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  const triggerWorker = async () => {
    try {
      const response = await fetch('http://localhost:8787/trigger?frequency=30', {
        method: 'POST',
      })
      const result = await response.json()
      alert(JSON.stringify(result, null, 2))
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Worker Integration Test</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Actions */}
        <div className="space-y-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">1. Create Test User</h2>
              <p className="text-sm opacity-70">
                First, create a test user to own the monitor
              </p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={handleCreateUser}>
                  Create User
                </button>
              </div>
              {userId && (
                <div className="alert alert-success">
                  <span className="font-mono text-xs">{userId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">2. Create Test Monitor</h2>
              <p className="text-sm opacity-70">
                Create a monitor that searches for RTX 4080 under 800 EUR on eBay (Free plan: 1 site only)
              </p>
              <div className="card-actions justify-end">
                <button
                  className="btn btn-primary"
                  onClick={handleCreateMonitor}
                  disabled={!userId}
                >
                  Create Monitor
                </button>
              </div>
              {monitorId && (
                <div className="alert alert-success">
                  <span className="font-mono text-xs">{monitorId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">3. Trigger Worker</h2>
              <p className="text-sm opacity-70">
                Manually trigger the Cloudflare Worker to scan for offers
              </p>
              <div className="card-actions justify-end">
                <button
                  className="btn btn-secondary"
                  onClick={triggerWorker}
                  disabled={!monitorId}
                >
                  Trigger Worker
                </button>
              </div>
              <div className="alert alert-info">
                <span className="text-xs">Worker should create a dummy offer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Display */}
        <div className="space-y-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                Users
                {users && <span className="badge badge-primary">{users.length}</span>}
              </h2>
              <div className="overflow-x-auto max-h-48">
                {users === undefined && <span className="loading loading-spinner"></span>}
                {users && users.length === 0 && (
                  <p className="text-sm opacity-70">No users yet</p>
                )}
                {users && users.length > 0 && (
                  <table className="table table-xs">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>
                            <div className="badge badge-xs">{user.plan}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                Monitors
                {monitors && <span className="badge badge-primary">{monitors.length}</span>}
              </h2>
              <div className="overflow-x-auto max-h-48">
                {monitors === undefined && <span className="loading loading-spinner"></span>}
                {monitors && monitors.length === 0 && (
                  <p className="text-sm opacity-70">No monitors yet</p>
                )}
                {monitors && monitors.length > 0 && (
                  <table className="table table-xs">
                    <thead>
                      <tr>
                        <th>Query</th>
                        <th>Status</th>
                        <th>Freq</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monitors.map((monitor) => (
                        <tr key={monitor._id}>
                          <td className="max-w-xs truncate">{monitor.queryText}</td>
                          <td>
                            <div className="badge badge-xs">{monitor.status}</div>
                          </td>
                          <td>{monitor.frequencyMinutes}m</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                All Offers (Real-time)
                {allOffers && <span className="badge badge-secondary">{allOffers.length}</span>}
              </h2>
              <div className="overflow-x-auto max-h-64">
                {allOffers === undefined && <span className="loading loading-spinner"></span>}
                {allOffers && allOffers.length === 0 && (
                  <div className="alert alert-warning">
                    <span className="text-xs">No offers yet - trigger the worker!</span>
                  </div>
                )}
                {allOffers && allOffers.length > 0 && (
                  <div className="space-y-2">
                    {allOffers.map((offer) => (
                      <div key={offer._id} className="card bg-base-200">
                        <div className="card-body p-4">
                          <h3 className="font-bold text-sm">{offer.title}</h3>
                          <p className="text-xs opacity-70">{offer.snippet}</p>
                          <div className="flex gap-2 items-center">
                            <div className="badge badge-success">
                              {offer.price} {offer.currency}
                            </div>
                            <div className="badge badge-outline text-xs">
                              {offer.siteName}
                            </div>
                            {offer.status === 'new' && (
                              <div className="badge badge-secondary">NEW</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info mt-8">
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
          <h3 className="font-bold">End-to-End Test Instructions</h3>
          <ol className="text-sm list-decimal list-inside">
            <li>Create a test user (Step 1)</li>
            <li>Create a test monitor (Step 2)</li>
            <li>Trigger the Cloudflare Worker (Step 3)</li>
            <li>Watch the Offers section update in real-time via Convex!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
