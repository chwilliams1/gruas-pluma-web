import prisma from '@/lib/prisma'
import { ImportReportesCSV } from '@/components/ImportReportesCSV'
import { NuevoReporteForm } from '@/components/NuevoReporteForm'
import { ReportesTable } from '@/components/ReportesTable'
import { SearchFilterBar, Pagination } from '@/components/SearchFilterBar'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

export default async function ReportesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const q = params.q || ''
  const estado = params.estado || ''
  const pago = params.pago || ''
  const page = Math.max(1, parseInt(params.page || '1', 10))

  const where: Prisma.ReporteWhereInput = {}

  if (q) {
    where.OR = [
      { codigo: { contains: q, mode: 'insensitive' } },
      { descripcion: { contains: q, mode: 'insensitive' } },
      { solicitud: { cliente: { nombre: { contains: q, mode: 'insensitive' } } } },
      { chofer: { nombre: { contains: q, mode: 'insensitive' } } },
    ]
  }

  if (estado) {
    where.estadoReporte = estado
  }

  if (pago === 'pagado') {
    where.pagado = true
  } else if (pago === 'pendiente') {
    where.pagado = false
  }

  const [reportes, totalCount] = await Promise.all([
    prisma.reporte.findMany({
      where,
      include: {
        solicitud: { include: { cliente: true } },
        chofer: true
      },
      orderBy: { creadoEn: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.reporte.count({ where }),
  ])

  const choferes = await prisma.usuario.findMany({
    where: { rol: 'CHOFER' },
    select: { id: true, nombre: true }
  })
  const clientes = await prisma.cliente.findMany({
    select: { id: true, nombre: true }
  })

  const totalCobrado = reportes.filter(r => r.pagado).reduce((s, r) => s + r.monto, 0)
  const totalPendiente = reportes.filter(r => !r.pagado).reduce((s, r) => s + r.monto, 0)
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-[-0.02em] m-0">Reportes de Servicio</h1>
          <p className="text-[12px] sm:text-[13px] text-ink-tertiary mt-1">{totalCount} reportes · Cobrado: ${(totalCobrado/1000).toFixed(0)}k · Pendiente: ${(totalPendiente/1000).toFixed(0)}k</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <NuevoReporteForm choferes={choferes} clientes={clientes} />
          <ImportReportesCSV choferes={choferes} clientes={clientes} />
        </div>
      </div>

      <SearchFilterBar
        placeholder="Buscar por codigo, cliente, chofer..."
        filters={[
          {
            key: 'estado',
            label: 'Estado reporte',
            options: [
              { label: 'Sin factura', value: 'sin factura' },
              { label: 'Por facturar', value: 'POR FACTURAR' },
              { label: 'Facturado', value: 'FACTURADO' },
              { label: 'Espera OC', value: 'ESPERA OC' },
            ]
          },
          {
            key: 'pago',
            label: 'Estado pago',
            options: [
              { label: 'Pagado', value: 'pagado' },
              { label: 'Pendiente', value: 'pendiente' },
            ]
          }
        ]}
      />

      <ReportesTable
        reportes={reportes}
        choferes={choferes}
        clientes={clientes}
      />

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  )
}
