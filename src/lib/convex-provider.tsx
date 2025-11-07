import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ReactNode } from 'react'

const convexUrl = import.meta.env.VITE_CONVEX_URL

if (!convexUrl) {
  throw new Error('Missing VITE_CONVEX_URL environment variable')
}

// Create Convex client
const convex = new ConvexReactClient(convexUrl)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
