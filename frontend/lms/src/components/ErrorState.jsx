export default function ErrorState({ error, onRetry }) {
  const msg = error?.response?.data?.detail || error?.message || 'Something went wrong.'
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-red-700 font-medium">{msg}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-3 py-1.5 text-sm rounded-md bg-white border border-red-200 hover:bg-red-100 text-red-700"
        >
          Try again
        </button>
      )}
    </div>
  )
}
