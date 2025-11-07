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
import { scrapeUrls } from './scraper'

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
 * Orchestrates scheduled monitor scans for a given frequency by fetching monitors due to run and processing them concurrently.
 *
 * @param frequencyMinutes - The frequency in minutes used to select which monitors are due to run
 * @throws Propagates any unrecoverable error encountered while fetching or processing monitors
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
 * Execute a single monitor run for the given monitor ID.
 *
 * @param monitorId - ID of the monitor to run
 * @returns An object with `offersFound` set to the number of offers discovered (currently returns `1` as a placeholder)
 * @throws Error if the monitor does not exist, is not active, or if processing fails
 */
export async function runSingleMonitor(
  env: Env,
  monitorId: string
): Promise<{ offersFound: number }> {
  console.log(`[RUN-SINGLE] Executing monitor ${monitorId}`)

  const client = getConvexClient(env)

  try {
    // Fetch the monitor from Convex
    const monitor = await client.query('monitors:getById', { monitorId })

    if (!monitor) {
      throw new Error(`Monitor ${monitorId} not found`)
    }

    if (monitor.status !== 'active') {
      throw new Error(`Monitor ${monitorId} is not active (status: ${monitor.status})`)
    }

    // Process the monitor
    await processMonitor(env, client, monitor)

    return { offersFound: 1 } // TODO: Return actual count when AI extraction is implemented
  } catch (error) {
    console.error(`[RUN-SINGLE] Error:`, error)
    throw error
  }
}

/**
 * Process a monitor: build search URLs, scrape content (if Firecrawl is configured), create offers, and record the monitor's last run result.
 *
 * Builds search URLs from the monitor configuration, uses Firecrawl to fetch page content when a valid `FIRECRAWL_API_KEY` is present (falls back to creating a dummy offer otherwise), and updates the monitor's lastRun status to indicate success. On error, updates the monitor last run as failed with the error message and rethrows the error.
 *
 * @param env - Runtime environment (used for `FIRECRAWL_API_KEY` and other configuration)
 * @param monitor - The monitor record to process (contains `_id`, `userId`, `queryText`, `queryJson`, `sites`, etc.)
 *
 * @throws Error if scraping yields no content or if any processing step fails.
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

    // Step 2: Scrape each URL with Firecrawl
    if (!env.FIRECRAWL_API_KEY || env.FIRECRAWL_API_KEY === 'your-firecrawl-api-key-here') {
      console.log(`[MONITOR ${monitor._id}] Firecrawl not configured, creating dummy offer`)
      await createDummyOffer(client, monitor._id, monitor.userId)
    } else {
      console.log(`[MONITOR ${monitor._id}] Scraping ${urls.length} URLs with Firecrawl`)
      const scrapedContent = await scrapeUrls(env, urls, 2) // Max 2 concurrent requests

      if (scrapedContent.size === 0) {
        console.warn(`[MONITOR ${monitor._id}] No content scraped from any URL`)
        throw new Error('Failed to scrape any URLs')
      }

      console.log(`[MONITOR ${monitor._id}] Successfully scraped ${scrapedContent.size} URLs`)

      // Step 3: Extract offers with AI
      // TODO: Integrate Cloudflare AI for extraction
      // For now, log the scraped content
      for (const [url, content] of scrapedContent.entries()) {
        console.log(`[MONITOR ${monitor._id}] Scraped ${content.markdown.length} chars from ${url}`)
      }

      // Create a dummy offer with scraped content reference
      console.log(`[MONITOR ${monitor._id}] AI extraction not yet implemented, creating dummy offer`)
      await createDummyOffer(client, monitor._id, monitor.userId)
    }

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