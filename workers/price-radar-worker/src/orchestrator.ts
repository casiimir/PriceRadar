/**
 * Orchestrator - Main business logic for scanning monitors
 */

import type { Env } from './index'
import {
  getConvexClient,
  fetchMonitorsToRun,
  createDummyOffer,
  updateMonitorLastRun,
} from './convex-client'

export interface Monitor {
  _id: string
  userId: string
  queryText: string
  queryJson: any
  status: string
  sites: string[]
  frequencyMinutes: number
  lastRunAt?: number
}

/**
 * Main orchestration function
 * This is called by the cron trigger
 */
export async function orchestrateScans(env: Env, frequencyMinutes: number): Promise<void> {
  console.log(`[ORCHESTRATOR] Starting scan for ${frequencyMinutes}min frequency`)

  const client = getConvexClient(env)

  try {
    // Step 1: Fetch monitors that need to run
    const monitors = await fetchMonitorsToRun(client, frequencyMinutes)
    console.log(`[ORCHESTRATOR] Found ${monitors.length} monitors to process`)

    if (monitors.length === 0) {
      console.log('[ORCHESTRATOR] No monitors to process')
      return
    }

    // Step 2: Process each monitor
    const results = await Promise.allSettled(
      monitors.map((monitor: Monitor) => processMonitor(env, client, monitor))
    )

    // Step 3: Log results
    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length
    console.log(`[ORCHESTRATOR] Completed: ${succeeded} succeeded, ${failed} failed`)

  } catch (error) {
    console.error('[ORCHESTRATOR] Fatal error:', error)
    throw error
  }
}

/**
 * Process a single monitor
 */
async function processMonitor(
  env: Env,
  client: any,
  monitor: Monitor
): Promise<void> {
  console.log(`[MONITOR ${monitor._id}] Processing: "${monitor.queryText}"`)

  try {
    // Step 1: Build search URLs for each site
    const urls = buildSearchUrls(monitor)
    console.log(`[MONITOR ${monitor._id}] Generated ${urls.length} URLs to scrape`)

    // Step 2: Scrape each URL
    // TODO: Integrate Firecrawl
    // For now, we'll create a dummy offer to test the plumbing
    console.log(`[MONITOR ${monitor._id}] Creating dummy offer (scraping not yet implemented)`)
    await createDummyOffer(client, monitor._id, monitor.userId)

    // Step 3: Extract offers with AI
    // TODO: Integrate Cloudflare AI
    // For now, the dummy offer serves as a test

    // Step 4: Update monitor status
    await updateMonitorLastRun(client, monitor._id, true)
    console.log(`[MONITOR ${monitor._id}] Completed successfully`)

  } catch (error) {
    console.error(`[MONITOR ${monitor._id}] Error:`, error)
    await updateMonitorLastRun(
      client,
      monitor._id,
      false,
      error instanceof Error ? error.message : 'Unknown error'
    )
    throw error
  }
}

/**
 * Build search URLs for a monitor
 */
function buildSearchUrls(monitor: Monitor): string[] {
  const urls: string[] = []

  for (const site of monitor.sites) {
    const url = buildSiteUrl(site, monitor.queryJson || {})
    if (url) {
      urls.push(url)
    }
  }

  return urls
}

/**
 * Build URL for a specific site
 */
function buildSiteUrl(site: string, queryJson: any): string | null {
  const item = queryJson.item || ''
  const priceMax = queryJson.price_max || ''

  switch (site.toLowerCase()) {
    case 'ebay':
      // eBay Italy search URL
      const ebayQuery = encodeURIComponent(item)
      let ebayUrl = `https://www.ebay.it/sch/i.html?_nkw=${ebayQuery}`

      if (priceMax) {
        ebayUrl += `&_udhi=${priceMax}`
      }

      // Condition filter if specified
      if (queryJson.condition === 'used') {
        ebayUrl += '&LH_ItemCondition=3000' // Used
      } else if (queryJson.condition === 'new') {
        ebayUrl += '&LH_ItemCondition=1000' // New
      }

      return ebayUrl

    case 'subito':
      // Subito.it search URL
      const subitoQuery = encodeURIComponent(item)
      return `https://www.subito.it/annunci-italia/vendita/usato/?q=${subitoQuery}`

    case 'amazon':
      // Amazon Italy search URL
      const amazonQuery = encodeURIComponent(item)
      let amazonUrl = `https://www.amazon.it/s?k=${amazonQuery}`

      if (priceMax) {
        amazonUrl += `&rh=p_36:0-${priceMax * 100}` // Amazon uses cents
      }

      return amazonUrl

    default:
      console.warn(`[URL_BUILDER] Unknown site: ${site}`)
      return null
  }
}

/**
 * Rate limiter to avoid overwhelming scraping services
 */
export class RateLimiter {
  private lastCall: number = 0
  private minInterval: number

  constructor(requestsPerMinute: number = 10) {
    this.minInterval = (60 * 1000) / requestsPerMinute
  }

  async wait(): Promise<void> {
    const now = Date.now()
    const timeSinceLastCall = now - this.lastCall

    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall
      console.log(`[RATE_LIMITER] Waiting ${waitTime}ms`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    this.lastCall = Date.now()
  }
}
