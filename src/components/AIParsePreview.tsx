import { Sparkles, Tag, DollarSign, Package, MapPin } from 'lucide-react'

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

interface AIParsePreviewProps {
  parsedQuery: ParsedQuery
  isLoading?: boolean
}

export default function AIParsePreview({ parsedQuery, isLoading }: AIParsePreviewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-base-200 rounded-lg border border-base-300">
        <Sparkles className="w-4 h-4 animate-pulse text-base-content/60" />
        <span className="text-sm">AI is analyzing your query...</span>
      </div>
    )
  }

  const { item, brand, model, condition, price_min, price_max, location, keywords } = parsedQuery

  return (
    <div className="p-4 bg-base-200 rounded-lg border border-base-300">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-base-content/60" />
        <h4 className="font-semibold text-sm">AI understood your search as:</h4>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Main Item */}
        {item && (
          <div className="badge badge-neutral badge-lg gap-2">
            <Package className="w-3 h-3" />
            {item}
          </div>
        )}

        {/* Brand */}
        {brand && (
          <div className="badge badge-outline badge-lg gap-2">
            <Tag className="w-3 h-3" />
            {brand}
          </div>
        )}

        {/* Model */}
        {model && (
          <div className="badge badge-outline badge-lg gap-2">
            <Tag className="w-3 h-3" />
            {model}
          </div>
        )}

        {/* Condition */}
        {condition && (
          <div className="badge badge-outline badge-lg gap-2">
            <Package className="w-3 h-3" />
            {condition === 'new' ? 'Nuovo' : condition === 'used' ? 'Usato' : 'Ricondizionato'}
          </div>
        )}

        {/* Price Range */}
        {(price_min || price_max) && (
          <div className="badge badge-outline badge-lg gap-2">
            <DollarSign className="w-3 h-3" />
            {price_min && price_max
              ? `€${price_min} - €${price_max}`
              : price_min
              ? `Min €${price_min}`
              : `Max €${price_max}`}
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="badge badge-outline badge-lg gap-2">
            <MapPin className="w-3 h-3" />
            {location}
          </div>
        )}
      </div>

      {/* Keywords */}
      {keywords && keywords.length > 0 && (
        <div className="mt-2 text-xs text-base-content/60">
          Keywords: {keywords.join(', ')}
        </div>
      )}
    </div>
  )
}
