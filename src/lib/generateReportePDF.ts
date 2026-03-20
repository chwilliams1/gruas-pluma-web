export type ReportePDFData = {
  codigo: string
  numeroReporte: number | null
  fecha: string
  choferNombre: string
  clienteNombre: string
  clienteRut: string | null
  clienteDireccion: string | null
  clienteTelefono: string | null
  descripcion: string
  horas: number
  horasExtra: number
  valorHora: number
  monto: number
  estadoReporte: string
  pagado: boolean
}

export async function generateAndDownloadPDF(data: ReportePDFData) {
  // Dynamic import only runs in browser
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF('p', 'mm', 'letter')
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentW = pageW - margin * 2
  let y = 20

  const ink = '#1a1a1a'
  const inkSecondary = '#525252'
  const inkTertiary = '#8a8a8a'
  const amber = '#e5940b'
  const edgeColor = '#d4d4d4'

  const drawLine = (yPos: number) => {
    doc.setDrawColor(edgeColor)
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, pageW - margin, yPos)
  }

  const labelValue = (label: string, value: string, xStart: number, yPos: number, labelW: number = 40) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(inkTertiary)
    doc.text(label.toUpperCase(), xStart, yPos)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(ink)
    doc.text(value || '—', xStart + labelW, yPos)
  }

  // ═══ HEADER ═══
  doc.setFillColor(amber)
  doc.rect(0, 0, pageW, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(ink)
  doc.text('GRÚAS PLUMA', margin, y + 12)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(amber)
  doc.text('REPORTE DE SERVICIO', pageW - margin, y + 8, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(inkSecondary)
  const reportNum = data.numeroReporte ? `N° ${data.numeroReporte}` : data.codigo
  doc.text(reportNum, pageW - margin, y + 14, { align: 'right' })

  y += 22
  drawLine(y)
  y += 8

  // ═══ REPORT INFO ═══
  const col1X = margin
  const col2X = margin + contentW / 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(amber)
  doc.text('DATOS DEL REPORTE', col1X, y)
  y += 7

  labelValue('Código:', data.codigo, col1X, y)
  labelValue('Fecha:', data.fecha, col2X, y)
  y += 6
  labelValue('Responsable:', data.choferNombre, col1X, y)
  labelValue('Estado:', data.pagado ? 'Pagado' : 'Pendiente de pago', col2X, y)
  y += 6
  labelValue('Estado Rpt:', data.estadoReporte, col1X, y)

  y += 10
  drawLine(y)
  y += 8

  // ═══ CLIENT INFO ═══
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(amber)
  doc.text('DATOS DEL CLIENTE', col1X, y)
  y += 7

  labelValue('Empresa:', data.clienteNombre, col1X, y)
  labelValue('RUT:', data.clienteRut || '—', col2X, y)
  y += 6
  if (data.clienteDireccion) {
    labelValue('Dirección:', data.clienteDireccion, col1X, y)
    y += 6
  }
  if (data.clienteTelefono) {
    labelValue('Teléfono:', data.clienteTelefono, col1X, y)
    y += 6
  }

  y += 4
  drawLine(y)
  y += 8

  // ═══ DESCRIPTION ═══
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(amber)
  doc.text('DESCRIPCIÓN DEL SERVICIO', col1X, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(ink)
  const descLines = doc.splitTextToSize(data.descripcion || 'Sin descripción', contentW)
  doc.text(descLines, col1X, y)
  y += descLines.length * 5 + 4

  drawLine(y)
  y += 8

  // ═══ BILLING TABLE ═══
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(amber)
  doc.text('DETALLE DE COBRO', col1X, y)
  y += 8

  const tableX = margin
  const colWidths = [contentW * 0.35, contentW * 0.15, contentW * 0.15, contentW * 0.15, contentW * 0.20]
  const headers = ['Concepto', 'Cantidad', 'Valor Hora', 'Subtotal', '']

  doc.setFillColor('#f5f5f5')
  doc.rect(tableX, y - 4, contentW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(inkTertiary)
  let xPos = tableX + 2
  headers.forEach((h, i) => {
    if (h) doc.text(h, xPos, y)
    xPos += colWidths[i]
  })
  y += 6

  const formatCLP = (n: number) => `$${n.toLocaleString('es-CL')}`

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(ink)

  // Normal hours
  xPos = tableX + 2
  doc.text('Horas de servicio', xPos, y)
  xPos += colWidths[0]
  doc.text(String(data.horas), xPos, y)
  xPos += colWidths[1]
  doc.text(formatCLP(data.valorHora), xPos, y)
  xPos += colWidths[2]
  doc.text(formatCLP(data.horas * data.valorHora), xPos, y)
  y += 6

  // Extra hours
  if (data.horasExtra > 0) {
    xPos = tableX + 2
    doc.text('Horas extra', xPos, y)
    xPos += colWidths[0]
    doc.text(String(data.horasExtra), xPos, y)
    xPos += colWidths[1]
    doc.text(formatCLP(data.valorHora), xPos, y)
    xPos += colWidths[2]
    doc.text(formatCLP(data.horasExtra * data.valorHora), xPos, y)
    y += 6
  }

  y += 2
  drawLine(y)
  y += 7

  // Total
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(ink)
  doc.text('TOTAL', tableX + 2, y)
  doc.setFontSize(13)
  doc.text(formatCLP(data.monto), pageW - margin, y, { align: 'right' })

  y += 12
  drawLine(y)
  y += 12

  // ═══ SIGNATURES ═══
  const sigY = y + 20
  const sigWidth = contentW * 0.35

  drawLine(sigY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(inkTertiary)
  doc.text('Firma Responsable', margin, sigY + 5)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(ink)
  doc.text(data.choferNombre, margin, sigY + 10)

  const sigRightX = pageW - margin - sigWidth
  doc.setDrawColor(edgeColor)
  doc.setLineWidth(0.3)
  doc.line(sigRightX, sigY, pageW - margin, sigY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(inkTertiary)
  doc.text('Firma Cliente', sigRightX, sigY + 5)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(ink)
  doc.text(data.clienteNombre, sigRightX, sigY + 10)

  // ═══ FOOTER ═══
  const footerY = doc.internal.pageSize.getHeight() - 12
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(inkTertiary)
  doc.text('Grúas Pluma — Documento generado automáticamente', margin, footerY)
  doc.text(new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }), pageW - margin, footerY, { align: 'right' })

  doc.setFillColor(amber)
  doc.rect(0, doc.internal.pageSize.getHeight() - 3, pageW, 3, 'F')

  // Save
  const filename = `reporte-${data.numeroReporte || data.codigo}.pdf`
  doc.save(filename)
}
