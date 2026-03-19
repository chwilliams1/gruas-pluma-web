'use client'

import { createSolicitud } from '@/lib/actions'
import { useState, useTransition, useRef } from 'react'
import { Plus, X } from 'lucide-react'

export function NuevaSolicitudForm({ clientes }: { clientes: { id: string, nombre: string }[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await createSolicitud(formData)
      formRef.current?.reset()
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent-dark transition-colors text-white text-[13px] font-bold cursor-pointer border-none shadow-sm"
      >
        <Plus size={16} /> Nueva Solicitud
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-brand-card rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-brand-border animate-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-brand-text">Nueva Solicitud</h2>
          <button onClick={() => setOpen(false)} className="text-brand-text-light hover:text-brand-text cursor-pointer bg-transparent border-none">
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Cliente</label>
            <select name="clienteId" required className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
              <option value="">Seleccionar...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Tipo de Servicio</label>
            <select name="tipo" required className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
              <option value="">Seleccionar...</option>
              <option>Izaje</option>
              <option>Montaje</option>
              <option>Descarga</option>
              <option>Traslado</option>
              <option>Otro</option>
            </select>
          </div>

          <div>
            <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Descripción</label>
            <textarea name="descripcion" required rows={3} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent resize-none" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Fecha</label>
              <input name="fecha" type="text" placeholder="20 Mar 2026" required className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
            </div>
            <div className="flex-1">
              <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Horario</label>
              <select name="hora" required className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
                <option>Mañana (8-12)</option>
                <option>Tarde (14-18)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Dirección</label>
            <input name="direccion" type="text" required className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 px-5 py-2.5 rounded-lg border border-brand-border text-[13px] font-semibold text-brand-text-mid bg-brand-bg hover:bg-brand-divider transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex-1 px-5 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-dark transition-colors text-white text-[13px] font-bold cursor-pointer border-none shadow-sm disabled:opacity-50">
              {isPending ? 'Creando...' : 'Crear Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
