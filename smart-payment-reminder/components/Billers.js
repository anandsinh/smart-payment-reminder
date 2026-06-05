'use client'
import { getBillerStatus, daysUntilReminder } from '../lib/scheduler'

const CAT_ICONS = {
  'Credit Card': '💳', 'Society Maintenance': '🏘', 'Utility Bill': '⚡',
  'Loan EMI': '🏦', 'Insurance': '🛡', 'Subscription': '📱', 'Other': '📄'
}

export default function Billers({ billers, cycles, onEditBiller, onAddBiller }) {
  return (
    <>
      <div className="section-header">
        <div className="section-title">All billers ({billers.length})</div>
        <button className="btn btn-primary btn-sm" onClick={onAddBiller}>+ Add biller</button>
      </div>

      <div className="table-wrap">
        {billers.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No billers configured</div>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>Add recurring payments to track and get reminded</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Reminder day</th>
                <th>Status</th>
                <th>Next reminder</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {billers.sort((a, b) => a.reminder_day - b.reminder_day).map(b => {
                const cycle = cycles.find(c => c.biller_id === b.id)
                const status = b.active ? getBillerStatus(b, cycle) : 'inactive'
                const days = daysUntilReminder(b.reminder_day)

                const nextReminder = (() => {
                  if (!b.active || cycle?.paid) return '—'
                  if (days > 0) return `In ${days} days`
                  if (days === 0) return 'Today'
                  return `Overdue (${Math.abs(days)}d)`
                })()

                return (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.name}</div>
                      {b.notes && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{b.notes}</div>}
                    </td>
                    <td>
                      <span className="cat-chip">
                        {CAT_ICONS[b.category] || '📄'} {b.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent2)' }}>{b.reminder_day}</span>
                    </td>
                    <td>
                      {status === 'paid'     && <span className="badge badge-paid"><span className="dot" />Paid</span>}
                      {status === 'overdue'  && <span className="badge badge-overdue"><span className="dot" />Overdue</span>}
                      {status === 'pending'  && <span className="badge badge-pending"><span className="dot" />Pending</span>}
                      {status === 'due_today'&& <span className="badge badge-overdue"><span className="dot" />Due today</span>}
                      {status === 'inactive' && <span className="badge badge-inactive">Inactive</span>}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{nextReminder}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => onEditBiller(b)}>✏ Edit</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
