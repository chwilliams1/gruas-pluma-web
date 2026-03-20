'use client'

import { FileDown } from 'lucide-react'
import { useState } from 'react'
import type { ReportePDFData } from '@/lib/generateReportePDF'

export function DownloadPDFBtn({ data }: { data: ReportePDFData }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const { generateAndDownloadPDF } = await import('@/lib/generateReportePDF')
      await generateAndDownloadPDF(data)
    } catch {
      alert('Error al generar el PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="p-2 rounded-md text-ink-tertiary hover:text-amber hover:bg-amber-subtle transition-colors duration-150 cursor-pointer bg-transparent border-none disabled:opacity-50"
      title="Descargar PDF"
    >
      <FileDown size={14} />
    </button>
  )
}
