'use client'

import { useState } from 'react'

export default function OfficeTable({ offices, onEdit, onDelete }) {
  const [query, setQuery] = useState('')

  const filtered = offices.filter(o =>
    o.name?.toLowerCase().includes(query.toLowerCase()) ||
    o.node?.toString().includes(query)
  )

  return (
    <div className="tableCard">
      <div className="tableToolbar">
        <span className="tableTitle">All Offices</span>
        <div className="searchWrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="searchInput"
            type="text"
            placeholder="Search offices…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="tableScroller">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Office Name</th>
              <th>Node Type</th>
              <th>Current Node</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr className="emptyRow">
                <td colSpan={6}>No offices found.</td>
              </tr>
            ) : (
              filtered.map(office => (
                <OfficeRow
                  key={office.id}
                  office={office}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OfficeRow({ office, onEdit, onDelete }) {
  const isLive = office.status === 'live'
  const [imgError, setImgError] = useState(false)

  return (
    <tr>
      <td>
        <div className="tableThumbnail">
          {office.image_url && !imgError ? (
            <img
              src={office.image_url}
              alt={office.name}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="thumbPlaceholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
          )}
        </div>
      </td>
      <td className="cellName">{office.name}</td>
      <td className="cellBuilding">{office.node_type || '—'}</td>
      <td>
        <span className="nodeBadge">Node {office.node}</span>
      </td>
      <td>
        <span className={`statusDot ${office.status}`}>
          <span className={`dot ${isLive ? 'live' : 'pending'}`} />
          {isLive ? 'Live' : 'Pending Publish'}
        </span>
      </td>
      <td>
        <div className="actionsCell">
          <button
            className="actionBtn btnEdit"
            onClick={() => onEdit(office)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
            </svg>
            Edit
          </button>
          <button
            className="actionBtn btnDelete"
            onClick={() => onDelete(office.id, office.name)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
