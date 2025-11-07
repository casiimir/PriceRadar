/**
 * Price Radar Worker
 *
 * Cloudflare Worker that orchestrates web scraping for Price Radar.
 * Runs on cron triggers to check monitors and find deals.
 */

import { orchestrateScans } from './orchestrator'

export interface Env {
  // Secrets (set via wrangler secret put)
  CONVEX_URL: string
  CONVEX_DEPLOY_KEY: string
  FIRECRAWL_API_KEY?: string
  SENTRY_DSN?: string

  // Bindings
  AI?: any // Cloudflare AI binding
  CACHE?: KVNamespace // KV for caching

  // Variables
  ENVIRONMENT: string
}

/**
 * Main Worker export
 */
export default {
  /**
   * Scheduled event handler (Cron Triggers)
   */
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log('[CRON] Triggered at:', new Date(event.scheduledTime).toISOString())

    try {
      // Determine which frequency this cron is for
      const cron = event.cron
      let frequencyMinutes: number

      if (cron === '*/3 * * * *') {
        frequencyMinutes = 3 // Pro users
        console.log('[CRON] Running Pro scan (3 min)')
      } else if (cron === '*/30 * * * *') {
        frequencyMinutes = 30 // Free users
        console.log('[CRON] Running Free scan (30 min)')
      } else {
        console.log('[CRON] Unknown cron pattern:', cron)
        return
      }

      // Run the orchestration
      await orchestrateScans(env, frequencyMinutes)

    } catch (error) {
      console.error('[CRON] Error:', error)
      // TODO: Send to Sentry
      throw error
    }
  },

  /**
   * HTTP request handler (for testing and webhooks)
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url)

    // CORS headers for local development
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.ENVIRONMENT,
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }

    // Manual trigger for testing
    if (url.pathname === '/trigger' && request.method === 'POST') {
      const frequencyMinutes = parseInt(url.searchParams.get('frequency') || '30')

      try {
        await orchestrateScans(env, frequencyMinutes)
        return new Response(JSON.stringify({
          success: true,
          message: `Scan triggered for ${frequencyMinutes}min frequency`
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        })
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        })
      }
    }

    return new Response('Price Radar Worker v1.0', {
      status: 200,
      headers: corsHeaders
    })
  },
}
