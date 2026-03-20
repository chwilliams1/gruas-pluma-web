import prisma from '@/lib/prisma'
import { ImportReportesCSV } from '@/components/ImportReportesCSV'
import { NuevoReporteForm } from '@/components/NuevoReporteForm'
import { ReportesTable } from '@/components/ReportesTable'

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  const reportes = await prisma.reporte.findMany({
    include: {
      solicitud: { include: { cliente: true } },
      chofer: true
    },
    orderBy: { creadoEn: 'desc' }
  })

  const choferes = await prisma.usuario.findMany({
    where: { rol: 'CHOFER' },
    select: { id: true, nombre: true }
  })
  const clientes = await prisma.cliente.findMany({
    select: { id: true, nombre: true }
  })

  const totalCobrado = reportes.filter(r => r.pagado).reduce((s, r) => s + r.monto, 0)
  const totalPendiente = reportes.filter(r => !r.pagado).reduce((s, r) => s + r.monto, 0)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-[-0.02em] m-0">Reportes de Servicio</h1>
          <p className="text-[12px] sm:text-[13px] text-ink-tertiary mt-1">{reportes.length} reportes · Cobrado: ${(totalCobrado/1000).toFixed(0)}k · Pendiente: ${(totalPendiente/1000).toFixed(0)}k</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <NuevoReporteForm choferes={choferes} clientes={clientes} />
          <ImportReportesCSV choferes={choferes} clientes={clientes} />
        </div>
      </div>

      <ReportesTable
        reportes={reportes}
        choferes={choferes}
        clientes={clientes}
      />
    </div>
  )
}
