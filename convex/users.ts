import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * USER QUERIES & MUTATIONS
 */

// ============================================
// QUERIES
// ============================================

/**
 * Get current user by ID
 */
export const get = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId)
  },
})

/**
 * Get user by email
 */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()
  },
})

/**
 * Get all users
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
  },
})

/**
 * Get current authenticated user
 * (Will be updated when we add Convex Auth)
 */
export const getCurrentUser = query({
  args: {},
  handler: async (_ctx) => {
    // TODO: Replace with actual auth when Convex Auth is integrated
    // const identity = await ctx.auth.getUserIdentity()
    // if (!identity) return null
    // return await ctx.db
    //   .query('users')
    //   .withIndex('by_email', (q) => q.eq('email', identity.email))
    //   .first()

    // For now, return null (will implement auth in next step)
    return null
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new user
 */
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    plan: v.optional(v.union(v.literal('free'), v.literal('pro'))),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Create new user
    const userId = await ctx.db.insert('users', {
      name: args.name,
      email: args.email,
      plan: args.plan ?? 'free', // Default to free plan
      createdAt: now,
      updatedAt: now,
    })

    return userId
  },
})

/**
 * Update user plan (for payment webhooks)
 */
export const updatePlan = mutation({
  args: {
    userId: v.id('users'),
    plan: v.union(v.literal('free'), v.literal('pro')),
    autumnCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    await ctx.db.patch(args.userId, {
      plan: args.plan,
      autumnCustomerId: args.autumnCustomerId,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Update user profile
 */
export const update = mutation({
  args: {
    userId: v.id('users'),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const updates: any = {
      updatedAt: now,
    }

    if (args.name !== undefined) updates.name = args.name
    if (args.email !== undefined) updates.email = args.email

    await ctx.db.patch(args.userId, updates)

    return { success: true }
  },
})

/**
 * Delete user (with cascade)
 */
export const remove = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Delete all user's monitors
    const monitors = await ctx.db
      .query('monitors')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect()

    for (const monitor of monitors) {
      await ctx.db.delete(monitor._id)
    }

    // Delete all user's offers
    const offers = await ctx.db
      .query('offers')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect()

    for (const offer of offers) {
      await ctx.db.delete(offer._id)
    }

    // Delete user
    await ctx.db.delete(args.userId)

    return { success: true }
  },
})
