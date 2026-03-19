import prisma from '@/lib/prisma'
import { TogglePagadoBtn } from '@/components/TogglePagadoBtn'
import { ImportReportesCSV } from '@/components/ImportReportesCSV'

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-text m-0">Reportes de Servicio</h1>
          <p className="text-[13px] text-brand-text-light mt-1">{reportes.length} reportes · Cobrado: ${(totalCobrado/1000).toFixed(0)}k · Pendiente: ${(totalPendiente/1000).toFixed(0)}k</p>
        </div>
        <ImportReportesCSV choferes={choferes} clientes={clientes} />
      </div>

      <div className="bg-brand-card rounded-2xl overflow-hidden shadow-sm border border-brand-border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-divider text-[11px] font-bold text-brand-text-light uppercase tracking-wider">
              <th className="py-3 px-6 border-b-2 border-brand-border">N° Reporte</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Fecha</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Chofer</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Cliente</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Horas</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Monto</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Estado</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map(r => (
              <tr key={r.id} className="hover:bg-brand-bg transition-colors border-b border-brand-divider last:border-0 group">
                <td className="py-4 px-6 text-[13px] font-semibold text-brand-primary">{r.codigo}</td>
                <td className="py-4 px-6 text-[13px] text-brand-text-mid">{r.fecha}</td>
                <td className="py-4 px-6 text-[13px] text-brand-text-mid flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-blue-bg text-brand-blue flex items-center justify-center text-[10px] font-bold shrink-0">
                    {r.chofer.nombre.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  {r.chofer.nombre}
                </td>
                <td className="py-4 px-6 text-[13px] font-semibold text-brand-text">{r.solicitud.cliente.nombre}</td>
                <td className="py-4 px-6 text-[13px] text-brand-text-mid">{r.horas}h</td>
                <td className="py-4 px-6 text-[13px] font-bold text-brand-text">${(r.monto).toLocaleString('es-CL')}</td>
                <td className="py-4 px-6">
                  <TogglePagadoBtn reporteId={r.id} pagado={r.pagado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reportes.length === 0 && (
          <div className="text-[13px] text-brand-text-light py-12 text-center italic">No hay reportes</div>
        )}
      </div>
    </div>
  )
}
