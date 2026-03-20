import prisma from '@/lib/prisma'
import { TogglePagadoBtn } from '@/components/TogglePagadoBtn'
import { ImportReportesCSV } from '@/components/ImportReportesCSV'
import { NuevoReporteForm } from '@/components/NuevoReporteForm'
import { EditReporteBtn } from '@/components/EditReporteForm'
import { DeleteReporteBtn } from '@/components/DeleteReporteBtn'

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

  const estadoReporteStyle = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'facturado': return 'bg-brand-blue-bg text-brand-blue'
      case 'espera oc': return 'bg-brand-warning-bg text-brand-accent'
      default: return 'bg-brand-divider text-brand-text-light'
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-text m-0">Reportes de Servicio</h1>
          <p className="text-[12px] sm:text-[13px] text-brand-text-light mt-1">{reportes.length} reportes · Cobrado: ${(totalCobrado/1000).toFixed(0)}k · Pendiente: ${(totalPendiente/1000).toFixed(0)}k</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <NuevoReporteForm choferes={choferes} clientes={clientes} />
          <ImportReportesCSV choferes={choferes} clientes={clientes} />
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {reportes.map(r => (
          <div key={r.id} className="bg-brand-card rounded-xl p-4 shadow-sm border border-brand-border">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-brand-text truncate">{r.solicitud.cliente.nombre}</div>
                <div className="text-[11px] text-brand-text-light">{r.numeroReporte || r.codigo} · {r.fecha}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <EditReporteBtn
                  reporte={{
                    id: r.id, numeroReporte: r.numeroReporte, choferId: r.choferId,
                    clienteId: r.solicitud.clienteId, fecha: r.fecha, horas: r.horas,
                    horasExtra: r.horasExtra ?? 0, valorHora: r.valorHora ?? 60000,
                    monto: r.monto, descripcion: r.descripcion,
                    estadoReporte: r.estadoReporte ?? 'sin factura', pagado: r.pagado,
                  }}
                  choferes={choferes} clientes={clientes}
                />
                <DeleteReporteBtn reporteId={r.id} />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-brand-blue-bg text-brand-blue flex items-center justify-center text-[9px] font-bold shrink-0">
                {r.chofer.nombre.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <span className="text-[12px] text-brand-text-mid truncate">{r.chofer.nombre}</span>
            </div>

            {r.descripcion && (
              <div className="text-[11px] text-brand-text-light mb-2 line-clamp-2">{r.descripcion}</div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center py-2 mb-2 bg-brand-bg rounded-lg">
              <div>
                <div className="text-[10px] text-brand-text-light">Horas</div>
                <div className="text-[13px] font-bold text-brand-text">{r.horas}{(r.horasExtra ?? 0) > 0 ? `+${r.horasExtra}` : ''}</div>
              </div>
              <div>
                <div className="text-[10px] text-brand-text-light">Val/Hora</div>
                <div className="text-[13px] font-bold text-brand-text">${((r.valorHora ?? 0)/1000).toFixed(0)}k</div>
              </div>
              <div>
                <div className="text-[10px] text-brand-text-light">Monto</div>
                <div className="text-[13px] font-bold text-brand-primary">${((r.monto ?? 0)/1000).toFixed(0)}k</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${estadoReporteStyle(r.estadoReporte ?? 'sin factura')}`}>
                {r.estadoReporte ?? 'sin factura'}
              </span>
              <TogglePagadoBtn reporteId={r.id} pagado={r.pagado} />
            </div>
          </div>
        ))}
        {reportes.length === 0 && (
          <div className="text-[13px] text-brand-text-light py-12 text-center italic bg-brand-card rounded-xl border border-brand-border">No hay reportes</div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-brand-card rounded-2xl overflow-hidden shadow-sm border border-brand-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-divider text-[11px] font-bold text-brand-text-light uppercase tracking-wider">
                <th className="py-3 px-4 border-b-2 border-brand-border">Responsable</th>
                <th className="py-3 px-4 border-b-2 border-brand-border">N° Reporte</th>
                <th className="py-3 px-4 border-b-2 border-brand-border">Fecha</th>
                <th className="py-3 px-4 border-b-2 border-brand-border">Empresa</th>
                <th className="py-3 px-4 border-b-2 border-brand-border">RUT</th>
                <th className="py-3 px-4 border-b-2 border-brand-border text-right">Val. Hora</th>
                <th className="py-3 px-4 border-b-2 border-brand-border text-right">Horas</th>
                <th className="py-3 px-4 border-b-2 border-brand-border text-right">H. Extra</th>
                <th className="py-3 px-4 border-b-2 border-brand-border text-right">Monto</th>
                <th className="py-3 px-4 border-b-2 border-brand-border">Informacion</th>
                <th className="py-3 px-4 border-b-2 border-brand-border text-center">Estado Reporte</th>
                <th className="py-3 px-4 border-b-2 border-brand-border text-center">Estado</th>
                <th className="py-3 px-4 border-b-2 border-brand-border text-center sticky right-0 bg-brand-divider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map(r => (
                <tr key={r.id} className="hover:bg-brand-bg transition-colors border-b border-brand-divider last:border-0 group">
                  <td className="py-3 px-4 text-[13px] text-brand-text-mid">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-blue-bg text-brand-blue flex items-center justify-center text-[10px] font-bold shrink-0">
                        {r.chofer.nombre.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      {r.chofer.nombre}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-brand-primary">{r.numeroReporte || r.codigo}</td>
                  <td className="py-3 px-4 text-[13px] text-brand-text-mid">{r.fecha}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-brand-text">{r.solicitud.cliente.nombre}</td>
                  <td className="py-3 px-4 text-[12px] text-brand-text-light font-mono">{r.solicitud.cliente.rut || '—'}</td>
                  <td className="py-3 px-4 text-[13px] text-brand-text-mid text-right">${(r.valorHora ?? 0).toLocaleString('es-CL')}</td>
                  <td className="py-3 px-4 text-[13px] text-brand-text-mid text-right">{r.horas}</td>
                  <td className="py-3 px-4 text-[13px] text-brand-text-mid text-right">{(r.horasExtra ?? 0) > 0 ? r.horasExtra : '—'}</td>
                  <td className="py-3 px-4 text-[13px] font-bold text-brand-text text-right">${(r.monto ?? 0).toLocaleString('es-CL')}</td>
                  <td className="py-3 px-4 text-[12px] text-brand-text-mid max-w-[250px] truncate" title={r.descripcion}>{r.descripcion}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${estadoReporteStyle(r.estadoReporte ?? 'sin factura')}`}>
                      {r.estadoReporte ?? 'sin factura'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <TogglePagadoBtn reporteId={r.id} pagado={r.pagado} />
                  </td>
                  <td className="py-3 px-4 text-center sticky right-0 bg-brand-card group-hover:bg-brand-bg border-l border-brand-divider">
                    <div className="flex items-center justify-center gap-1">
                      <EditReporteBtn
                        reporte={{
                          id: r.id, numeroReporte: r.numeroReporte, choferId: r.choferId,
                          clienteId: r.solicitud.clienteId, fecha: r.fecha, horas: r.horas,
                          horasExtra: r.horasExtra ?? 0, valorHora: r.valorHora ?? 60000,
                          monto: r.monto, descripcion: r.descripcion,
                          estadoReporte: r.estadoReporte ?? 'sin factura', pagado: r.pagado,
                        }}
                        choferes={choferes} clientes={clientes}
                      />
                      <DeleteReporteBtn reporteId={r.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reportes.length === 0 && (
          <div className="text-[13px] text-brand-text-light py-12 text-center italic">No hay reportes</div>
        )}
      </div>
    </div>
  )
}
