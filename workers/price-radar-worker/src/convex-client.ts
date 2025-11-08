/**
 * Convex Client for Cloudflare Workers
 *
 * Provides functions to interact with Convex database from the worker.
 */

import type { Env } from './index'

/**
 * Convex HTTP API client
 * Since Convex client doesn't work in Workers, we use the HTTP API
 */
export class ConvexClient {
  private baseUrl: string
  private deployKey: string

  constructor(convexUrl: string, deployKey: string) {
    this.baseUrl = convexUrl.replace('/api', '')
    this.deployKey = deployKey
  }

  /**
   * Call a Convex query
   */
  async query(functionName: string, args: any = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Convex-Client': 'price-radar-worker-1.0',
      },
      body: JSON.stringify({
        path: functionName,
        args,
        format: 'json',
      }),
    })

    if (!response.ok) {
      throw new Error(`Convex query failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.value
  }

  /**
   * Call a Convex mutation
   */
  async mutation(functionName: string, args: any = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/mutation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Convex-Client': 'price-radar-worker-1.0',
      },
      body: JSON.stringify({
        path: functionName,
        args,
        format: 'json',
      }),
    })

    if (!response.ok) {
      throw new Error(`Convex mutation failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.value
  }

  /**
   * Call a Convex action
   */
  async action(functionName: string, args: any = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Convex-Client': 'price-radar-worker-1.0',
      },
      body: JSON.stringify({
        path: functionName,
        args,
        format: 'json',
      }),
    })

    if (!response.ok) {
      throw new Error(`Convex action failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.value
  }
}

/**
 * Get Convex client instance
 */
export function getConvexClient(env: Env): ConvexClient {
  if (!env.CONVEX_URL) {
    throw new Error('CONVEX_URL not configured')
  }

  return new ConvexClient(env.CONVEX_URL, env.CONVEX_DEPLOY_KEY || '')
}

/**
 * Fetch monitors that need to be run
 */
export async function fetchMonitorsToRun(
  client: ConvexClient,
  frequencyMinutes: number
): Promise<any[]> {
  try {
    const monitors = await client.query('monitors:getMonitorsToRun', {
      frequencyMinutes,
    })
    return monitors || []
  } catch (error) {
    console.error('[CONVEX] Error fetching monitors:', error)
    return []
  }
}

/**
 * Update monitor last run timestamp
 */
export async function updateMonitorLastRun(
  client: ConvexClient,
  monitorId: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  try {
    await client.mutation('monitors:updateLastRun', {
      monitorId,
      success,
      errorMessage,
    })
    console.log('[CONVEX] Updated monitor last run:', monitorId)
  } catch (error) {
    console.error('[CONVEX] Error updating monitor:', error)
  }
}
