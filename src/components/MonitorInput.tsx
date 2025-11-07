import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

interface MonitorInputProps {
  onSubmit: (query: string) => Promise<void>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(query.trim())
      setQuery('') // Clear input on success
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
    <div className="card bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="card-title text-xl">What are you looking for?</h3>
            <p className="text-sm text-base-content/70">
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
              className="btn btn-primary btn-lg gap-2"
              disabled={!query.trim() || disabled || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Monitor...
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
