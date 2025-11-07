import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * MONITORS QUERIES & MUTATIONS
 */

// ============================================
// QUERIES
// ============================================

/**
 * Get all monitors (for admin/testing)
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const monitors = await ctx.db.query('monitors').collect()
    return monitors.sort((a, b) => b.createdAt - a.createdAt)
  },
})

/**
 * Get all monitors for a user
 */
export const getByUserId = query({
  args: {
    userId: v.id('users'),
    status: v.optional(v.string()), // Filter by status
  },
  handler: async (ctx, args) => {
    let monitors

    if (args.status !== undefined) {
      monitors = await ctx.db
        .query('monitors')
        .withIndex('by_userId_status', (q) =>
          q.eq('userId', args.userId).eq('status', args.status!)
        )
        .collect()
    } else {
      monitors = await ctx.db
        .query('monitors')
        .withIndex('by_userId', (q) => q.eq('userId', args.userId))
        .collect()
    }

    // Sort by most recent first
    return monitors.sort((a, b) => b.createdAt - a.createdAt)
  },
})

/**
 * Get a single monitor by ID
 */
export const getById = query({
  args: { monitorId: v.id('monitors') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.monitorId)
  },
})

/**
 * Get monitors that need to be run (for Worker)
 */
export const getMonitorsToRun = query({
  args: {
    frequencyMinutes: v.number(), // 3 for Pro, 30 for Free
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const frequencyMs = args.frequencyMinutes * 60 * 1000

    // Get all active monitors
    const activeMonitors = await ctx.db
      .query('monitors')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect()

    // Filter monitors that need to run
    const monitorsToRun = activeMonitors.filter((monitor) => {
      // If never run, run it
      if (!monitor.lastRunAt) return true

      // If last run was more than frequency ago, run it
      const timeSinceLastRun = now - monitor.lastRunAt
      return timeSinceLastRun >= frequencyMs
    })

    return monitorsToRun
  },
})

/**
 * Count active monitors for a user
 */
export const countActive = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const monitors = await ctx.db
      .query('monitors')
      .withIndex('by_userId_status', (q) =>
        q.eq('userId', args.userId).eq('status', 'active')
      )
      .collect()

    return monitors.length
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new monitor
 */
export const create = mutation({
  args: {
    userId: v.id('users'),
    queryText: v.string(),
    queryJson: v.any(),
    sites: v.array(v.string()),
    frequencyMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get user to check plan limits
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Check plan limits
    const activeMonitors = await ctx.db
      .query('monitors')
      .withIndex('by_userId_status', (q) =>
        q.eq('userId', args.userId).eq('status', 'active')
      )
      .collect()

    if (user.plan === 'free' && activeMonitors.length >= 1) {
      throw new Error('Free plan limit: 1 active monitor. Upgrade to Pro for 20 monitors.')
    }

    if (user.plan === 'pro' && activeMonitors.length >= 20) {
      throw new Error('Pro plan limit: 20 active monitors.')
    }

    // Validate frequency based on plan
    if (user.plan === 'free' && args.frequencyMinutes < 30) {
      throw new Error('Free plan minimum frequency: 30 minutes. Upgrade to Pro for 3 minutes.')
    }

    if (user.plan === 'pro' && args.frequencyMinutes < 3) {
      throw new Error('Pro plan minimum frequency: 3 minutes.')
    }

    // Validate sites based on plan
    if (user.plan === 'free' && args.sites.length > 1) {
      throw new Error('Free plan limit: 1 site. Upgrade to Pro for multi-site monitoring.')
    }

    // Create monitor
    const monitorId = await ctx.db.insert('monitors', {
      userId: args.userId,
      queryText: args.queryText,
      queryJson: args.queryJson,
      status: 'active',
      sites: args.sites,
      frequencyMinutes: args.frequencyMinutes,
      createdAt: now,
      updatedAt: now,
    })

    return monitorId
  },
})

/**
 * Update monitor status
 */
export const updateStatus = mutation({
  args: {
    monitorId: v.id('monitors'),
    status: v.string(), // 'active', 'paused', 'error'
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    await ctx.db.patch(args.monitorId, {
      status: args.status,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Update last run timestamp (called by Worker)
 */
export const updateLastRun = mutation({
  args: {
    monitorId: v.id('monitors'),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const updates: any = {
      lastRunAt: now,
      updatedAt: now,
    }

    if (!args.success) {
      updates.lastErrorAt = now
      updates.lastErrorMessage = args.errorMessage ?? 'Unknown error'
      updates.status = 'error'
    }

    await ctx.db.patch(args.monitorId, updates)

    return { success: true }
  },
})

/**
 * Delete a monitor (with cascade)
 */
export const remove = mutation({
  args: { monitorId: v.id('monitors') },
  handler: async (ctx, args) => {
    // Delete all offers for this monitor
    const offers = await ctx.db
      .query('offers')
      .withIndex('by_monitorId', (q) => q.eq('monitorId', args.monitorId))
      .collect()

    for (const offer of offers) {
      await ctx.db.delete(offer._id)
    }

    // Delete monitor
    await ctx.db.delete(args.monitorId)

    return { success: true }
  },
})

/**
 * Create monitor from UI (simplified version without AI parsing)
 * TODO: Replace with AI-powered parsing in Phase 6
 */
export const createFromUI = mutation({
  args: {
    userId: v.id('users'),
    queryText: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get user to check plan limits
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Check plan limits
    const activeMonitors = await ctx.db
      .query('monitors')
      .withIndex('by_userId_status', (q) =>
        q.eq('userId', args.userId).eq('status', 'active')
      )
      .collect()

    if (user.plan === 'free' && activeMonitors.length >= 1) {
      throw new Error('Free plan limit: 1 active monitor. Upgrade to Pro for 20 monitors.')
    }

    if (user.plan === 'pro' && activeMonitors.length >= 20) {
      throw new Error('Pro plan limit: 20 active monitors.')
    }

    // For now, use default settings until AI parser is implemented
    // TODO: In Phase 6, add AI parsing to extract structured data from queryText
    // Temporarily use the full query text as the item for URL building
    const defaultQueryJson = {
      query: args.queryText,
      item: args.queryText, // Use full text as search term until AI parsing is implemented
      // AI will extract: brand, condition, price_min, price_max, location, etc.
    }

    const defaultSites = user.plan === 'free' ? ['ebay'] : ['ebay', 'subito']
    const defaultFrequency = user.plan === 'free' ? 30 : 3

    // Create monitor
    const monitorId = await ctx.db.insert('monitors', {
      userId: args.userId,
      queryText: args.queryText,
      queryJson: defaultQueryJson,
      status: 'active',
      sites: defaultSites,
      frequencyMinutes: defaultFrequency,
      createdAt: now,
      updatedAt: now,
    })

    return monitorId
  },
})

/**
 * Update monitor configuration
 */
export const update = mutation({
  args: {
    monitorId: v.id('monitors'),
    queryText: v.optional(v.string()),
    queryJson: v.optional(v.any()),
    sites: v.optional(v.array(v.string())),
    frequencyMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const monitor = await ctx.db.get(args.monitorId)
    if (!monitor) {
      throw new Error('Monitor not found')
    }

    const user = await ctx.db.get(monitor.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const updates: any = {
      updatedAt: now,
    }

    if (args.queryText !== undefined) updates.queryText = args.queryText
    if (args.queryJson !== undefined) updates.queryJson = args.queryJson
    if (args.sites !== undefined) {
      // Validate based on plan
      if (user.plan === 'free' && args.sites.length > 1) {
        throw new Error('Free plan limit: 1 site')
      }
      updates.sites = args.sites
    }
    if (args.frequencyMinutes !== undefined) {
      // Validate based on plan
      if (user.plan === 'free' && args.frequencyMinutes < 30) {
        throw new Error('Free plan minimum frequency: 30 minutes')
      }
      if (user.plan === 'pro' && args.frequencyMinutes < 3) {
        throw new Error('Pro plan minimum frequency: 3 minutes')
      }
      updates.frequencyMinutes = args.frequencyMinutes
    }

    await ctx.db.patch(args.monitorId, updates)

    return { success: true }
  },
})
