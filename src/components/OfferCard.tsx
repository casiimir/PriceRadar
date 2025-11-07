import { ExternalLink, Archive, Eye, MapPin, Package } from 'lucide-react'
import type { Id } from '../../convex/_generated/dataModel'

interface Offer {
  _id: Id<'offers'>
  title: string
  price: number
  currency: string
  url: string
  siteName: string
  snippet: string
  imageUrl?: string
  condition?: string
  location?: string
  status: string
  foundAt: number
}

interface OfferCardProps {
  offer: Offer
  onArchive?: (offerId: Id<'offers'>) => void
  onView?: (offerId: Id<'offers'>, url: string) => void
}

export default function OfferCard({ offer, onArchive, onView }: OfferCardProps) {
  const isNew = offer.status === 'new'

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const handleViewOffer = () => {
    onView?.(offer._id, offer.url)
    window.open(offer.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={`card bg-base-100 shadow-lg ${isNew ? 'ring-2 ring-success' : ''}`}>
      {isNew && (
        <div className="badge badge-success absolute -top-2 -right-2 z-10">NEW</div>
      )}

      <div className="card-body p-4">
        <div className="flex gap-4">
          {/* Image */}
          {offer.imageUrl ? (
            <figure className="w-24 h-24 flex-shrink-0">
              <img
                src={offer.imageUrl}
                alt={offer.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </figure>
          ) : (
            <div className="w-24 h-24 flex-shrink-0 bg-base-200 rounded-lg flex items-center justify-center">
              <Package className="w-8 h-8 text-base-content/30" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="font-semibold text-base mb-2 line-clamp-2">{offer.title}</h3>

            {/* Price */}
            <div className="flex items-center gap-2 mb-2">
              <div className="badge badge-primary badge-lg font-bold">
                {formatPrice(offer.price, offer.currency)}
              </div>
              {offer.condition && (
                <div className="badge badge-outline badge-sm">{offer.condition}</div>
              )}
            </div>

            {/* Snippet */}
            <p className="text-sm text-base-content/70 mb-3 line-clamp-2">{offer.snippet}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/60 mb-3">
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>{offer.siteName}</span>
              </div>
              {offer.location && (
                <>
                  <div className="divider divider-horizontal mx-0"></div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{offer.location}</span>
                  </div>
                </>
              )}
              <div className="divider divider-horizontal mx-0"></div>
              <span>{formatTimeAgo(offer.foundAt)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                className="btn btn-primary btn-sm gap-2 flex-1"
                onClick={handleViewOffer}
              >
                <ExternalLink className="w-4 h-4" />
                View Offer
              </button>
              <button
                className="btn btn-ghost btn-sm gap-2"
                onClick={() => onArchive?.(offer._id)}
                title="Archive this offer"
              >
                <Archive className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Globe icon component (if not using lucide-react)
function Globe({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  )
}
