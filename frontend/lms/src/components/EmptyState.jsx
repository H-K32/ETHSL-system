export default function EmptyState({ title = 'Nothing here yet', hint }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-slate-800 font-semibold">{title}</h3>
      {hint && <p className="text-sm text-slate-500 mt-1">{hint}</p>}
    </div>
  )
}
