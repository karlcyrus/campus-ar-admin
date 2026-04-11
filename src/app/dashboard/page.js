'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OfficeTable from '../components/OfficeTable'
import EditModal from '../components/EditModal'
import Toast from '../components/Toast'

export default function DashboardPage() {
  const router = useRouter()
  const [offices, setOffices]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [editingOffice, setEditing] = useState(null)
  const [toast, setToast]           = useState({ msg: '', visible: false })
  const [showDropdown, setShowDropdown] = useState(false)

  // Derived stats
  const totalOffices   = offices.length
  const liveOffices    = offices.filter(o => o.status === 'live').length
  const pendingOffices = offices.filter(o => o.status === 'pending').length
  const totalNodes     = [...new Set(offices.map(o => o.node))].length

  // Toast helper
  function showToast(msg) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3200)
  }

  // Fetch offices from API on mount
  async function fetchOffices() {
    try {
      setLoading(true)
      const res  = await fetch('/api/offices')
      if (res.status === 401) { router.push('/login'); return }
      const json = await res.json()
      if (json.success) setOffices(json.data)
      else showToast('Failed to load offices.')
    } catch {
      showToast('Network error. Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOffices() }, [])

  // Edit handler
  const handleEdit = useCallback((office) => setEditing(office), [])

  // Save — calls PUT /api/offices/[id]
  const handleSave = useCallback(async (updated) => {
    try {
      const res  = await fetch(`/api/offices/${updated.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          node_id:      updated.node,
          display_name: updated.name,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setEditing(null)
        showToast(`"${updated.name}" updated — marked as Pending.`)
        fetchOffices() // refresh from DB
      } else {
        showToast(json.error || 'Update failed.')
      }
    } catch {
      showToast('Network error.')
    }
  }, [])

  // Delete — calls DELETE /api/offices/[id]
  const handleDelete = useCallback(async (id, name) => {
    try {
      const res  = await fetch(`/api/offices/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        showToast(`"${name}" removed.`)
        fetchOffices()
      } else {
        showToast(json.error || 'Delete failed.')
      }
    } catch {
      showToast('Network error.')
    }
  }, [])

  // Publish all — calls POST /api/offices
  async function handlePublishAll() {
    try {
      const res  = await fetch('/api/offices', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        showToast(json.message || 'All changes published!')
        fetchOffices()
      } else {
        showToast(json.error || 'Publish failed.')
      }
    } catch {
      showToast('Network error.')
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    router.push('/login')
  }

  return (
    <div className="dashPage">

      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbarLeft">
          <div className="logo">
            <div className="logoMark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
                <line x1="12" y1="2" x2="12" y2="22"/>
                <path d="M2 8.5l10 7 10-7"/>
              </svg>
            </div>
            <span className="logoText">Campus AR <span>| Admin</span></span>
          </div>
          <div className="dividerV" />
          <span className="topbarSub">Office Nodes</span>
        </div>

        <div className="topbarRight">
          <button className="publishBtn" onClick={handlePublishAll}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            <span className="publishText">Publish All</span>
          </button>

          <div className="avatarWrap">
            <button
              className="avatarBtn"
              title="Admin User"
              onClick={() => setShowDropdown(d => !d)}
            >AD</button>

            {showDropdown && (
              <div className="avatarDropdown">
                <button
                  className="dropdownItem"
                  onClick={handleLogout}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="pageBody">
        <div className="pageHeading">
          <h1>Office Management</h1>
          <p>Manage AR node assignments for all campus offices.</p>
        </div>

        {/* STATS */}
        <div className="statsRow">
          <div className="statCard" style={{ animationDelay: '.05s' }}>
            <div className="statIcon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="statInfo">
              <div className="statVal">{totalOffices}</div>
              <div className="statLabel">Total Offices</div>
            </div>
          </div>

          <div className="statCard" style={{ animationDelay: '.1s' }}>
            <div className="statIcon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="statInfo">
              <div className="statVal">{liveOffices}</div>
              <div className="statLabel">Live Offices</div>
            </div>
          </div>

          <div className={`statCard${pendingOffices > 0 ? ' warn' : ''}`} style={{ animationDelay: '.15s' }}>
            <div className="statIcon yellow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="statInfo">
              <div className="statVal">{pendingOffices}</div>
              <div className="statLabel">Unpublished Changes</div>
            </div>
          </div>

          <div className="statCard" style={{ animationDelay: '.2s' }}>
            <div className="statIcon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                <path d="M4.93 4.93a10 10 0 0 0 0 14.14"/>
              </svg>
            </div>
            <div className="statInfo">
              <div className="statVal">{totalNodes}</div>
              <div className="statLabel">Active Nodes</div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="tableCard" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text2)' }}>
            Loading offices...
          </div>
        ) : (
          <OfficeTable
            offices={offices}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* MODAL */}
      {editingOffice && (
        <EditModal
          office={editingOffice}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {/* TOAST */}
      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}