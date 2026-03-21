import prisma from '@/lib/prisma'
import { KpiCard } from '@/components/ui/KpiCard'
import { TogglePagadoBtn } from '@/components/TogglePagadoBtn'
import { CycleEstadoBtn } from '@/components/CycleEstadoBtn'
import { DollarSign, CheckCircle, AlertTriangle, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FacturacionPage() {
  const reportes = await prisma.reporte.findMany({
    include: {
      solicitud: { include: { cliente: true } },
      chofer: true
    },
    orderBy: { creadoEn: 'desc' }
  })

  const totalMonto = reportes.reduce((s, r) => s + r.monto, 0)
  const cobrado = reportes.filter(r => r.pagado).reduce((s, r) => s + r.monto, 0)
  const pendiente = reportes.filter(r => !r.pagado).reduce((s, r) => s + r.monto, 0)
  const facturados = reportes.filter(r => r.estadoReporte === 'FACTURADO').length
  const porFacturar = reportes.filter(r => r.estadoReporte === 'POR FACTURAR').length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-text m-0">Facturación</h1>
          <p className="text-[13px] text-brand-text-light mt-1">Resumen de cobros y pagos</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <KpiCard icon={<DollarSign size={20}/>} value={`$${(totalMonto/1000).toFixed(0)}k`} label="Total facturado" type="blue" />
        <KpiCard icon={<CheckCircle size={20}/>} value={`$${(cobrado/1000).toFixed(0)}k`} label="Cobrado" type="success" />
        <KpiCard icon={<AlertTriangle size={20}/>} value={`$${(pendiente/1000).toFixed(0)}k`} label="Pendiente de cobro" type="danger" />
        <KpiCard icon={<FileText size={20}/>} value={`${facturados} / ${porFacturar}`} label="Facturados / Por facturar" />
      </div>

      {/* Progress bar */}
      <div className="bg-brand-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-brand-border mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[13px] font-bold text-brand-text">Progreso de cobro</span>
          <span className="text-[13px] text-brand-text-mid font-semibold">{totalMonto > 0 ? Math.round((cobrado / totalMonto) * 100) : 0}%</span>
        </div>
        <div className="w-full h-3 bg-brand-divider rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-success to-brand-blue rounded-full transition-all"
            style={{ width: `${totalMonto > 0 ? (cobrado / totalMonto) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[11px] text-brand-success font-semibold">${cobrado.toLocaleString('es-CL')} cobrado</span>
          <span className="text-[11px] text-brand-danger font-semibold">${pendiente.toLocaleString('es-CL')} pendiente</span>
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
              <CycleEstadoBtn reporteId={r.id} estado={r.estadoReporte ?? 'SIN FACTURA'} />
            </div>
            {r.solicitud.cliente.rut && (
              <div className="text-[11px] text-brand-text-light font-mono mb-2">RUT: {r.solicitud.cliente.rut}</div>
            )}
            <div className="grid grid-cols-3 gap-2 text-center py-2 mb-2 bg-brand-bg rounded-lg">
              <div>
                <div className="text-[10px] text-brand-text-light">Horas</div>
                <div className="text-[12px] font-bold text-brand-text">{r.horas}{(r.horasExtra ?? 0) > 0 ? `+${r.horasExtra}` : ''}</div>
              </div>
              <div>
                <div className="text-[10px] text-brand-text-light">Val/Hora</div>
                <div className="text-[12px] font-bold text-brand-text">${((r.valorHora ?? 0)/1000).toFixed(0)}k</div>
              </div>
              <div>
                <div className="text-[10px] text-brand-text-light">Monto</div>
                <div className="text-[12px] font-bold text-brand-primary">${((r.monto ?? 0)/1000).toFixed(0)}k</div>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <TogglePagadoBtn reporteId={r.id} pagado={r.pagado} />
            </div>
          </div>
        ))}
        {reportes.length === 0 && (
          <div className="text-[13px] text-brand-text-light py-12 text-center italic bg-brand-card rounded-xl border border-brand-border">No hay datos de facturación</div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-brand-card rounded-2xl overflow-hidden shadow-sm border border-brand-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-divider text-[11px] font-bold text-brand-text-light uppercase tracking-wider">
                <th className="py-3 px-4 border-b-2 border-brand-border">N° Reporte</th>
                <th className="py-3 px-4 border-b-2 border-brand-border">Cliente</th>
                <th className="py-3 px-4 border-b-2 border-brand-border">RUT</th>
                <th className="py-3 px-4 border-b-2 border-brand-border">Fecha</th>
                <th className="py-3 px-4 border-b-2 border-brand-border text-right">Val. Hora</th>
                <th className="py-3 px-4 border-b-2 border-brand-border text-right">Horas</th>
                <th className="py-3 px-4 border-b-2 border-brand-border text-right">H. Extra</th>
                <th className="py-3 px-4 border-b-2 border-brand-border text-right">Monto</th>
                <th className="py-3 px-4 border-b-2 border-brand-border text-center">Estado Reporte</th>
                <th className="py-3 px-4 border-b-2 border-brand-border text-center">Estado Pago</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map(r => (
                <tr key={r.id} className="hover:bg-brand-bg transition-colors border-b border-brand-divider last:border-0">
                  <td className="py-4 px-4 text-[13px] font-semibold text-brand-primary">{r.numeroReporte || r.codigo}</td>
                  <td className="py-4 px-4 text-[13px] font-semibold text-brand-text">{r.solicitud.cliente.nombre}</td>
                  <td className="py-4 px-4 text-[12px] text-brand-text-light font-mono">{r.solicitud.cliente.rut || '—'}</td>
                  <td className="py-4 px-4 text-[13px] text-brand-text-mid">{r.fecha}</td>
                  <td className="py-4 px-4 text-[13px] text-brand-text-mid text-right">${(r.valorHora ?? 0).toLocaleString('es-CL')}</td>
                  <td className="py-4 px-4 text-[13px] text-brand-text-mid text-right">{r.horas}</td>
                  <td className="py-4 px-4 text-[13px] text-brand-text-mid text-right">{(r.horasExtra ?? 0) > 0 ? r.horasExtra : '—'}</td>
                  <td className="py-4 px-4 text-[13px] font-bold text-brand-text text-right">${(r.monto ?? 0).toLocaleString('es-CL')}</td>
                  <td className="py-4 px-4 text-center">
                    <CycleEstadoBtn reporteId={r.id} estado={r.estadoReporte ?? 'SIN FACTURA'} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <TogglePagadoBtn reporteId={r.id} pagado={r.pagado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reportes.length === 0 && (
          <div className="text-[13px] text-brand-text-light py-12 text-center italic">No hay datos de facturación</div>
        )}
      </div>
    </div>
  )
}
