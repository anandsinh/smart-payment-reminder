'use client'
import { useState } from 'react'

const CATS = ['Credit Card','Society Maintenance','Utility Bill','Loan EMI','Insurance','Subscription','Other']
const CAT_ICONS = {
  'Credit Card': '💳', 'Society Maintenance': '🏘', 'Utility Bill': '⚡',
  'Loan EMI': '🏦', 'Insurance': '🛡', 'Subscription': '📱', 'Other': '📄'
}

export default function BillerModal({ biller, onSave, onDelete, onClose }) {
  const isEdit = !!biller
  const [form, setForm] = useState({
    name: biller?.name || '',
    category: biller?.category || 'Credit Card',
    notes: biller?.notes || '',
    reminder_day: biller?.reminder_day || 1,
    due_date: biller?.due_date || '',
    active: biller?.active ?? true,
  })
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleSave() {
    if (!form.name.trim()) { setError('Biller name is required'); return }
    onSave({ ...form, id: biller?.id, reminder_day: Math.min(31, Math.max(1, Number(form.reminder_day))) })
  }

  if (confirmDelete) {
    return (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal" style={{ width: 360 }}>
          <div className="modal-body" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑</div>
            <div className="modal-title" style={{ marginBottom: 8 }}>Delete "{biller.name}"?</div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
              This removes all history and payment data for this biller.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => onDelete(biller.id)}>Delete biller</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Biller' : 'Add Biller'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Name */}
          <div className="form-row">
            <label className="form-label">Biller name *</label>
            <input
              className="form-input"
              placeholder="e.g. SBI Credit Card"
              value={form.name}
              onChange={e => { set('name', e.target.value); setError('') }}
              style={error ? { borderColor: 'var(--red)' } : {}}
            />
            {error && <div className="form-error">{error}</div>}
          </div>

          {/* Category */}
          <div className="form-row">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATS.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
          </div>

          {/* Day + Due date */}
          <div className="form-row-2">
            <div className="form-row" style={{ margin: 0 }}>
              <label className="form-label">Reminder day (1–31)</label>
              <input
                className="form-input"
                type="number" min="1" max="31"
                value={form.reminder_day}
                onChange={e => set('reminder_day', e.target.value)}
              />
            </div>
            <div className="form-row" style={{ margin: 0 }}>
              <label className="form-label">Due date (optional)</label>
              <input
                className="form-input"
                type="date"
                value={form.due_date}
                onChange={e => set('due_date', e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-row">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Any notes about this biller…"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          {/* Active toggle */}
          <div className="toggle-row">
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Active</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Send reminders for this biller</div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
              <div className="toggle-track" />
              <div className="toggle-thumb" />
            </label>
          </div>

          {/* Delete */}
          {isEdit && (
            <div style={{ marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
                🗑 Delete biller
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {isEdit ? 'Save changes' : 'Add biller'}
          </button>
        </div>
      </div>
    </div>
  )
}
