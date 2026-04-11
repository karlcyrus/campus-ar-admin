'use client'

import { useState, useEffect, useCallback } from 'react'

export default function EditModal({ office, onClose, onSave }) {
  const [name, setName]       = useState('')
  const [node, setNode]       = useState('')
  const [nodes, setNodes]     = useState([])
  const [loadingNodes, setLoadingNodes] = useState(true)

  // Fetch valid nodes from API
  useEffect(() => {
    async function fetchNodes() {
      try {
        const res  = await fetch('/api/nodes')
        const json = await res.json()
        if (json.success) setNodes(json.data)
      } catch {
        console.error('Failed to fetch nodes')
      } finally {
        setLoadingNodes(false)
      }
    }
    fetchNodes()
  }, [])

  // Populate form when office prop changes
  useEffect(() => {
    if (office) {
      setName(office.name)
      setNode(office.node)
    }
  }, [office])

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  function handleSave() {
    if (!name.trim()) return
    onSave({ ...office, name: name.trim(), node, status: 'pending' })
  }

  if (!office) return null

  return (
    <div className="overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Edit Office Location">

        <div className="modalHeader">
          <div>
            <div className="modalEyebrow">Edit Record</div>
            <h2 className="modalTitle">Update Office Location</h2>
          </div>
          <button className="modalClose" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modalBody">
          <div>
            <label className="modalLabel" htmlFor="m-name">Office Name</label>
            <input
              id="m-name"
              className="modalInput"
              type="text"
              value={name}
              placeholder="e.g. Registrar"
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="modalLabel" htmlFor="m-node">Target Node ID</label>
            <div className="selectWrap">
              <select
                id="m-node"
                className="modalSelect"
                value={node}
                onChange={e => setNode(e.target.value)}
                disabled={loadingNodes}
              >
                {loadingNodes ? (
                  <option>Loading nodes...</option>
                ) : (
                  nodes.map(n => (
                    <option key={n.node_id} value={n.node_id}>
                      {n.node_id} ({n.node_type})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="modalFooter">
          <button className="btnCancel" onClick={onClose}>Cancel</button>
          <button className="btnSave" onClick={handleSave} disabled={loadingNodes}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Save Changes
          </button>
        </div>

      </div>
    </div>
  )
}