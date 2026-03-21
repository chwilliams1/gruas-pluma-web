'use client'

import { useState, Fragment } from 'react'
import { TogglePagadoBtn } from '@/components/TogglePagadoBtn'
import { EditReporteBtn } from '@/components/EditReporteForm'
import { DeleteReporteBtn } from '@/components/DeleteReporteBtn'
import { DownloadPDFBtn } from '@/components/DownloadPDFBtn'
import { CycleEstadoBtn } from '@/components/CycleEstadoBtn'
import { ChevronRight } from 'lucide-react'

type Reporte = {
  id: string
  codigo: string
  numeroReporte: number | null
  fecha: string
  horas: number
  horasExtra: number | null
  valorHora: number | null
  monto: number
  descripcion: string
  pagado: boolean
  estadoReporte: string | null
  choferId: string
  chofer: { id: string; nombre: string }
  solicitud: { clienteId: string; cliente: { nombre: string; rut: string | null } }
}

type Props = {
  reportes: Reporte[]
  choferes: { id: string; nombre: string }[]
  clientes: { id: string; nombre: string }[]
}

export function ReportesTable({ reportes, choferes, clientes }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggle = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className="bg-surface-1 rounded-xl border border-edge overflow-hidden">
      <table className="w-full text-left border-collapse table-fixed">
        <colgroup>
          <col className="w-[28px]" />
          <col className="w-[16%]" />
          <col className="w-[9%]" />
          <col className="w-[11%]" />
          <col className="w-[17%]" />
          <col className="w-[6%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[11%]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-edge-strong">
            <th className="py-2.5 px-2"></th>
            <th className="py-2.5 px-3 text-[11px] font-medium text-ink-tertiary uppercase tracking-[0.04em]">Responsable</th>
            <th className="py-2.5 px-3 text-[11px] font-medium text-ink-tertiary uppercase tracking-[0.04em]">N° Reporte</th>
            <th className="py-2.5 px-3 text-[11px] font-medium text-ink-tertiary uppercase tracking-[0.04em]">Fecha</th>
            <th className="py-2.5 px-3 text-[11px] font-medium text-ink-tertiary uppercase tracking-[0.04em]">Empresa</th>
            <th className="py-2.5 px-3 text-[11px] font-medium text-ink-tertiary uppercase tracking-[0.04em] text-right">Horas</th>
            <th className="py-2.5 px-3 text-[11px] font-medium text-ink-tertiary uppercase tracking-[0.04em] text-right">Monto</th>
            <th className="py-2.5 px-3 text-[11px] font-medium text-ink-tertiary uppercase tracking-[0.04em] text-center">Pago</th>
            <th className="py-2.5 px-3 text-[11px] font-medium text-ink-tertiary uppercase tracking-[0.04em] text-center">Estado</th>
            <th className="py-2.5 px-3 text-[11px] font-medium text-ink-tertiary uppercase tracking-[0.04em] text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reportes.map(r => {
            const isOpen = expandedId === r.id
            return (
              <Fragment key={r.id}>
                <tr
                  className={`cursor-pointer transition-colors duration-100 border-b border-edge ${isOpen ? 'bg-[rgba(0,0,0,0.02)]' : 'hover:bg-[rgba(0,0,0,0.015)]'}`}
                  onClick={() => toggle(r.id)}
                >
                  <td className="py-3 px-2 text-center">
                    <ChevronRight size={13} className={`text-ink-muted transition-transform duration-150 inline-block ${isOpen ? 'rotate-90' : ''}`} />
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-info-subtle text-info flex items-center justify-center text-[9px] font-semibold shrink-0">
                        {r.chofer.nombre.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span className="text-[13px] text-ink-secondary truncate">{r.chofer.nombre}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[13px] font-semibold text-ink tabular-nums">{r.numeroReporte || r.codigo}</td>
                  <td className="py-3 px-3 text-[13px] text-ink-secondary whitespace-nowrap">{r.fecha}</td>
                  <td className="py-3 px-3 text-[13px] font-medium text-ink truncate">{r.solicitud.cliente.nombre}</td>
                  <td className="py-3 px-3 text-[13px] text-ink-secondary text-right tabular-nums">
                    {r.horas}{(r.horasExtra ?? 0) > 0 ? <span className="text-ink-muted text-[11px]">+{r.horasExtra}</span> : ''}
                  </td>
                  <td className="py-3 px-3 text-[13px] font-semibold text-ink text-right tabular-nums">${(r.monto ?? 0).toLocaleString('es-CL')}</td>
                  <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                    <TogglePagadoBtn reporteId={r.id} pagado={r.pagado} />
                  </td>
                  <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                    <CycleEstadoBtn reporteId={r.id} estado={r.estadoReporte ?? 'SIN FACTURA'} />
                  </td>
                  <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-0.5">
                      <DownloadPDFBtn data={{
                        codigo: r.codigo,
                        numeroReporte: r.numeroReporte,
                        fecha: r.fecha,
                        choferNombre: r.chofer.nombre,
                        clienteNombre: r.solicitud.cliente.nombre,
                        clienteRut: r.solicitud.cliente.rut,
                        clienteDireccion: null,
                        clienteTelefono: null,
                        descripcion: r.descripcion,
                        horas: r.horas,
                        horasExtra: r.horasExtra ?? 0,
                        valorHora: r.valorHora ?? 60000,
                        monto: r.monto,
                        estadoReporte: r.estadoReporte ?? 'SIN FACTURA',
                        pagado: r.pagado,
                      }} />
                      <EditReporteBtn
                        reporte={{
                          id: r.id, numeroReporte: r.numeroReporte, choferId: r.choferId,
                          clienteId: r.solicitud.clienteId, fecha: r.fecha, horas: r.horas,
                          horasExtra: r.horasExtra ?? 0, valorHora: r.valorHora ?? 60000,
                          monto: r.monto, descripcion: r.descripcion,
                          estadoReporte: r.estadoReporte ?? 'SIN FACTURA', pagado: r.pagado,
                        }}
                        choferes={choferes}
                        clientes={clientes}
                      />
                      <DeleteReporteBtn reporteId={r.id} />
                    </div>
                  </td>
                </tr>

                {isOpen && (
                  <tr key={`${r.id}-detail`} className="bg-[rgba(0,0,0,0.018)] border-b border-edge">
                    <td></td>
                    <td colSpan={9} className="py-3 px-3">
                      <div className="flex flex-wrap gap-x-10 gap-y-3">
                        <div>
                          <div className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.04em] mb-0.5">RUT</div>
                          <div className="text-[13px] text-ink-secondary font-mono">{r.solicitud.cliente.rut || '—'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.04em] mb-0.5">Valor Hora</div>
                          <div className="text-[13px] text-ink-secondary tabular-nums">${(r.valorHora ?? 0).toLocaleString('es-CL')}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.04em] mb-0.5">Horas Extra</div>
                          <div className="text-[13px] text-ink-secondary tabular-nums">{(r.horasExtra ?? 0) > 0 ? r.horasExtra : '—'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.04em] mb-0.5">Estado Reporte</div>
                          <CycleEstadoBtn reporteId={r.id} estado={r.estadoReporte ?? 'SIN FACTURA'} />
                        </div>
                        <div className="basis-full">
                          <div className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.04em] mb-0.5">Descripción</div>
                          <div className="text-[13px] text-ink-secondary leading-relaxed">{r.descripcion}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
      {reportes.length === 0 && (
        <div className="text-[13px] text-ink-tertiary py-12 text-center">No hay reportes</div>
      )}
    </div>
  )
}
