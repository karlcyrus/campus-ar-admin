'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      })
      const json = await res.json()

      if (json.success) {
        router.push('/dashboard')
      } else {
        setError(json.error || 'Login failed.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="loginPage">
      <div className="loginWrap">
        <div className="loginCard">

          <div className="loginBadge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M3 12h2M19 12h2M12 3v2M12 19v2"/>
            </svg>
            Campus AR System
          </div>

          <h1 className="loginTitle">Admin Portal</h1>
          <p className="loginSub">Restricted access. Authorized personnel only.</p>

          <form onSubmit={handleLogin}>
            <div className="fieldGroup">
              <label className="fieldLabel" htmlFor="username">Username</label>
              <div className="fieldWrap">
                <span className="fieldIcon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </span>
                <input
                  id="username"
                  className="fieldInput"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="fieldGroup">
              <label className="fieldLabel" htmlFor="password">Password</label>
              <div className="fieldWrap">
                <span className="fieldIcon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  className="fieldInput"
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <p style={{ color: 'var(--red)', fontSize: '13px', marginTop: '8px' }}>
                {error}
              </p>
            )}

            <button className="loginBtn" type="submit" disabled={loading}>
              {loading ? (
                <>Signing in…</>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="loginFooter">Campus AR · System Administration</p>
        </div>
      </div>
    </div>
  )
}