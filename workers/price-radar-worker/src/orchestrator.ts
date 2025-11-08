/**
 * Orchestrator - Main business logic for scanning monitors
 */

import type { Env } from './index'
import {
  getConvexClient,
  fetchMonitorsToRun,
  updateMonitorLastRun,
} from './convex-client'
import { scrapeUrls } from './scraper'
import { extractOffersWithAI, createDummyOffer } from './ai-extractor'

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
 * Run a single monitor immediately (called from HTTP endpoint)
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

    // Step 2: Scrape each URL with Firecrawl
    if (!env.FIRECRAWL_API_KEY || env.FIRECRAWL_API_KEY === 'your-firecrawl-api-key-here') {
      console.warn(`[MONITOR ${monitor._id}] Firecrawl not configured, creating dummy offer`)
      const dummyOffer = createDummyOffer({ item: monitor.queryText }, urls[0])
      await client.mutation('offers:create', {
        monitorId: monitor._id,
        userId: monitor.userId,
        title: dummyOffer.title,
        price: dummyOffer.price,
        currency: dummyOffer.currency,
        url: dummyOffer.url,
        siteName: new URL(dummyOffer.url).hostname,
        snippet: dummyOffer.snippet,
      })
    } else {
      console.log(`[MONITOR ${monitor._id}] Scraping ${urls.length} URLs with Firecrawl`)
      const scrapedContent = await scrapeUrls(env, urls, 2) // Max 2 concurrent requests

      if (scrapedContent.size === 0) {
        console.warn(`[MONITOR ${monitor._id}] No content scraped from any URL`)
        throw new Error('Failed to scrape any URLs')
      }

      console.log(`[MONITOR ${monitor._id}] Successfully scraped ${scrapedContent.size} URLs`)

      // Step 3: Extract offers with Cloudflare AI
      let allOffers: any[] = []

      for (const [url, content] of scrapedContent.entries()) {
        console.log(`[MONITOR ${monitor._id}] Processing ${content.markdown.length} chars from ${url}`)

        // Extract offers using AI with images
        const extractionResult = await extractOffersWithAI(
          env,
          content.markdown,
          monitor.queryJson || { item: monitor.queryText },
          url,
          content.images // Pass extracted images to AI
        )

        if (extractionResult.success && extractionResult.offers.length > 0) {
          console.log(`[MONITOR ${monitor._id}] AI extracted ${extractionResult.offers.length} offers from ${url}`)
          allOffers.push(...extractionResult.offers)
        } else {
          console.warn(`[MONITOR ${monitor._id}] AI extraction failed or found no offers from ${url}`)
        }
      }

      // Step 3.5: Filter offers by price and condition constraints
      let filteredOffers = allOffers
      if (monitor.queryJson) {
        const beforeFilterCount = allOffers.length

        filteredOffers = allOffers.filter(offer => {
          // Filter by price_max if specified
          if (monitor.queryJson?.price_max && offer.price > monitor.queryJson.price_max) {
            return false
          }

          // Filter by price_min if specified
          if (monitor.queryJson?.price_min && offer.price < monitor.queryJson.price_min) {
            return false
          }

          // Filter by condition if specified
          if (monitor.queryJson?.condition && offer.condition) {
            const normalizedCondition = offer.condition.toLowerCase()
            const requiredCondition = monitor.queryJson.condition.toLowerCase()

            // Map condition variations
            const conditionMap: Record<string, string[]> = {
              'new': ['new', 'nuovo', 'nueva', 'neuf'],
              'used': ['used', 'usato', 'usado', 'occasion', 'usata'],
              'refurbished': ['refurbished', 'ricondizionato', 'recondicionado', 'reconditionné', 'ricondizionata']
            }

            const acceptableConditions = conditionMap[requiredCondition] || [requiredCondition]
            const matchesCondition = acceptableConditions.some(cond => normalizedCondition.includes(cond))

            if (!matchesCondition) {
              return false
            }
          }

          return true
        })

        if (beforeFilterCount !== filteredOffers.length) {
          console.log(`[MONITOR ${monitor._id}] Filtered offers: ${beforeFilterCount} -> ${filteredOffers.length}`)
        }
      }

      // Step 4: Save extracted offers to Convex
      if (filteredOffers.length > 0) {
        console.log(`[MONITOR ${monitor._id}] Saving ${filteredOffers.length} total offers to Convex`)

        for (const offer of filteredOffers) {
          await client.mutation('offers:create', {
            monitorId: monitor._id,
            userId: monitor.userId,
            title: offer.title,
            price: offer.price,
            currency: offer.currency,
            url: offer.url,
            siteName: new URL(offer.url).hostname,
            snippet: offer.snippet,
            imageUrl: offer.imageUrl,
            condition: offer.condition,
            location: offer.location,
          })
        }

        console.log(`[MONITOR ${monitor._id}] All offers saved successfully`)
      } else {
        // Fallback: Create one dummy offer if AI found nothing
        console.warn(`[MONITOR ${monitor._id}] No offers extracted, creating fallback dummy offer`)
        const dummyOffer = createDummyOffer(
          { item: monitor.queryText },
          urls[0]
        )
        await client.mutation('offers:create', {
          monitorId: monitor._id,
          userId: monitor.userId,
          title: dummyOffer.title,
          price: dummyOffer.price,
          currency: dummyOffer.currency,
          url: dummyOffer.url,
          siteName: new URL(dummyOffer.url).hostname,
          snippet: dummyOffer.snippet,
        })
      }
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
  // Build comprehensive search query combining all available fields
  const searchParts: string[] = []

  if (queryJson.brand) searchParts.push(queryJson.brand)
  if (queryJson.model) searchParts.push(queryJson.model)
  if (queryJson.item && !searchParts.length) searchParts.push(queryJson.item) // Fallback to item if no brand/model

  const searchQuery = searchParts.join(' ') || queryJson.item || ''
  const priceMax = queryJson.price_max || ''

  switch (site.toLowerCase()) {
    case 'ebay':
      // eBay Italy search URL
      const ebayQuery = encodeURIComponent(searchQuery)
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
      const subitoQuery = encodeURIComponent(searchQuery)
      return `https://www.subito.it/annunci-italia/vendita/usato/?q=${subitoQuery}`

    case 'amazon':
      // Amazon Italy search URL
      const amazonQuery = encodeURIComponent(searchQuery)
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
