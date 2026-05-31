export default function DataTable({ columns, data, isLoading, emptyText = 'No hay datos' }) {
  if (isLoading) {
    return (
      <div className="tech-card">
        <div className="p-5 space-y-2.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-9" style={{ animationDelay: `${i * 70}ms` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="tech-card flex flex-col items-center justify-center py-16 gap-3">
        <p className="bracket-label">[ no_records_found ]</p>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#9C9890' }}>{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="tech-card overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="tech-table">
          <thead>
            <tr>
              {columns.map(col => <th key={col.key}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
