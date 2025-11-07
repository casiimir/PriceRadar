/**
 * Firecrawl Scraper Client
 *
 * Wrapper around Firecrawl SDK for scraping e-commerce sites
 */

import FirecrawlApp from '@mendable/firecrawl-js'
import type { Env } from './index'

export interface ScrapedContent {
  html: string
  markdown: string
  text: string
  metadata?: {
    title?: string
    description?: string
    language?: string
    sourceURL?: string
  }
}

/**
 * Get Firecrawl client instance
 */
export function getFirecrawlClient(env: Env): FirecrawlApp {
  if (!env.FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY not configured')
  }

  return new FirecrawlApp({ apiKey: env.FIRECRAWL_API_KEY })
}

/**
 * Scrape a single URL and return cleaned content
 */
export async function scrapeUrl(
  env: Env,
  url: string
): Promise<ScrapedContent> {
  console.log(`[SCRAPER] Scraping URL: ${url}`)

  try {
    const client = getFirecrawlClient(env)

    // Use Firecrawl's scrape endpoint (v1 API uses 'scrape' method)
    const result = await client.scrape(url, {
      formats: ['markdown', 'html'],
      onlyMainContent: true, // Extract only main content, skip nav/footer/ads
      waitFor: 2000, // Wait for dynamic content to load
    })

    // Firecrawl returns data directly without success wrapper
    if (!result || !result.markdown) {
      console.error(`[SCRAPER] Invalid Firecrawl response for ${url}:`, JSON.stringify(result).substring(0, 500))
      throw new Error(`Firecrawl scrape failed: no markdown content returned`)
    }

    console.log(`[SCRAPER] Successfully scraped: ${url} (${result.markdown.length} chars)`)

    return {
      html: result.html || '',
      markdown: result.markdown || '',
      text: result.markdown || '', // Use markdown as text fallback
      metadata: result.metadata || {},
    }
  } catch (error) {
    console.error(`[SCRAPER] Error scraping ${url}:`, error)
    throw error
  }
}

/**
 * Scrape multiple URLs in parallel with rate limiting
 */
export async function scrapeUrls(
  env: Env,
  urls: string[],
  maxConcurrent: number = 3
): Promise<Map<string, ScrapedContent>> {
  console.log(`[SCRAPER] Scraping ${urls.length} URLs (max ${maxConcurrent} concurrent)`)

  const results = new Map<string, ScrapedContent>()
  const errors = new Map<string, Error>()

  // Process URLs in batches to respect rate limits
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent)
    console.log(`[SCRAPER] Processing batch ${i / maxConcurrent + 1} (${batch.length} URLs)`)

    const batchPromises = batch.map(async (url) => {
      try {
        const content = await scrapeUrl(env, url)
        results.set(url, content)
      } catch (error) {
        console.error(`[SCRAPER] Failed to scrape ${url}:`, error)
        errors.set(url, error instanceof Error ? error : new Error('Unknown error'))
      }
    })

    await Promise.allSettled(batchPromises)

    // Add delay between batches to avoid rate limiting
    if (i + maxConcurrent < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  console.log(`[SCRAPER] Completed: ${results.size} succeeded, ${errors.size} failed`)

  return results
}
