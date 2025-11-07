import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import MonitorInput from '../components/MonitorInput'
import MonitorCard from '../components/MonitorCard'
import OfferCard from '../components/OfferCard'
import type { Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/test-components')({ component: TestComponents })

function TestComponents() {
  const [submitting, setSubmitting] = useState(false)

  // Mock data
  const mockMonitor = {
    _id: 'mock-monitor-1' as Id<'monitors'>,
    queryText: 'RTX 4080 usata sotto 800€ spedita in Italia',
    status: 'active',
    sites: ['ebay', 'subito'],
    frequencyMinutes: 30,
    lastRunAt: Date.now() - 3600000, // 1 hour ago
    createdAt: Date.now() - 86400000, // 1 day ago
  }

  const mockMonitorPaused = {
    _id: 'mock-monitor-2' as Id<'monitors'>,
    queryText: 'MacBook Pro M2 nuovo massimo 2000€',
    status: 'paused',
    sites: ['amazon'],
    frequencyMinutes: 30,
    lastRunAt: Date.now() - 7200000, // 2 hours ago
    createdAt: Date.now() - 172800000, // 2 days ago
  }

  const mockMonitorError = {
    _id: 'mock-monitor-3' as Id<'monitors'>,
    queryText: 'Borsa vintage Gucci',
    status: 'error',
    sites: ['ebay'],
    frequencyMinutes: 30,
    lastRunAt: Date.now() - 1800000, // 30 min ago
    lastErrorAt: Date.now() - 1800000,
    lastErrorMessage: 'Failed to connect to scraping service',
    createdAt: Date.now() - 259200000, // 3 days ago
  }

  const mockOffer = {
    _id: 'mock-offer-1' as Id<'offers'>,
    title: 'NVIDIA GeForce RTX 4080 16GB - Usata Perfette Condizioni',
    price: 750,
    currency: 'EUR',
    url: 'https://ebay.it/item/12345',
    siteName: 'ebay.it',
    snippet:
      'Scheda video RTX 4080 usata solo 6 mesi, perfettamente funzionante. Include scatola originale.',
    imageUrl: 'https://placehold.co/400x300/1a1a2e/ffffff?text=RTX+4080',
    condition: 'Used - Excellent',
    location: 'Milano, IT',
    status: 'new',
    foundAt: Date.now() - 600000, // 10 min ago
  }

  const mockOfferOld = {
    _id: 'mock-offer-2' as Id<'offers'>,
    title: 'Apple MacBook Pro 14" M2 Pro 16GB 512GB Space Gray',
    price: 1899,
    currency: 'EUR',
    url: 'https://amazon.it/item/67890',
    siteName: 'amazon.it',
    snippet: 'MacBook Pro nuovo sigillato, garanzia ufficiale Apple Italia 2 anni.',
    condition: 'New',
    location: 'Spedito da Amazon',
    status: 'clicked',
    foundAt: Date.now() - 3600000, // 1 hour ago
  }

  const handleMonitorSubmit = async (query: string) => {
    setSubmitting(true)
    console.log('Creating monitor:', query)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    alert(`Monitor created: "${query}"`)
    setSubmitting(false)
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8">Component Testing</h1>

      {/* Monitor Input */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">AI Prompt Bar (MonitorInput)</h2>
        <MonitorInput onSubmit={handleMonitorSubmit} disabled={submitting} />
      </section>

      {/* Monitor Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Monitor Cards</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Active Monitor</h3>
            <MonitorCard
              monitor={mockMonitor}
              offerCount={5}
              onPause={(id) => alert(`Pausing monitor: ${id}`)}
              onDelete={(id) => alert(`Deleting monitor: ${id}`)}
              onViewOffers={(id) => alert(`Viewing offers for: ${id}`)}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Paused Monitor</h3>
            <MonitorCard
              monitor={mockMonitorPaused}
              offerCount={2}
              onResume={(id) => alert(`Resuming monitor: ${id}`)}
              onDelete={(id) => alert(`Deleting monitor: ${id}`)}
              onViewOffers={(id) => alert(`Viewing offers for: ${id}`)}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Error State Monitor</h3>
            <MonitorCard
              monitor={mockMonitorError}
              offerCount={0}
              onResume={(id) => alert(`Resuming monitor: ${id}`)}
              onDelete={(id) => alert(`Deleting monitor: ${id}`)}
              onViewOffers={(id) => alert(`Viewing offers for: ${id}`)}
            />
          </div>
        </div>
      </section>

      {/* Offer Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Offer Cards</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">New Offer (with image)</h3>
            <OfferCard
              offer={mockOffer}
              onArchive={(id) => alert(`Archiving offer: ${id}`)}
              onView={(id, url) => console.log(`Viewing offer ${id}: ${url}`)}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Clicked Offer (no image)</h3>
            <OfferCard
              offer={{ ...mockOfferOld, imageUrl: undefined }}
              onArchive={(id) => alert(`Archiving offer: ${id}`)}
              onView={(id, url) => console.log(`Viewing offer ${id}: ${url}`)}
            />
          </div>
        </div>
      </section>

      {/* Layout Test */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Combined Layout Test</h2>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">Monitors</h3>
            <MonitorCard monitor={mockMonitor} offerCount={3} />
            <MonitorCard monitor={mockMonitorPaused} offerCount={1} />

            <h3 className="text-lg font-semibold mt-6">Offers for Selected Monitor</h3>
            <OfferCard offer={mockOffer} />
            <OfferCard offer={mockOfferOld} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sidebar</h3>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h4 className="card-title text-base">Quick Stats</h4>
                <div className="stats stats-vertical shadow">
                  <div className="stat">
                    <div className="stat-title">Active Monitors</div>
                    <div className="stat-value text-primary">2</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">New Offers</div>
                    <div className="stat-value text-secondary">5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
