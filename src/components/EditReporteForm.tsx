'use client'

import { updateReporte } from '@/lib/actions'
import { useState, useTransition, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, X } from 'lucide-react'

type ReporteData = {
  id: string
  numeroReporte: number | null
  choferId: string
  clienteId: string
  fecha: string
  horas: number
  horasExtra: number
  valorHora: number
  monto: number
  descripcion: string
  estadoReporte: string
  pagado: boolean
}

export function EditReporteBtn({ reporte, choferes, clientes }: {
  reporte: ReporteData
  choferes: { id: string, nombre: string }[]
  clientes: { id: string, nombre: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('id', reporte.id)
    startTransition(async () => {
      await updateReporte(formData)
      setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-brand-text-light hover:text-brand-blue hover:bg-brand-blue-bg transition-all cursor-pointer bg-transparent border-none"
        title="Editar reporte"
      >
        <Pencil size={15} />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className="bg-brand-card rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-brand-border max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-brand-text">Editar Reporte</h2>
              <button onClick={() => setOpen(false)} className="text-brand-text-light hover:text-brand-text cursor-pointer bg-transparent border-none">
                <X size={20} />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Responsable</label>
                  <select name="choferId" required defaultValue={reporte.choferId} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
                    {choferes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Empresa / Cliente</label>
                  <select name="clienteId" required defaultValue={reporte.clienteId} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Fecha</label>
                  <input name="fecha" type="text" required defaultValue={reporte.fecha} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
                </div>
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">N° Reporte</label>
                  <input name="numeroReporte" type="number" defaultValue={reporte.numeroReporte ?? ''} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Valor Hora ($)</label>
                  <input name="valorHora" type="number" required defaultValue={reporte.valorHora ?? 60000} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
                </div>
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Horas</label>
                  <input name="horas" type="number" step="0.5" min="0" required defaultValue={reporte.horas} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
                </div>
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">H. Extra</label>
                  <input name="horasExtra" type="number" step="0.5" min="0" defaultValue={reporte.horasExtra ?? 0} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Informacion / Descripcion</label>
                <textarea name="descripcion" rows={2} required defaultValue={reporte.descripcion} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent resize-none" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Estado Reporte</label>
                  <select name="estadoReporte" defaultValue={reporte.estadoReporte ?? 'sin factura'} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
                    <option value="sin factura">Sin factura</option>
                    <option value="facturado">Facturado</option>
                    <option value="ESPERA OC">Espera OC</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Estado Pago</label>
                  <select name="pagado" defaultValue={reporte.pagado ? 'true' : 'false'} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
                    <option value="false">Pendiente</option>
                    <option value="true">Pagado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-5 py-2.5 rounded-lg border border-brand-border text-[13px] font-semibold text-brand-text-mid bg-brand-bg hover:bg-brand-divider transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="flex-1 px-5 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-dark transition-colors text-white text-[13px] font-bold cursor-pointer border-none shadow-sm disabled:opacity-50">
                  {isPending ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
