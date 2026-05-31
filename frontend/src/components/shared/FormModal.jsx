import { X } from 'lucide-react'

export default function FormModal({ open, title, onClose, onSubmit, loading, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(240,239,233,0.85)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-fade-in tech-card"
        style={{ background: '#FFFFFF', borderRadius: 3 }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #EBE9E3' }}
        >
          <div>
            <p className="bracket-label mb-0.5">[// form_input]</p>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, color: '#111' }}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-sm transition-colors duration-150"
            style={{ color: '#9C9890', border: '1px solid #DDD9D0' }}
            onMouseOver={e => { e.currentTarget.style.background='#F5F4EF'; e.currentTarget.style.color='#111' }}
            onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#9C9890' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="px-6 py-5 space-y-4">{children}</div>
          <div
            className="flex justify-end gap-3 px-6 py-4"
            style={{ borderTop: '1px solid #EBE9E3' }}
          >
            <button type="button" onClick={onClose} className="btn-ghost">[ Cancel ]</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? '[ Saving... ]' : '[ Save ]'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
