import { useMemo } from 'react'

type Props = { data: { category: string; amount: number; color: string; icon: string }[] }

const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export default function PieChart({ data }: Props) {
  const total = useMemo(() => data.reduce((s, d) => s + d.amount, 0), [data])

  // Calculate pie segments
  const segments = useMemo(() => {
    let angle = 0
    return data
      .filter(d => d.amount > 0)
      .map(d => {
        const percent = (d.amount / total) * 100
        const startAngle = angle
        const endAngle = angle + (percent / 100) * 360
        angle = endAngle
        return { ...d, percent, startAngle, endAngle }
      })
  }, [data, total])

  // SVG path for each segment
  const getPath = (start: number, end: number, r: number = 90) => {
    if (end - start === 360) return `M 0 0 L ${r} 0 A ${r} ${r} 0 1 1 -${r} 0 A ${r} ${r} 0 1 1 ${r} 0 Z`
    const startRad = ((start - 90) * Math.PI) / 180
    const endRad = ((end - 90) * Math.PI) / 180
    const x1 = Math.cos(startRad) * r
    const y1 = Math.sin(startRad) * r
    const x2 = Math.cos(endRad) * r
    const y2 = Math.sin(endRad) * r
    const largeArc = end - start > 180 ? 1 : 0
    return `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-forest/65">
        Belum ada data pengeluaran
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Chart */}
      <div className="flex justify-center">
        <svg viewBox="-100 -100 200 200" className="w-48 h-48">
          {segments.map((s, i) => (
            <path
              key={i}
              d={getPath(s.startAngle, s.endAngle)}
              fill={s.color}
              stroke="white"
              strokeWidth={2}
              className="transition-opacity hover:opacity-80"
            />
          ))}
          {/* Center circle */}
          <circle r="35" fill="white" />
          <text textAnchor="middle" dominantBaseline="middle" className="text-[8px] font-bold fill-forest">
            {fmt(total).replace('Rp', '')}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-cream px-3 py-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-forest truncate">{s.icon} {s.category}</p>
              <p className="text-[10px] text-forest/60">{s.percent.toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}