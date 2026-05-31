export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <p className="bracket-label mb-1">[// {description || title.toLowerCase()}]</p>
        <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', color: '#111111' }}>
          {title}
        </h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
