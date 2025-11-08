/**
 * AI Extractor (B) - Offer Extraction
 *
 * Uses Cloudflare AI (Llama 3.3 70B) to extract structured offers
 * from scraped marketplace content (Firecrawl markdown)
 */

import type { Env } from './index'

const AI_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'

export interface ExtractedOffer {
  title: string
  price: number
  currency: string
  url: string
  snippet: string
  condition?: string
  location?: string
  imageUrl?: string
}

export interface ExtractionResult {
  offers: ExtractedOffer[]
  success: boolean
  error?: string
}

/**
 * Extract offers from scraped content using Cloudflare AI
 */
export async function extractOffersWithAI(
  env: Env,
  scrapedMarkdown: string,
  query: {
    item: string
    price_max?: number
    condition?: string
  },
  sourceUrl: string,
  imageUrls?: string[]
): Promise<ExtractionResult> {
  try {
    console.log(`[AI_EXTRACTOR] Processing ${scrapedMarkdown.length} chars for "${query.item}"`)

    // Truncate content if too long (Llama 3.3 has 128K context but we want to be safe)
    const maxLength = 30000 // ~30KB of text
    const content =
      scrapedMarkdown.length > maxLength
        ? scrapedMarkdown.substring(0, maxLength) + '\n... [truncated]'
        : scrapedMarkdown

    // Build the AI prompt
    const prompt = buildExtractionPrompt(content, query, sourceUrl, imageUrls)

    // Call Cloudflare AI
    const response = await env.AI.run(AI_MODEL, {
      messages: [
        {
          role: 'system',
          content:
            'You are a precise data extraction assistant. Extract product listings from marketplace content and return ONLY valid JSON. No explanations, no markdown, just the JSON array.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 4096,
      temperature: 0.1, // Low temperature for more deterministic extraction
    })

    console.log('[AI_EXTRACTOR] AI response received')

    // Parse AI response
    const offers = parseAIResponse(response, sourceUrl)

    console.log(`[AI_EXTRACTOR] Extracted ${offers.length} offers`)

    return {
      offers,
      success: true,
    }
  } catch (error) {
    console.error('[AI_EXTRACTOR] Error:', error)
    return {
      offers: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Build the extraction prompt for the AI
 */
function buildExtractionPrompt(
  content: string,
  query: { item: string; price_max?: number; condition?: string },
  sourceUrl: string,
  imageUrls?: string[]
): string {
  const filters = []
  if (query.price_max) filters.push(`- Maximum price: €${query.price_max}`)
  if (query.condition) filters.push(`- Condition: ${query.condition}`)

  // Build images section
  let imagesSection = ''
  if (imageUrls && imageUrls.length > 0) {
    imagesSection = `\n**Available Images (${imageUrls.length} found):**\n${imageUrls.slice(0, 20).map((url, idx) => `${idx + 1}. ${url}`).join('\n')}\n`
  }

  return `Extract product listings from the following marketplace content.

**Search Query:** ${query.item}
${filters.length > 0 ? '\n**Filters:**\n' + filters.join('\n') : ''}
**Source:** ${sourceUrl}
${imagesSection}

**Instructions:**
1. Find ALL relevant product listings that match "${query.item}"
2. For each listing, extract:
   - title: Product name/description
   - price: Numeric price value (extract number only)
   - currency: Currency code (e.g., "EUR", "USD")
   - url: Direct product URL (if found, otherwise use source URL)
   - snippet: Brief description (max 150 chars)
   - condition: Product condition if mentioned (e.g., "New", "Used", "Refurbished")
   - location: Seller location if mentioned
   - imageUrl: Match the most relevant image from the available images list above (use the full URL)
3. Return ONLY a JSON array of objects
4. If no listings found, return empty array []
5. Skip sponsored/ads listings
6. Focus on actual product offers
7. Try to match each offer with the most appropriate image from the available images

**Content to analyze:**

${content}

**Output format (JSON array only, no markdown):**
[
  {
    "title": "Product Name",
    "price": 799.99,
    "currency": "EUR",
    "url": "https://...",
    "snippet": "Brief description...",
    "condition": "Used",
    "location": "Milan, Italy",
    "imageUrl": "https://..."
  }
]`
}

/**
 * Parse AI response and extract offers
 */
function parseAIResponse(aiResponse: any, fallbackUrl: string): ExtractedOffer[] {
  try {
    // The response should be in aiResponse.response
    let responseText = ''

    if (typeof aiResponse === 'string') {
      responseText = aiResponse
    } else if (aiResponse.response) {
      responseText = aiResponse.response
    } else if (aiResponse.result && aiResponse.result.response) {
      responseText = aiResponse.result.response
    } else {
      console.error(
        '[AI_EXTRACTOR] Unexpected AI response format:',
        JSON.stringify(aiResponse).substring(0, 500)
      )
      return []
    }

    // Convert to string if needed
    if (typeof responseText !== 'string') {
      responseText = JSON.stringify(responseText)
    }

    // Try to extract JSON from the response
    // The AI might wrap it in markdown code blocks
    let jsonText = responseText.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\s*/g, '')
    }

    // Parse JSON
    const parsed = JSON.parse(jsonText)

    // Ensure it's an array
    const offersArray = Array.isArray(parsed) ? parsed : [parsed]

    // Validate and sanitize offers
    const validOffers: ExtractedOffer[] = offersArray
      .filter((offer: any) => {
        return (
          offer &&
          typeof offer.title === 'string' &&
          typeof offer.price === 'number' &&
          offer.title.length > 0 &&
          offer.price > 0
        )
      })
      .map((offer: any) => ({
        title: String(offer.title).substring(0, 200),
        price: Number(offer.price),
        currency: offer.currency || 'EUR',
        url: offer.url || fallbackUrl,
        snippet: offer.snippet
          ? String(offer.snippet).substring(0, 300)
          : offer.title.substring(0, 150),
        condition: offer.condition,
        location: offer.location,
        imageUrl: offer.imageUrl,
      }))

    return validOffers
  } catch (error) {
    console.error('[AI_EXTRACTOR] Failed to parse AI response:', error)
    return []
  }
}

/**
 * Create a dummy offer (fallback when AI fails)
 */
export function createDummyOffer(query: { item: string }, sourceUrl: string): ExtractedOffer {
  return {
    title: `${query.item} - Dummy Offer (AI extraction failed)`,
    price: 99.99,
    currency: 'EUR',
    url: sourceUrl,
    snippet: 'This is a dummy offer created because AI extraction failed. Please check logs.',
    condition: 'Unknown',
  }
}
