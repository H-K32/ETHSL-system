export default function ProgressBar({ value = 0 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
      <div className="h-full bg-brand-600 transition-all" style={{ width: `${v}%` }} />
    </div>
  )
}
