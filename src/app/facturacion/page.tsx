import prisma from '@/lib/prisma'
import { KpiCard } from '@/components/ui/KpiCard'
import { TogglePagadoBtn } from '@/components/TogglePagadoBtn'
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
  const conFactura = reportes.filter(r => r.factura).length

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-text m-0">Facturación</h1>
          <p className="text-[13px] text-brand-text-light mt-1">Resumen de cobros y pagos</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8 flex-wrap">
        <KpiCard icon={<DollarSign size={20}/>} value={`$${(totalMonto/1000).toFixed(0)}k`} label="Total facturado" type="blue" />
        <KpiCard icon={<CheckCircle size={20}/>} value={`$${(cobrado/1000).toFixed(0)}k`} label="Cobrado" type="success" />
        <KpiCard icon={<AlertTriangle size={20}/>} value={`$${(pendiente/1000).toFixed(0)}k`} label="Pendiente de cobro" type="danger" />
        <KpiCard icon={<FileText size={20}/>} value={conFactura} label="Con factura emitida" />
      </div>

      {/* Progress bar */}
      <div className="bg-brand-card rounded-2xl p-6 shadow-sm border border-brand-border mb-8">
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

      {/* Table */}
      <div className="bg-brand-card rounded-2xl overflow-hidden shadow-sm border border-brand-border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-divider text-[11px] font-bold text-brand-text-light uppercase tracking-wider">
              <th className="py-3 px-6 border-b-2 border-brand-border">N° Reporte</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Cliente</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Fecha</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Horas</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Monto</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Factura</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Estado Pago</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map(r => (
              <tr key={r.id} className="hover:bg-brand-bg transition-colors border-b border-brand-divider last:border-0">
                <td className="py-4 px-6 text-[13px] font-semibold text-brand-primary">{r.codigo}</td>
                <td className="py-4 px-6 text-[13px] font-semibold text-brand-text">{r.solicitud.cliente.nombre}</td>
                <td className="py-4 px-6 text-[13px] text-brand-text-mid">{r.fecha}</td>
                <td className="py-4 px-6 text-[13px] text-brand-text-mid">{r.horas}h</td>
                <td className="py-4 px-6 text-[13px] font-bold text-brand-text">${r.monto.toLocaleString('es-CL')}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold ${r.factura ? 'bg-brand-blue-bg text-brand-blue' : 'bg-brand-divider text-brand-text-light'}`}>
                    {r.factura ? 'Emitida' : 'Sin factura'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <TogglePagadoBtn reporteId={r.id} pagado={r.pagado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reportes.length === 0 && (
          <div className="text-[13px] text-brand-text-light py-12 text-center italic">No hay datos de facturación</div>
        )}
      </div>
    </div>
  )
}
