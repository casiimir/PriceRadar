# Price Radar Worker

Cloudflare Worker that orchestrates web scraping and deal finding for Price Radar.

## Features

- **Cron Triggers**: Runs every 3 minutes (Pro) or 30 minutes (Free)
- **Convex Integration**: Fetches monitors and saves offers
- **URL Building**: Generates search URLs for eBay, Subito, Amazon
- **Rate Limiting**: Prevents overwhelming scraping services
- **Error Handling**: Tracks failures and updates monitor status

## Setup

### 1. Install Dependencies

```bash
cd workers/price-radar-worker
npm install
```

### 2. Configure Secrets

```bash
# Set Convex URL
wrangler secret put CONVEX_URL
# Paste: https://your-deployment.convex.cloud

# Set Convex Deploy Key (optional, for authenticated queries)
wrangler secret put CONVEX_DEPLOY_KEY
# Paste: your-deploy-key

# Set Firecrawl API Key (when integrating scraping)
wrangler secret put FIRECRAWL_API_KEY
# Paste: your-api-key

# Set Sentry DSN (optional, for error tracking)
wrangler secret put SENTRY_DSN
# Paste: your-sentry-dsn
```

### 3. Development

```bash
# Run locally with wrangler
npm run dev

# Test health endpoint
curl http://localhost:8787/health

# Manually trigger a scan
curl -X POST "http://localhost:8787/trigger?frequency=30"
```

### 4. Deploy

```bash
# Deploy to Cloudflare
npm run deploy

# Watch logs
npm run tail
```

## Architecture

### File Structure

```
src/
├── index.ts           # Main worker entry point
├── orchestrator.ts    # Business logic for scanning
└── convex-client.ts   # Convex HTTP API client
```

### Flow

1. **Cron Trigger** fires (every 3min or 30min)
2. **Orchestrator** fetches monitors from Convex
3. For each monitor:
   - Build search URLs based on sites
   - Scrape with Firecrawl (TODO)
   - Extract offers with AI (TODO)
   - Save offers to Convex
   - Update monitor lastRunAt
4. Log results and errors

## Endpoints

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### `POST /trigger?frequency=30`
Manually trigger a scan for testing.

**Parameters:**
- `frequency` (optional): Minutes (default: 30)

**Response:**
```json
{
  "success": true,
  "message": "Scan triggered for 30min frequency"
}
```

## Environment Variables

Set via `wrangler.toml` or Cloudflare dashboard:

- `ENVIRONMENT`: development | production
- `CONVEX_URL` (secret): Convex deployment URL
- `CONVEX_DEPLOY_KEY` (secret): Convex deploy key
- `FIRECRAWL_API_KEY` (secret): Firecrawl API key
- `SENTRY_DSN` (secret): Sentry error tracking

## Cron Triggers

Configured in `wrangler.toml`:

```toml
[triggers]
crons = ["*/3 * * * *", "*/30 * * * *"]
```

- `*/3 * * * *` - Every 3 minutes (Pro users)
- `*/30 * * * *` - Every 30 minutes (Free users)

## Next Steps

- [ ] Integrate Firecrawl for web scraping
- [ ] Integrate Cloudflare Workers AI for extraction
- [ ] Add Sentry error tracking
- [ ] Implement deduplication logic
- [ ] Add more sites (Amazon, Wallapop, etc.)
- [ ] Optimize performance with parallel processing
- [ ] Add KV caching for frequently accessed data

## Testing

To test the worker locally:

1. Make sure Convex is running with `npx convex dev`
2. Start worker with `pnpm dev`
3. Go to [http://localhost:3000/test-worker](http://localhost:3000/test-worker) for guided testing
4. Or trigger manually: `curl -X POST "http://localhost:8787/trigger?frequency=30"`
5. Check Convex dashboard or the test page for dummy offers appearing in real-time

## Troubleshooting

### Worker doesn't start
- Check `wrangler.toml` configuration
- Ensure all dependencies are installed
- Verify Node.js version (18+)

### Can't connect to Convex
- Verify `CONVEX_URL` secret is set correctly
- Check Convex deployment is running
- Ensure firewall allows outbound HTTPS

### Cron not triggering
- Cron triggers only work in production
- Use manual `/trigger` endpoint for local testing
- Check Cloudflare dashboard for cron logs
