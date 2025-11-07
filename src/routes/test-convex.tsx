import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'

export const Route = createFileRoute('/test-convex')({ component: TestConvex })

function TestConvex() {
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testName, setTestName] = useState('Test User')

  // Query to get user by email
  const user = useQuery(api.users.getByEmail, { email: testEmail })

  // Mutation to create user
  const createUser = useMutation(api.users.create)

  const handleCreateUser = async () => {
    try {
      await createUser({
        email: testEmail,
        name: testName,
        plan: 'free',
      })
      alert('User created successfully!')
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Convex Test Page</h1>

      {/* Test User Creation */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title">Create Test User</h2>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              className="input input-bordered"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </div>

          <div className="card-actions justify-end mt-4">
            <button className="btn btn-primary" onClick={handleCreateUser}>
              Create User
            </button>
          </div>
        </div>
      </div>

      {/* Display User Data */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Current User Data</h2>

          {user === undefined && (
            <div className="flex items-center gap-2">
              <span className="loading loading-spinner"></span>
              <span>Loading...</span>
            </div>
          )}

          {user === null && (
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
              <span>No user found with email: {testEmail}</span>
            </div>
          )}

          {user && (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <tbody>
                  <tr>
                    <th>ID</th>
                    <td className="font-mono text-sm">{user._id}</td>
                  </tr>
                  <tr>
                    <th>Name</th>
                    <td>{user.name}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <th>Plan</th>
                    <td>
                      <div className="badge badge-primary">{user.plan}</div>
                    </td>
                  </tr>
                  <tr>
                    <th>Created At</th>
                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="alert alert-success mt-8">
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
        <div>
          <h3 className="font-bold">Convex is working!</h3>
          <div className="text-sm">
            This page demonstrates real-time reactivity. Try creating a user and watch the data
            update instantly.
          </div>
        </div>
      </div>
    </div>
  )
}
