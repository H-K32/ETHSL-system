import { getCertificatePdf } from '../api/lms.js'

export function getCertificateFileName(certificate) {
  const baseId = certificate?.certificate_id || certificate?.id || 'certificate'
  return `certificate-${baseId}.pdf`
}

export async function downloadCertificatePdf(certificate) {
  const blob = await getCertificatePdf(certificate.id)
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = objectUrl
  anchor.download = getCertificateFileName(certificate)
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 0)
}

export async function openCertificatePdf(certificate) {
  const blob = await getCertificatePdf(certificate.id)
  const objectUrl = URL.createObjectURL(blob)

  window.location.assign(objectUrl)

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 60000)
}