import { useEffect, useMemo, useState } from 'react'
import { getCertificatePdf, getCertificates } from '../../api/lms.js'

function formatIssuedAt(value) {
  if (!value) return 'Recent'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recent'
  return date.toLocaleDateString()
}

function buildLevelLabel(certificate) {
  if (!certificate) return 'Level'
  const rawLevel = certificate.level ?? certificate.level_name ?? certificate.course_level
  if (rawLevel === undefined || rawLevel === null || rawLevel === '') return 'Level'
  return String(rawLevel).toLowerCase().includes('level') ? String(rawLevel) : `Level ${rawLevel}`
}

export default function Certificates() {
  const [certificates, setCertificates] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [pdfUrl, setPdfUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    getCertificates()
      .then((data) => {
        if (!mounted) return
        const list = Array.isArray(data) ? data : data?.results || []
        setCertificates(list)
        setSelectedId(list[0]?.id ?? null)
        setError('')
      })
      .catch((requestError) => {
        if (!mounted) return
        console.error('Failed loading certificates', requestError)
        setError('Unable to load certificates right now.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const selectedCertificate = useMemo(
    () => certificates.find((certificate) => certificate.id === selectedId) || certificates[0] || null,
    [certificates, selectedId],
  )

  useEffect(() => {
    if (!selectedCertificate?.id) {
      setPdfUrl('')
      return undefined
    }

    let mounted = true
    setPdfLoading(true)
    setError('')

    getCertificatePdf(selectedCertificate.id)
      .then((blob) => {
        if (!mounted) return
        const nextUrl = URL.createObjectURL(blob)
        setPdfUrl((currentUrl) => {
          if (currentUrl) URL.revokeObjectURL(currentUrl)
          return nextUrl
        })
      })
      .catch((requestError) => {
        if (!mounted) return
        console.error('Failed loading certificate PDF', requestError)
        setPdfUrl('')
        setError('Unable to load the certificate PDF.')
      })
      .finally(() => {
        if (mounted) setPdfLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [selectedCertificate?.id])

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [pdfUrl])

  return (
    <div className="certificates-page">
      <section className="certificates-hero">
        <div>
          <p className="certificates-kicker">Achievements</p>
          <h1>Certificates</h1>
          <p className="certificates-subtitle">
            Tap a certificate to expand it, preview the PDF, and download it when you need a copy.
          </p>
        </div>
        <div className="certificates-hero-badge">
          {certificates.length} earned
        </div>
      </section>

      {loading ? (
        <div className="certificates-empty">Loading certificates…</div>
      ) : error ? (
        <div className="certificates-empty certificates-error">{error}</div>
      ) : certificates.length === 0 ? (
        <div className="certificates-empty">
          No certificates earned yet. Complete a level to unlock your first certificate.
        </div>
      ) : (
        <>
          <div className="certificate-slides" role="list" aria-label="Certificate slides">
            {certificates.map((certificate) => {
              const isActive = certificate.id === selectedCertificate?.id

              return (
                <button
                  type="button"
                  key={certificate.id}
                  role="listitem"
                  className={`certificate-slide ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedId(certificate.id)}
                >
                  <span className="certificate-slide-level">{buildLevelLabel(certificate)}</span>
                  <div className="certificate-slide-visual">
                    <span className="certificate-slide-icon">🏅</span>
                    <span className="certificate-slide-label">Tap to expand</span>
                  </div>
                  <div className="certificate-slide-meta">
                    <strong>{certificate.title || certificate.level || 'Course certificate'}</strong>
                    <span>{formatIssuedAt(certificate.issued_at)}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <section className="certificate-viewer-card">
            <div className="certificate-viewer-header">
              <div>
                <p className="certificates-kicker">Selected certificate</p>
                <h2>{selectedCertificate?.title || selectedCertificate?.level || 'Certificate'}</h2>
              </div>

              <div className="certificate-actions">
                {pdfUrl && (
                  <a className="certificate-button primary" href={pdfUrl} download>
                    Download PDF
                  </a>
                )}
                {pdfUrl && (
                  <a className="certificate-button" href={pdfUrl} target="_blank" rel="noreferrer">
                    Open in new tab
                  </a>
                )}
              </div>
            </div>

            <div className="certificate-preview-shell">
              {pdfLoading ? (
                <div className="certificate-preview-state">Loading PDF preview…</div>
              ) : pdfUrl ? (
                <iframe
                  className="certificate-preview"
                  src={pdfUrl}
                  title="Certificate PDF preview"
                />
              ) : (
                <div className="certificate-preview-state">Preview unavailable.</div>
              )}
            </div>

            <div className="certificate-footer-bar">
              <div>
                <span className="certificate-footer-label">Level</span>
                <strong>{buildLevelLabel(selectedCertificate)}</strong>
              </div>
              <div>
                <span className="certificate-footer-label">Issued</span>
                <strong>{formatIssuedAt(selectedCertificate?.issued_at)}</strong>
              </div>
              <div>
                <span className="certificate-footer-label">Certificate ID</span>
                <strong>{selectedCertificate?.id ?? '—'}</strong>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}