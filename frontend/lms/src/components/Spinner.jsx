export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="w-full py-16 grid place-items-center text-slate-500">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}
