import { useState, useEffect } from 'react'
import { Sparkles, Loader2, Check } from 'lucide-react'
import AIParsePreview from './AIParsePreview'

interface ParsedQuery {
  item: string
  brand?: string
  model?: string
  condition?: 'new' | 'used' | 'refurbished'
  price_min?: number
  price_max?: number
  location?: string
  keywords?: string[]
}

interface MonitorInputProps {
  onSubmit: (query: string, parsedQuery?: ParsedQuery) => Promise<void>
  disabled?: boolean
  maxLength?: number
}

export default function MonitorInput({
  onSubmit,
  disabled = false,
  maxLength = 500,
}: MonitorInputProps) {
  const [query, setQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  // Debounced AI parsing
  useEffect(() => {
    if (!query.trim() || query.length < 10) {
      setParsedQuery(null)
      setParseError(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsParsing(true)
      setParseError(null)

      try {
        const response = await fetch('http://localhost:8787/parse-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queryText: query }),
        })

        const result = await response.json()

        if (result.success && result.parsed) {
          setParsedQuery(result.parsed)
        } else {
          setParseError('Failed to parse query')
          setParsedQuery(null)
        }
      } catch (error) {
        console.error('Failed to parse query:', error)
        setParseError('Connection error')
        setParsedQuery(null)
      } finally {
        setIsParsing(false)
      }
    }, 1000) // Wait 1 second after user stops typing

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(query.trim(), parsedQuery || undefined)
      setQuery('') // Clear input on success
      setParsedQuery(null)
      setParseError(null)
    } catch (error) {
      console.error('Failed to create monitor:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const examples = [
    'RTX 4080 usata sotto 800€',
    'MacBook Pro M2, nuovo, max 2000€',
    'Borsa vintage Gucci, spedita in Italia',
  ]

  const remainingChars = maxLength - query.length
  const isNearLimit = remainingChars < 50

  return (
    <div className="card bg-base-100">
      <div className="card-body p-0">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-base-content/40" />
          <div>
            <h3 className="font-semibold">What are you looking for?</h3>
            <p className="text-sm text-base-content/60">
              Describe your ideal product in natural language
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <textarea
              className="textarea textarea-bordered textarea-lg h-32 resize-none"
              placeholder="Example: I'm looking for a used RTX 4080 graphics card, in good condition, shipped to Italy, under €800"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={maxLength}
              disabled={disabled || isSubmitting}
            />
            <label className="label">
              <span className="label-text-alt">
                💡 Be specific: mention brand, condition, price range, location
              </span>
              <span
                className={`label-text-alt ${
                  isNearLimit ? 'text-warning' : 'text-base-content/50'
                }`}
              >
                {remainingChars} characters left
              </span>
            </label>
          </div>

          {/* AI Parse Preview */}
          {query.length >= 10 && (
            <div className="mt-4">
              {isParsing && <AIParsePreview parsedQuery={{} as ParsedQuery} isLoading={true} />}
              {!isParsing && parsedQuery && <AIParsePreview parsedQuery={parsedQuery} />}
              {!isParsing && parseError && (
                <div className="alert alert-warning">
                  <span className="text-sm">{parseError} - Monitor will be created with basic search</span>
                </div>
              )}
            </div>
          )}

          <div className="divider text-xs">or try an example</div>

          <div className="flex flex-wrap gap-2 mb-4">
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setQuery(example)}
                disabled={disabled || isSubmitting}
              >
                {example}
              </button>
            ))}
          </div>

          <div className="card-actions justify-end">
            <button
              type="submit"
              className="btn btn-neutral gap-2"
              disabled={!query.trim() || disabled || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Monitor...
                </>
              ) : parsedQuery ? (
                <>
                  <Check className="w-5 h-5" />
                  Start Monitoring
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Start Monitoring
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
