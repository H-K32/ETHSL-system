import { useEffect, useState } from 'react'
import { getCertificates } from '../../api/lms.js'
import { downloadCertificatePdf, openCertificatePdf } from '../../utils/certificates.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import '../../styles/certificates.css'

function formatIssuedAt(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString()
}

function buildLevelLabel(certificate) {
  if (!certificate) return 'Level'
  const rawLevel = certificate.level_display ?? certificate.level ?? certificate.level_name ?? certificate.course_level
  if (rawLevel === undefined || rawLevel === null || rawLevel === '') return 'Level'
  return String(rawLevel).toLowerCase().includes('level') ? String(rawLevel) : `Level ${rawLevel}`
}

export default function Certificates() {
  const { t } = useLanguage()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    getCertificates()
      .then((data) => {
        if (!mounted) return
        setCertificates(Array.isArray(data) ? data : data?.results || [])
        setError('')
      })
      .catch(() => {
        if (!mounted) return
        setError(t('loadingCertificates'))
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  async function handleOpen(certificate) {
    try { await openCertificatePdf(certificate) }
    catch { setError('Unable to open the certificate PDF.') }
  }

  async function handleDownload(certificate) {
    try {
      setDownloadingId(certificate.id)
      await downloadCertificatePdf(certificate)
    } catch {
      setError('Unable to download the certificate PDF.')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="certificates-page">
      <section className="certificates-hero">
        <div>
          <p className="certificates-kicker">{t('achievements')}</p>
          <h1>{t('certificatesTitle')}</h1>
          <p className="certificates-subtitle">{t('certSubtitle')}</p>
        </div>
        <div className="certificates-hero-badge">
          <strong>{certificates.length}</strong>
          <span>{t('earned')}</span>
        </div>
      </section>

      {loading ? (
        <div className="certificates-empty">{t('loadingCertificates')}</div>
      ) : error ? (
        <div className="certificates-empty certificates-error">{error}</div>
      ) : certificates.length === 0 ? (
        <div className="certificates-empty">{t('noCertificates')}</div>
      ) : (
        <div className="certificate-grid" role="list" aria-label="Certificate cards">
          {certificates.map((certificate) => (
            <article key={certificate.id} className="certificate-card" role="listitem">
              <button type="button" className="certificate-card-link" onClick={() => handleOpen(certificate)}>
                <span className="certificate-card-topline">
                  <span className="certificate-card-badge">🏅 {buildLevelLabel(certificate)}</span>
                  <span className="certificate-card-id">ID {certificate.certificate_id}</span>
                </span>
                <div className="certificate-card-visual">
                  <span className="certificate-card-icon">{t('tapToOpen')}</span>
                  <strong>{buildLevelLabel(certificate)}</strong>
                </div>
                <div className="certificate-card-meta">
                  <span>{t('issued')} {formatIssuedAt(certificate.issued_at)}</span>
                </div>
              </button>
              <button type="button" className="certificate-card-download certificate-card-download--bottom"
                onClick={() => handleDownload(certificate)} disabled={downloadingId === certificate.id}>
                {downloadingId === certificate.id ? t('downloading') : t('downloadPdf')}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
