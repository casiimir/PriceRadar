/**
 * AI Parser (A) - Query Understanding
 *
 * Uses Cloudflare AI (Llama 3.3 70B) to parse natural language queries
 * into structured JSON for monitor configuration.
 */

import { action } from './_generated/server'
import { v } from 'convex/values'

const AI_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'

interface ParsedQuery {
  item: string
  brand?: string
  model?: string
  condition?: 'new' | 'used' | 'refurbished'
  price_min?: number
  price_max?: number
  location?: string
  shipping?: 'local' | 'national' | 'international'
  keywords?: string[]
}

interface ParseResult {
  success: boolean
  parsed?: ParsedQuery
  error?: string
}

/**
 * Parse natural language query into structured JSON
 */
export const parseQuery = action({
  args: {
    queryText: v.string(),
  },
  handler: async (_ctx, args): Promise<ParseResult> => {
    try {
      console.log(`[AI_PARSER] Parsing query: "${args.queryText}"`)

      // Get Cloudflare credentials from environment variables
      // @ts-ignore - Convex injects env vars at runtime
      const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID!
      // @ts-ignore - Convex injects env vars at runtime
      const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN!

      if (!cloudflareAccountId || !cloudflareApiToken) {
        console.error('[AI_PARSER] Missing Cloudflare credentials')
        throw new Error('Cloudflare AI credentials not configured')
      }

      // Build the parsing prompt
      const prompt = buildParsingPrompt(args.queryText)

      // Call Cloudflare AI via REST API
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/${AI_MODEL}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cloudflareApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'You are a precise query parsing assistant. Extract structured data from user queries and return ONLY valid JSON. No explanations, no markdown, just the JSON object.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1024,
            temperature: 0.1, // Low temperature for deterministic parsing
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Cloudflare AI API error: ${response.status} ${response.statusText}`)
      }

      const aiResponse = await response.json()
      console.log('[AI_PARSER] AI response received')

      // Parse AI response
      const parsed = parseAIResponse(aiResponse, args.queryText)

      console.log('[AI_PARSER] Parsed query:', JSON.stringify(parsed))

      return {
        success: true,
        parsed
      }

    } catch (error) {
      console.error('[AI_PARSER] Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
})

/**
 * Build the parsing prompt
 */
function buildParsingPrompt(queryText: string): string {
  return `Parse the following product search query into structured JSON.

**Query:** ${queryText}

**Instructions:**
1. Extract the main product/item being searched
2. Identify brand, model, or specific product details
3. Extract condition: "new", "used", or "refurbished"
4. Extract price constraints (min/max)
5. Extract location preferences
6. Extract shipping preferences
7. Extract any other relevant keywords

**Output format (JSON only, no markdown):**
{
  "item": "Main product description",
  "brand": "Brand name (if mentioned)",
  "model": "Model name (if mentioned)",
  "condition": "new|used|refurbished (if mentioned)",
  "price_min": numeric_value,
  "price_max": numeric_value,
  "location": "Location constraint (if mentioned)",
  "shipping": "local|national|international (if mentioned)",
  "keywords": ["additional", "search", "terms"]
}

**Examples:**

Query: "MacBook Pro M2, nuovo, max 2000€"
{
  "item": "MacBook Pro M2",
  "brand": "Apple",
  "model": "M2",
  "condition": "new",
  "price_max": 2000,
  "keywords": ["MacBook", "Pro", "M2"]
}

Query: "RTX 4080 usata sotto 800 euro"
{
  "item": "RTX 4080",
  "brand": "NVIDIA",
  "model": "4080",
  "condition": "used",
  "price_max": 800,
  "keywords": ["RTX", "4080", "graphics card"]
}

Query: "iPhone 14 Pro usato sotto 600€"
{
  "item": "iPhone 14 Pro",
  "brand": "Apple",
  "model": "14 Pro",
  "condition": "used",
  "price_max": 600,
  "keywords": ["iPhone", "14", "Pro"]
}

Now parse the query above and return ONLY the JSON object.`
}

/**
 * Helper function to parse query (can be called from mutations)
 */
export async function parseQueryDirect(queryText: string): Promise<ParseResult> {
  try {
    console.log(`[AI_PARSER] Parsing query: "${queryText}"`)

    // Get Cloudflare credentials from environment variables
    // @ts-ignore - Convex injects env vars at runtime
    const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID!
    // @ts-ignore - Convex injects env vars at runtime
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN!

    if (!cloudflareAccountId || !cloudflareApiToken) {
      console.error('[AI_PARSER] Missing Cloudflare credentials')
      throw new Error('Cloudflare AI credentials not configured')
    }

    // Build the parsing prompt
    const prompt = buildParsingPrompt(queryText)

    // Call Cloudflare AI via REST API
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/${AI_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloudflareApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a precise query parsing assistant. Extract structured data from user queries and return ONLY valid JSON. No explanations, no markdown, just the JSON object.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1024,
          temperature: 0.1, // Low temperature for deterministic parsing
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Cloudflare AI API error: ${response.status} ${response.statusText}`)
    }

    const aiResponse = await response.json()
    console.log('[AI_PARSER] AI response received')

    // Parse AI response
    const parsed = parseAIResponse(aiResponse, queryText)

    console.log('[AI_PARSER] Parsed query:', JSON.stringify(parsed))

    return {
      success: true,
      parsed
    }

  } catch (error) {
    console.error('[AI_PARSER] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Parse AI response
 */
function parseAIResponse(aiResponse: any, fallbackQuery: string): ParsedQuery {
  try {
    // Extract response text
    let responseText = ''

    if (typeof aiResponse === 'string') {
      responseText = aiResponse
    } else if (aiResponse.result && aiResponse.result.response) {
      responseText = aiResponse.result.response
    } else if (aiResponse.response) {
      responseText = aiResponse.response
    } else {
      console.error('[AI_PARSER] Unexpected response format:', JSON.stringify(aiResponse).substring(0, 200))
      throw new Error('Invalid AI response format')
    }

    // Convert to string if needed
    if (typeof responseText !== 'string') {
      responseText = JSON.stringify(responseText)
    }

    // Remove markdown code blocks if present
    let jsonText = responseText.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\s*/g, '')
    }

    // Parse JSON
    const parsed = JSON.parse(jsonText)

    // Validate and return
    return {
      item: parsed.item || fallbackQuery,
      brand: parsed.brand,
      model: parsed.model,
      condition: parsed.condition,
      price_min: parsed.price_min ? Number(parsed.price_min) : undefined,
      price_max: parsed.price_max ? Number(parsed.price_max) : undefined,
      location: parsed.location,
      shipping: parsed.shipping,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : undefined
    }

  } catch (error) {
    console.error('[AI_PARSER] Failed to parse AI response:', error)
    // Fallback: return basic structure with query as item
    return {
      item: fallbackQuery,
      keywords: [fallbackQuery]
    }
  }
}
