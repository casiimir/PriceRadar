import { Link } from '@tanstack/react-router'
import { Radar, LayoutDashboard, CreditCard, User, LogIn } from 'lucide-react'

export default function Header() {
  // TODO: Replace with actual auth state from Convex Auth
  const isAuthenticated = false
  const userPlan = 'free' // 'free' | 'pro'

  return (
    <div className="navbar bg-base-100 sticky top-0 z-50 shadow-lg">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link to="/">Home</Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
            )}
            <li>
              <Link to="/pricing">Pricing</Link>
            </li>
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost gap-2 text-xl normal-case">
          <Radar className="text-primary h-6 w-6" />
          <span className="font-bold">
            Price <span className="text-primary">Radar</span>
          </span>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/" activeProps={{ className: 'active' }}>
              Home
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link to="/dashboard" activeProps={{ className: 'active' }} className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </li>
          )}
          <li>
            <Link to="/pricing" activeProps={{ className: 'active' }} className="gap-2">
              <CreditCard className="h-4 w-4" />
              Pricing
            </Link>
          </li>
        </ul>
      </div>

      <div className="navbar-end gap-2">
        {isAuthenticated ? (
          <>
            <div className="badge badge-primary badge-sm">{userPlan.toUpperCase()}</div>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="bg-primary text-primary-content flex w-10 items-center justify-center rounded-full">
                  <User className="h-6 w-6" />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
              >
                <li>
                  <Link to="/dashboard" className="justify-between">
                    Dashboard
                    <span className="badge">{userPlan}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/pricing">Upgrade to Pro</Link>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li>
                  <a>Logout</a>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <Link to="/pricing" className="btn btn-ghost btn-sm">
              Pricing
            </Link>
            <button className="btn btn-primary btn-sm gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
          </>
        )}
      </div>
    </div>
  )
}
