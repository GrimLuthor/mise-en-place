export const TIME_MIN = 0
export const TIME_MAX = 1440  // 24 h in minutes — treat as "no upper limit" sentinel

export function formatMinutes(m: number): string {
  if (m <= 0) return '0 min'
  if (m >= TIME_MAX) return '24 h'
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem ? `${h} h ${rem} m` : `${h} h`
}

interface Props {
  value: [number, number]  // [minMinutes, maxMinutes]
  onChange: (v: [number, number]) => void
}

export default function TimeRangeSlider({ value, onChange }: Props) {
  const [lo, hi] = value

  const setLo = (raw: string) => {
    const n = Math.max(0, Math.min(Math.round(Number(raw)), hi - 1))
    if (!isNaN(n)) onChange([n, hi])
  }

  const setHi = (raw: string) => {
    const n = Math.max(lo + 1, Math.min(Math.round(Number(raw)), TIME_MAX))
    if (!isNaN(n)) onChange([lo, n])
  }

  const inputCls = 'w-16 text-center border border-input bg-input text-primary rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500'

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center gap-0.5">
        <input
          type="number" min={0} max={hi - 1} step={5}
          value={lo}
          onChange={e => setLo(e.target.value)}
          aria-label="Minimum time (minutes)"
          className={inputCls}
        />
        <span className="text-[10px] text-muted">{formatMinutes(lo)}</span>
      </div>

      <span className="text-faint text-sm">—</span>

      <div className="flex flex-col items-center gap-0.5">
        <input
          type="number" min={lo + 1} max={TIME_MAX} step={5}
          value={hi}
          onChange={e => setHi(e.target.value)}
          aria-label="Maximum time (minutes)"
          className={inputCls}
        />
        <span className="text-[10px] text-muted">{formatMinutes(hi)}</span>
      </div>
    </div>
  )
}
