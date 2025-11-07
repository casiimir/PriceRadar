# Convex Backend Functions

This directory contains all Convex backend functions for Price Radar.

## Structure

- `schema.ts` - Database schema definition
- `users.ts` - User queries and mutations
- `monitors.ts` - Monitor queries and mutations
- `offers.ts` - Offer queries and mutations
- `helpers.ts` - Shared helper functions and constants

## Setup

1. Install Convex: `pnpm add convex`
2. Initialize: `npx convex dev`
3. Login and create project when prompted

## Development

Start Convex in development mode:

```bash
npx convex dev
```

This will:
- Watch for changes in `convex/` directory
- Auto-generate TypeScript types
- Sync schema with cloud

## Database Schema

### Users
- User accounts and subscription plans
- Email-based authentication
- Autumn customer ID for payments

### Monitors
- User-created search queries
- AI-parsed query JSON
- Scraping configuration (sites, frequency)
- Status tracking and error handling

### Offers
- Deals found by the scraper
- Linked to monitors and users
- Deduplication by URL
- Status: new, archived, clicked

## Plan Limits

### Free Plan
- 1 active monitor
- 30-minute minimum frequency
- 1 site only
- No email notifications

### Pro Plan (€7.99/month)
- 20 active monitors
- 3-minute minimum frequency
- Unlimited sites
- Email notifications

## Functions Reference

### Users
- `users.get(userId)` - Get user by ID
- `users.getByEmail(email)` - Get user by email
- `users.create(...)` - Create new user
- `users.updatePlan(...)` - Update subscription plan
- `users.update(...)` - Update user profile
- `users.remove(userId)` - Delete user (cascade)

### Monitors
- `monitors.getAll(userId, status?)` - Get all monitors for user
- `monitors.getById(monitorId)` - Get single monitor
- `monitors.getMonitorsToRun(frequency)` - Get monitors ready to run
- `monitors.countActive(userId)` - Count active monitors
- `monitors.create(...)` - Create new monitor (with plan validation)
- `monitors.updateStatus(...)` - Update monitor status
- `monitors.updateLastRun(...)` - Update last run timestamp
- `monitors.update(...)` - Update monitor config
- `monitors.remove(monitorId)` - Delete monitor (cascade)

### Offers
- `offers.getByMonitorId(monitorId, status?, limit?)` - Get offers for monitor
- `offers.getByUserId(userId, status?, limit?)` - Get offers for user
- `offers.getRecentNew(userId, sinceTimestamp)` - Get new offers since timestamp
- `offers.existsByUrl(url)` - Check if offer exists (deduplication)
- `offers.countNew(userId)` - Count new offers for user
- `offers.create(...)` - Create single offer
- `offers.createBulk([...])` - Bulk create offers (Worker)
- `offers.archive(offerId)` - Archive offer (user "Ignore")
- `offers.markClicked(offerId)` - Mark as clicked (user "View")
- `offers.remove(offerId)` - Delete offer
- `offers.deleteOlderThan(daysOld)` - Cleanup old offers

## Usage in Frontend

```typescript
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'

// Query
const monitors = useQuery(api.monitors.getAll, {
  userId: user._id,
  status: 'active'
})

// Mutation
const createMonitor = useMutation(api.monitors.create)
await createMonitor({
  userId: user._id,
  queryText: "RTX 4080 < €800",
  queryJson: { item: "RTX 4080", price_max: 800 },
  sites: ['ebay'],
  frequencyMinutes: 30
})
```

## Next Steps

- [ ] Add Convex Auth integration
- [ ] Create HTTP endpoints for webhooks
- [ ] Add actions for AI processing
- [ ] Implement cron jobs (if needed)
