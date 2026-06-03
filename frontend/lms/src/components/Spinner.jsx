import { useLanguage } from '../context/LanguageContext.jsx'

export default function Spinner({ label }) {
  const { t } = useLanguage()
  return (
    <div className="w-full py-16 grid place-items-center text-slate-500">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">{label ?? t('loading')}</span>
      </div>
    </div>
  )
}
