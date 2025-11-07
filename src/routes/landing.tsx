import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Radar,
  Zap,
  Brain,
  Bell,
  TrendingUp,
  Shield,
  Clock,
  Globe,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

export const Route = createFileRoute('/landing')({ component: LandingPage })

function LandingPage() {
  const features = [
    {
      icon: <Brain className="w-12 h-12 text-primary" />,
      title: 'AI-Powered Understanding',
      description:
        'Just tell us what you want in plain language. "Find me a used RTX 4080 under €800" - our AI does the rest.',
    },
    {
      icon: <Zap className="w-12 h-12 text-primary" />,
      title: 'Real-Time Monitoring',
      description:
        'Proactive scanning every 3 minutes (Pro) or 30 minutes (Free). Never miss a deal again.',
    },
    {
      icon: <Bell className="w-12 h-12 text-primary" />,
      title: 'Instant Notifications',
      description:
        'Get notified the moment a deal is found. Email, in-app, and more notification channels coming soon.',
    },
    {
      icon: <Globe className="w-12 h-12 text-primary" />,
      title: 'Multi-Site Support',
      description:
        'Monitor eBay, Subito, Amazon, and more - all from one place. Pro users get unlimited sites.',
    },
    {
      icon: <Shield className="w-12 h-12 text-primary" />,
      title: 'Smart Filtering',
      description:
        'AI-powered analysis cuts through the noise. Only relevant, high-quality offers reach you.',
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-primary" />,
      title: 'Price Tracking',
      description:
        'Track price history and trends. Know when you are getting the best deal possible.',
    },
  ]

  const howItWorks = [
    {
      step: '1',
      title: 'Describe What You Want',
      description:
        'Use natural language to describe your ideal product. No complicated forms or filters.',
    },
    {
      step: '2',
      title: 'AI Monitors the Web',
      description:
        'Our intelligent scraper continuously monitors your selected marketplaces in real-time.',
    },
    {
      step: '3',
      title: 'Get Instant Alerts',
      description:
        'Receive notifications the moment a matching deal is found. Click to claim it before it is gone!',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero min-h-[80vh] bg-gradient-to-br from-base-100 to-base-300">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Radar className="w-24 h-24 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              Never Miss a <span className="text-primary">Deal</span> Again
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-base-content/80">
              Your AI-powered personal deal finder that monitors the web 24/7
            </p>
            <p className="text-lg mb-8 text-base-content/60 max-w-2xl mx-auto">
              Stop manually checking dozens of websites. Let Price Radar do the work for you with
              intelligent monitoring and instant notifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary btn-lg gap-2">
                Start Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link to="/pricing" className="btn btn-outline btn-lg">
                View Pricing
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-base-content/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>1 free monitor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-base-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Three simple steps to start finding amazing deals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="card-body items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-3xl font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="card-title text-xl mb-2">{item.title}</h3>
                    <p className="text-base-content/70">{item.description}</p>
                  </div>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powered by <span className="text-primary">AI</span>
            </h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Advanced features to help you find the best deals faster
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="card-body">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="card-title text-xl mb-3">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Use Cases */}
      <section className="py-20 bg-base-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Perfect For</h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Whether you are a tech enthusiast, collector, or bargain hunter
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-2xl mb-4">🎮 Tech Enthusiasts</h3>
                <p className="text-base-content/70 mb-4">
                  Monitor for graphics cards, CPUs, gaming consoles, and other tech at the best
                  prices.
                </p>
                <div className="badge badge-outline">RTX 4080</div>
                <div className="badge badge-outline">PS5</div>
                <div className="badge badge-outline">MacBook Pro</div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-2xl mb-4">👜 Collectors</h3>
                <p className="text-base-content/70 mb-4">
                  Find rare vintage items, limited editions, and collectibles before anyone else.
                </p>
                <div className="badge badge-outline">Vintage Bags</div>
                <div className="badge badge-outline">Sneakers</div>
                <div className="badge badge-outline">Watches</div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-accent/10 to-accent/5 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-2xl mb-4">🏠 Smart Shoppers</h3>
                <p className="text-base-content/70 mb-4">
                  Get alerts for furniture, appliances, and home goods at unbeeatableprices.
                </p>
                <div className="badge badge-outline">Furniture</div>
                <div className="badge badge-outline">Appliances</div>
                <div className="badge badge-outline">Tools</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-focus text-primary-content">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <Clock className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Start Finding Deals in Minutes
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of smart shoppers who never miss a great deal. Start your free account
              today.
            </p>
            <button className="btn btn-neutral btn-lg gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
