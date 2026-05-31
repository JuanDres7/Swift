import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel, loading }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(240,239,233,0.85)', backdropFilter: 'blur(6px)' }}
        onClick={onCancel}
      />
      <div
        className="relative w-full max-w-sm mx-4 p-6 animate-fade-in tech-card"
        style={{ background: '#FFFFFF' }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-9 h-9 flex items-center justify-center rounded-sm shrink-0"
            style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}
          >
            <AlertTriangle className="w-4 h-4" style={{ color: '#DC2626' }} />
          </div>
          <div>
            <p className="bracket-label mb-1">[// warning]</p>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, color: '#111' }}>{title}</h3>
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#6B6868', marginTop: 6, lineHeight: 1.6 }}>{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="btn-ghost">[ Cancel ]</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger">
            {loading ? '[ Processing... ]' : '[ Confirm ]'}
          </button>
        </div>
      </div>
    </div>
  )
}
