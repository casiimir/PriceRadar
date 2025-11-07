import { createFileRoute, Link } from '@tanstack/react-router'
import { Check, Zap, Crown } from 'lucide-react'

export const Route = createFileRoute('/pricing')({ component: PricingPage })

function PricingPage() {
  const freePlan = {
    name: 'Free',
    price: '0',
    period: 'forever',
    description: 'Perfect to try out Price Radar',
    icon: <Zap className="w-8 h-8" />,
    features: [
      '1 active monitor',
      'Scan every 30 minutes',
      'Natural language queries',
      '1 site per monitor',
      'In-app notifications only',
      'Basic AI filtering',
    ],
    limitations: [
      'No email notifications',
      'No history tracking',
      'Limited to eBay only',
    ],
    cta: 'Start Free',
    highlighted: false,
  }

  const proPlan = {
    name: 'Pro',
    price: '7.99',
    period: 'month',
    description: 'For serious deal hunters',
    icon: <Crown className="w-8 h-8" />,
    features: [
      '20 active monitors',
      'Priority scan every 3 minutes',
      'Advanced natural language',
      'Unlimited sites per monitor',
      'Email + In-app notifications',
      'Advanced AI filtering',
      'Full history tracking',
      'Price trend analysis',
      'Telegram alerts (coming soon)',
      'Priority support',
    ],
    limitations: [],
    cta: 'Upgrade to Pro',
    highlighted: true,
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Simple, <span className="text-primary">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Start free and upgrade when you need more power. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Plan */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-base-200 rounded-lg">{freePlan.icon}</div>
                <div>
                  <h2 className="card-title text-2xl">{freePlan.name}</h2>
                  <p className="text-sm text-base-content/60">{freePlan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">€{freePlan.price}</span>
                  <span className="text-base-content/60">/ {freePlan.period}</span>
                </div>
              </div>

              <div className="divider"></div>

              <ul className="space-y-3 mb-6">
                {freePlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {freePlan.limitations.length > 0 && (
                <>
                  <div className="divider text-xs opacity-50">Limitations</div>
                  <ul className="space-y-2 mb-6 text-sm opacity-60">
                    {freePlan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="card-actions mt-auto">
                <button className="btn btn-outline btn-block">{freePlan.cta}</button>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div
            className={`card bg-gradient-to-br from-primary/10 to-primary/5 shadow-2xl ${
              proPlan.highlighted ? 'ring-2 ring-primary' : ''
            }`}
          >
            {proPlan.highlighted && (
              <div className="badge badge-primary absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </div>
            )}
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">{proPlan.icon}</div>
                <div>
                  <h2 className="card-title text-2xl">{proPlan.name}</h2>
                  <p className="text-sm text-base-content/60">{proPlan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">€{proPlan.price}</span>
                  <span className="text-base-content/60">/ {proPlan.period}</span>
                </div>
              </div>

              <div className="divider"></div>

              <ul className="space-y-3 mb-6">
                {proPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="card-actions mt-auto">
                <button className="btn btn-primary btn-block">{proPlan.cta}</button>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="text-center">Free</th>
                  <th className="text-center">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Active Monitors</td>
                  <td className="text-center">1</td>
                  <td className="text-center font-bold text-primary">20</td>
                </tr>
                <tr>
                  <td>Scan Frequency</td>
                  <td className="text-center">30 minutes</td>
                  <td className="text-center font-bold text-primary">3 minutes</td>
                </tr>
                <tr>
                  <td>Sites per Monitor</td>
                  <td className="text-center">1 (eBay only)</td>
                  <td className="text-center font-bold text-primary">Unlimited</td>
                </tr>
                <tr>
                  <td>AI Natural Language</td>
                  <td className="text-center">
                    <Check className="w-5 h-5 text-success inline" />
                  </td>
                  <td className="text-center">
                    <Check className="w-5 h-5 text-primary inline" />
                  </td>
                </tr>
                <tr>
                  <td>In-App Notifications</td>
                  <td className="text-center">
                    <Check className="w-5 h-5 text-success inline" />
                  </td>
                  <td className="text-center">
                    <Check className="w-5 h-5 text-primary inline" />
                  </td>
                </tr>
                <tr>
                  <td>Email Notifications</td>
                  <td className="text-center">-</td>
                  <td className="text-center">
                    <Check className="w-5 h-5 text-primary inline" />
                  </td>
                </tr>
                <tr>
                  <td>History Tracking</td>
                  <td className="text-center">-</td>
                  <td className="text-center">
                    <Check className="w-5 h-5 text-primary inline" />
                  </td>
                </tr>
                <tr>
                  <td>Price Trends</td>
                  <td className="text-center">-</td>
                  <td className="text-center">
                    <Check className="w-5 h-5 text-primary inline" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                Can I upgrade or downgrade anytime?
              </div>
              <div className="collapse-content">
                <p>
                  Yes! You can upgrade to Pro at any time. If you downgrade, your account will
                  switch to Free at the end of your billing period.
                </p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">What payment methods do you accept?</div>
              <div className="collapse-content">
                <p>
                  We accept all major credit cards (Visa, Mastercard, American Express) via our
                  secure payment processor Autumn.
                </p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                What happens when I reach my monitor limit?
              </div>
              <div className="collapse-content">
                <p>
                  Free users can have 1 active monitor. To create more, you will need to either
                  delete an existing monitor or upgrade to Pro for 20 monitors.
                </p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                Is there a free trial for Pro?
              </div>
              <div className="collapse-content">
                <p>
                  The Free plan lets you test all core features. When you are ready for more power,
                  upgrade to Pro. We are so confident you will love it, we offer a 30-day
                  money-back guarantee.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link to="/" className="btn btn-primary btn-lg">
            Get Started Now
          </Link>
          <p className="mt-4 text-sm text-base-content/60">
            No credit card required for Free plan
          </p>
        </div>
      </div>
    </div>
  )
}
