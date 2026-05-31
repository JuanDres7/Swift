const config = {
  pendiente:    { label: 'PENDING',    color: '#6B6868',  border: '#C5C2BB' },
  confirmado:   { label: 'CONFIRMED',  color: '#1D4ED8',  border: '#93C5FD' },
  enviado:      { label: 'SHIPPED',    color: '#B45309',  border: '#FCD34D' },
  entregado:    { label: 'DELIVERED',  color: '#15803D',  border: '#86EFAC' },
  cancelado:    { label: 'CANCELLED',  color: '#DC2626',  border: '#FCA5A5' },
  preparando:   { label: 'PREPARING',  color: '#6B6868',  border: '#C5C2BB' },
  en_camino:    { label: 'IN_TRANSIT', color: '#1D4ED8',  border: '#93C5FD' },
  devuelto:     { label: 'RETURNED',   color: '#9A3412',  border: '#FDBA74' },
  disponible:   { label: 'AVAILABLE',  color: '#15803D',  border: '#86EFAC' },
  'stock bajo': { label: 'LOW_STOCK',  color: '#B45309',  border: '#FCD34D' },
  agotado:      { label: 'OUT_STOCK',  color: '#DC2626',  border: '#FCA5A5' },
}

export default function EstadoBadge({ estado }) {
  const c = config[estado] ?? { label: estado?.toUpperCase(), color: '#6B6868', border: '#C5C2BB' }
  return (
    <span
      style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: 9,
        letterSpacing: '0.1em',
        color: c.color,
        border: `1px solid ${c.border}`,
        borderRadius: 1,
        padding: '2px 7px',
        background: 'transparent',
        display: 'inline-block',
      }}
    >
      [{c.label}]
    </span>
  )
}
