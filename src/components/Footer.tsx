import { Link } from '@tanstack/react-router'
import { Github, Twitter, Radar } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer footer-center bg-base-200 text-base-content rounded p-10">
      <div className="grid grid-flow-col gap-4">
        <Link to="/" className="link link-hover">
          Home
        </Link>
        <Link to="/pricing" className="link link-hover">
          Pricing
        </Link>
        <a href="#" className="link link-hover">
          About
        </a>
        <a href="#" className="link link-hover">
          Contact
        </a>
      </div>
      <div>
        <div className="grid grid-flow-col gap-4">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-circle"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-circle"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Radar className="text-primary h-5 w-5" />
        <p className="font-semibold">
          Price <span className="text-primary">Radar</span>
        </p>
      </div>
      <div>
        <p className="mt-2 text-sm opacity-60">
          Powered by Convex • Cloudflare • Firecrawl • Autumn • Netlify • Sentry
        </p>
      </div>
    </footer>
  )
}
