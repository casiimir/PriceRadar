import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * OFFERS QUERIES & MUTATIONS
 */

// ============================================
// QUERIES
// ============================================

/**
 * Get all offers for a monitor
 */
export const getByMonitorId = query({
  args: {
    monitorId: v.id('monitors'),
    status: v.optional(v.string()), // Filter by status
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('offers')
      .withIndex('by_monitorId', (q) => q.eq('monitorId', args.monitorId))

    const offers = await query.collect()

    // Filter by status if provided
    let filtered = offers
    if (args.status) {
      filtered = offers.filter((offer) => offer.status === args.status)
    }

    // Sort by most recent first
    const sorted = filtered.sort((a, b) => b.foundAt - a.foundAt)

    // Limit if provided
    if (args.limit) {
      return sorted.slice(0, args.limit)
    }

    return sorted
  },
})

/**
 * Get all offers for a user (across all monitors)
 */
export const getByUserId = query({
  args: {
    userId: v.id('users'),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query

    if (args.status !== undefined) {
      query = ctx.db
        .query('offers')
        .withIndex('by_userId_status', (q) =>
          q.eq('userId', args.userId).eq('status', args.status!)
        )
    } else {
      query = ctx.db.query('offers').withIndex('by_userId', (q) => q.eq('userId', args.userId))
    }

    const offers = await query.collect()

    // Sort by most recent first
    const sorted = offers.sort((a, b) => b.foundAt - a.foundAt)

    // Limit if provided
    if (args.limit) {
      return sorted.slice(0, args.limit)
    }

    return sorted
  },
})

/**
 * Get a single offer by ID
 */
export const getById = query({
  args: { offerId: v.id('offers') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.offerId)
  },
})

/**
 * Get recent new offers for a user (for notifications)
 */
export const getRecentNew = query({
  args: {
    userId: v.id('users'),
    sinceTimestamp: v.number(), // Only get offers after this timestamp
  },
  handler: async (ctx, args) => {
    const offers = await ctx.db
      .query('offers')
      .withIndex('by_userId_status', (q) =>
        q.eq('userId', args.userId).eq('status', 'new')
      )
      .collect()

    // Filter by timestamp
    const recent = offers.filter((offer) => offer.foundAt > args.sinceTimestamp)

    // Sort by most recent first
    return recent.sort((a, b) => b.foundAt - a.foundAt)
  },
})

/**
 * Check if offer exists by URL (for deduplication)
 */
export const existsByUrl = query({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const offer = await ctx.db
      .query('offers')
      .withIndex('by_url', (q) => q.eq('url', args.url))
      .first()

    return offer !== null
  },
})

/**
 * Count new offers for a user
 */
export const countNew = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const offers = await ctx.db
      .query('offers')
      .withIndex('by_userId_status', (q) =>
        q.eq('userId', args.userId).eq('status', 'new')
      )
      .collect()

    return offers.length
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new offer (called by Worker)
 */
export const create = mutation({
  args: {
    monitorId: v.id('monitors'),
    userId: v.id('users'),
    title: v.string(),
    price: v.number(),
    currency: v.string(),
    url: v.string(),
    siteName: v.string(),
    snippet: v.string(),
    imageUrl: v.optional(v.string()),
    condition: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Check for duplicate URL
    const existing = await ctx.db
      .query('offers')
      .withIndex('by_url', (q) => q.eq('url', args.url))
      .first()

    if (existing) {
      // Offer already exists, don't create duplicate
      return existing._id
    }

    // Create new offer
    const offerId = await ctx.db.insert('offers', {
      monitorId: args.monitorId,
      userId: args.userId,
      title: args.title,
      price: args.price,
      currency: args.currency,
      url: args.url,
      siteName: args.siteName,
      snippet: args.snippet,
      imageUrl: args.imageUrl,
      condition: args.condition,
      location: args.location,
      status: 'new',
      foundAt: now,
    })

    return offerId
  },
})

/**
 * Bulk create offers (for Worker efficiency)
 */
export const createBulk = mutation({
  args: {
    offers: v.array(
      v.object({
        monitorId: v.id('monitors'),
        userId: v.id('users'),
        title: v.string(),
        price: v.number(),
        currency: v.string(),
        url: v.string(),
        siteName: v.string(),
        snippet: v.string(),
        imageUrl: v.optional(v.string()),
        condition: v.optional(v.string()),
        location: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const createdIds = []

    for (const offer of args.offers) {
      // Check for duplicate URL
      const existing = await ctx.db
        .query('offers')
        .withIndex('by_url', (q) => q.eq('url', offer.url))
        .first()

      if (!existing) {
        const offerId = await ctx.db.insert('offers', {
          ...offer,
          status: 'new',
          foundAt: now,
        })
        createdIds.push(offerId)
      }
    }

    return {
      created: createdIds.length,
      total: args.offers.length,
      ids: createdIds,
    }
  },
})

/**
 * Archive an offer (user action: "Ignore")
 */
export const archive = mutation({
  args: { offerId: v.id('offers') },
  handler: async (ctx, args) => {
    const now = Date.now()

    await ctx.db.patch(args.offerId, {
      status: 'archived',
      archivedAt: now,
    })

    return { success: true }
  },
})

/**
 * Mark offer as clicked (user action: "View Offer")
 */
export const markClicked = mutation({
  args: { offerId: v.id('offers') },
  handler: async (ctx, args) => {
    const now = Date.now()

    await ctx.db.patch(args.offerId, {
      status: 'clicked',
      clickedAt: now,
    })

    return { success: true }
  },
})

/**
 * Delete an offer
 */
export const remove = mutation({
  args: { offerId: v.id('offers') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.offerId)
    return { success: true }
  },
})

/**
 * Delete old offers (cleanup job)
 */
export const deleteOlderThan = mutation({
  args: {
    daysOld: v.number(), // Delete offers older than X days
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const cutoffTime = now - args.daysOld * 24 * 60 * 60 * 1000

    // Get all old archived offers
    const oldOffers = await ctx.db
      .query('offers')
      .withIndex('by_status_foundAt', (q) => q.eq('status', 'archived'))
      .collect()

    const toDelete = oldOffers.filter((offer) => offer.foundAt < cutoffTime)

    for (const offer of toDelete) {
      await ctx.db.delete(offer._id)
    }

    return {
      deleted: toDelete.length,
    }
  },
})
