'use client'

import { useEffect, useCallback } from 'react'

export default function ConfirmDialog({ title, message, confirmLabel, confirmStyle, onConfirm, onCancel }) {
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onCancel()
  }, [onCancel])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onCancel])

  return (
    <div className="overlay" onClick={handleOverlayClick}>
      <div className="confirmDialog" role="alertdialog" aria-modal="true" aria-label={title}>

        <div className="confirmIcon" data-style={confirmStyle || 'danger'}>
          {confirmStyle === 'info' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
        </div>

        <h3 className="confirmTitle">{title}</h3>
        <p className="confirmMessage">{message}</p>

        <div className="confirmActions">
          <button className="btnCancel" onClick={onCancel}>Cancel</button>
          <button
            className={`btnConfirm ${confirmStyle === 'info' ? 'btnConfirmEdit' : 'btnConfirmDanger'}`}
            onClick={onConfirm}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>

      </div>
    </div>
  )
}
