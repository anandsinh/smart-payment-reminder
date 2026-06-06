'use client'
import { getBillerStatus, daysUntilReminder } from '../lib/scheduler'

const CAT_ICONS = {
  'Credit Card': '💳', 'Society Maintenance': '🏘', 'Utility Bill': '⚡',
  'Loan EMI': '🏦', 'Insurance': '🛡', 'Subscription': '📱', 'Other': '📄'
}

function monthLabel(ym) {
  const [y, m] = ym.split('-')
  return new Date(y, m - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

export default function Dashboard({ billers, cycles, ym, onMarkPaid, onMarkUnpaid, onAddBiller, onEditBiller, stats }) {
  const { total, paid, pending, overdue } = stats
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0
  const active = billers.filter(b => b.active).sort((a, b) => a.reminder_day - b.reminder_day)

  return (
    <>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-label">Total billers</div>
          <div className="stat-value">{total}</div>
          <div className="stat-sub">{billers.filter(b => !b.active).length} inactive</div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-label">Paid this month</div>
          <div className="stat-value">{paid}</div>
          <div className="stat-sub">{pct}% complete</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--green)' }} />
          </div>
        </div>
        <div className="stat-card stat-amber">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{pending}</div>
          <div className="stat-sub">awaiting payment</div>
        </div>
        <div className="stat-card stat-red">
          <div className="stat-label">Overdue</div>
          <div className="stat-value">{overdue}</div>
          <div className="stat-sub">action needed</div>
        </div>
      </div>

      {/* Bills table */}
      <div className="section-header">
        <div className="section-title">All bills — {monthLabel(ym)}</div>
        <button className="btn btn-primary btn-sm" onClick={onAddBiller}>+ Add biller</button>
      </div>

      <div className="table-wrap">
        {active.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No billers yet</div>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>Add your first biller to start tracking payments</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Biller</th>
                <th>Reminder day</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {active.map(b => {
                const cycle = cycles.find(c => c.biller_id === b.id)
                const status = getBillerStatus(b, cycle)
                const days = daysUntilReminder(b.reminder_day)
                const dayInfo = days > 0 ? `in ${days}d` : days === 0 ? 'today' : `${Math.abs(days)}d ago`

                return (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.name}</div>
                      <span className="cat-chip" style={{ marginTop: 3 }}>
                        {CAT_ICONS[b.category] || '📄'} {b.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent2)' }}>{b.reminder_day}</span>
                      <span style={{ color: 'var(--text3)', fontSize: 11, marginLeft: 6 }}>({dayInfo})</span>
                    </td>
                    <td>
                      {status === 'paid'      && <span className="badge badge-paid"><span className="dot" />Paid</span>}
                      {status === 'overdue'   && <span className="badge badge-overdue"><span className="dot" />Overdue</span>}
                      {status === 'due_today' && <span className="badge badge-overdue"><span className="dot" />Due today</span>}
                      {status === 'pending'   && <span className="badge badge-pending"><span className="dot" />Pending</span>}
                    </td>
                    <td>
                      {cycle?.paid ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => onMarkUnpaid(b.id)}>↩ Undo</button>
                      ) : (
                        <button className="btn btn-success btn-sm" onClick={() => onMarkPaid(b.id)}>✓ Mark paid</button>
                      )}
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
