export default function Toast({ title, sub, type = 'green' }) {
  const icons = { green: '✓', amber: '!', red: '✗', blue: 'i' }
  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{icons[type] || '•'}</div>
      <div>
        <div className="toast-title">{title}</div>
        {sub && <div className="toast-sub">{sub}</div>}
      </div>
    </div>
  )
}
