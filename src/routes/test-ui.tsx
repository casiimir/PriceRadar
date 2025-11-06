import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test-ui')({ component: TestUI })

function TestUI() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">daisyUI Test - Theme Night</h1>

      {/* Hero Section */}
      <div className="hero bg-base-200 rounded-box mb-8">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Price Radar</h1>
            <p className="py-6">
              Your AI-powered deal finder. Test page for daisyUI components.
            </p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Buttons</h2>
        <div className="flex gap-2 flex-wrap">
          <button className="btn">Default</button>
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-accent">Accent</button>
          <button className="btn btn-ghost">Ghost</button>
          <button className="btn btn-success">Success</button>
          <button className="btn btn-error">Error</button>
        </div>
      </div>

      {/* Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card bg-base-100 shadow-xl">
            <figure>
              <div className="h-48 bg-base-300 w-full flex items-center justify-center">
                Image Placeholder
              </div>
            </figure>
            <div className="card-body">
              <h2 className="card-title">
                RTX 4080
                <div className="badge badge-secondary">NEW</div>
              </h2>
              <p>Used graphics card in excellent condition</p>
              <div className="card-actions justify-end">
                <div className="badge badge-outline">GPU</div>
                <div className="badge badge-outline">Gaming</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Monitor Card</h2>
              <p>Active monitoring for RTX 4080</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">Status:</span>
                <div className="badge badge-success gap-2">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  Active
                </div>
              </div>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">View Offers</button>
                <button className="btn btn-ghost btn-sm">Pause</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Alerts</h2>
        <div className="space-y-4">
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Monitoring 3 active searches</span>
          </div>
          <div className="alert alert-success">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>New offer found: RTX 4080 for €790!</span>
          </div>
        </div>
      </div>

      {/* Modal Test */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Modal</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            const modal = document.getElementById(
              'test_modal'
            ) as HTMLDialogElement
            modal?.showModal()
          }}
        >
          Open Modal
        </button>
        <dialog id="test_modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Upgrade to Pro</h3>
            <p className="py-4">
              You've reached the limit of 1 monitor. Upgrade to Pro for 20
              monitors and more features!
            </p>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-ghost">Cancel</button>
                <button className="btn btn-primary ml-2">Upgrade</button>
              </form>
            </div>
          </div>
        </dialog>
      </div>

      {/* Toast Test */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Toast (Alert at bottom)</h2>
        <div className="toast toast-end">
          <div className="alert alert-success">
            <span>New offer found!</span>
          </div>
        </div>
      </div>
    </div>
  )
}
