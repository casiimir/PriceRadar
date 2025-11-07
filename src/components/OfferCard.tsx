import { ExternalLink, Archive, MapPin, Package, Globe } from 'lucide-react'
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
    <div
      className={`card bg-base-100 border transition-all duration-200 hover:border-base-content/20 ${
        isNew ? 'border-neutral' : 'border-base-300'
      }`}
    >
      {isNew && (
        <div className="badge badge-neutral badge-sm absolute top-3 right-3 z-10">
          NEW
        </div>
      )}

      <div className="card-body p-5">
        <div className="flex gap-5">
          {/* Image */}
          {offer.imageUrl ? (
            <figure className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-base-200">
              <img
                src={offer.imageUrl}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
            </figure>
          ) : (
            <div className="w-24 h-24 flex-shrink-0 bg-base-200 rounded-lg flex items-center justify-center">
              <Package className="w-10 h-10 text-base-content/20" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Top Section: Title and badges */}
            <div className="mb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-lg leading-tight line-clamp-2 flex-1">
                  {offer.title}
                </h3>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="badge badge-sm gap-1">
                  <Globe className="w-3 h-3" />
                  {offer.siteName}
                </div>
                {offer.condition && (
                  <div className="badge badge-sm badge-outline">
                    {offer.condition}
                  </div>
                )}
                {offer.location && (
                  <div className="badge badge-sm badge-outline gap-1">
                    <MapPin className="w-3 h-3" />
                    {offer.location}
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="mb-3">
              <span className="text-2xl font-bold">
                {formatPrice(offer.price, offer.currency)}
              </span>
            </div>

            {/* Snippet */}
            <p className="text-sm text-base-content/80 mb-3 line-clamp-2 leading-relaxed">
              {offer.snippet}
            </p>

            {/* Bottom Section: Time and Actions */}
            <div className="flex items-center justify-between gap-3 mt-auto">
              <span className="text-xs text-base-content/50">
                {formatTimeAgo(offer.foundAt)}
              </span>

              <div className="flex gap-2">
                <button
                  className="btn btn-neutral btn-sm gap-2"
                  onClick={handleViewOffer}
                >
                  <ExternalLink className="w-4 h-4" />
                  View Offer
                </button>
                <button
                  className="btn btn-ghost btn-sm btn-square"
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
    </div>
  )
}
