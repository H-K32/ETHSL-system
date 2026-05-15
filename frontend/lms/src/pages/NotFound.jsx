import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-slate-500">Page not found.</p>
      <Link to="/" className="inline-block mt-6 px-4 py-2 rounded-lg bg-brand-600 text-white">Go home</Link>
    </div>
  )
}
