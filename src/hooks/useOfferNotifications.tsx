import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

/**
 * Hook to show toast notifications when new offers arrive
 */
export function useOfferNotifications(userId: Id<'users'> | undefined) {
  const offers = useQuery(
    api.offers.getByUserId,
    userId ? { userId } : 'skip'
  )

  // Track previous offers to detect new ones
  const prevOffersRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!offers) return

    // Get current offer IDs
    const currentOfferIds = new Set(offers.map(o => o._id))

    // Find new offers (not in previous set)
    const newOffers = offers.filter(
      offer => !prevOffersRef.current.has(offer._id) && offer.status === 'new'
    )

    // Show toast for each new offer (limit to 3 to avoid spam)
    newOffers.slice(0, 3).forEach(offer => {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-in fade-in slide-in-from-top-2' : 'animate-out fade-out'
            } max-w-md w-full bg-base-100 shadow-lg rounded-lg border border-base-300 pointer-events-auto`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-sm font-semibold">New Offer Found!</p>
                  <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
                    {offer.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="badge badge-sm font-bold">
                      {new Intl.NumberFormat('it-IT', {
                        style: 'currency',
                        currency: offer.currency,
                      }).format(offer.price)}
                    </span>
                    <span className="badge badge-sm badge-outline">
                      {offer.siteName}
                    </span>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="flex-shrink-0 btn btn-ghost btn-sm btn-circle"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Action button */}
              <div className="mt-3 flex gap-2">
                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-neutral btn-sm flex-1"
                  onClick={() => toast.dismiss(t.id)}
                >
                  View Offer
                </a>
              </div>
            </div>
          </div>
        ),
        {
          duration: 8000,
          position: 'top-right',
        }
      )
    })

    // Update ref with current offers
    prevOffersRef.current = currentOfferIds

  }, [offers])
}
