'use client'

import { createGrua } from '@/lib/actions'
import { useState, useTransition, useRef } from 'react'
import { Plus, X } from 'lucide-react'

export function NuevaGruaForm() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await createGrua(formData)
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
        <Plus size={16} /> Nueva Grúa
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-brand-card rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-brand-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-brand-text">Nueva Grúa</h2>
          <button onClick={() => setOpen(false)} className="text-brand-text-light hover:text-brand-text cursor-pointer bg-transparent border-none">
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Patente</label>
              <input name="patente" type="text" required placeholder="XXXX-00" className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent uppercase" />
            </div>
            <div className="flex-1">
              <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Año</label>
              <input name="anio" type="number" min="1990" max="2030" placeholder="2024" className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Marca</label>
              <input name="marca" type="text" required placeholder="Ej: Liebherr" className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
            </div>
            <div className="flex-1">
              <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Modelo</label>
              <input name="modelo" type="text" required placeholder="Ej: LTM 1025" className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Tipo</label>
              <select name="tipo" required className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
                <option value="">Seleccionar...</option>
                <option value="Pluma">Pluma</option>
                <option value="Telescópica">Telescópica</option>
                <option value="Articulada">Articulada</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Capacidad</label>
              <select name="capacidad" required className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
                <option value="">Seleccionar...</option>
                <option value="18 ton">18 ton</option>
                <option value="25 ton">25 ton</option>
                <option value="50 ton">50 ton</option>
                <option value="60 ton">60 ton</option>
                <option value="100 ton">100 ton</option>
                <option value="150 ton">150 ton</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Estado</label>
            <select name="estado" required className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
              <option value="DISPONIBLE">Disponible</option>
              <option value="EN_SERVICIO">En Servicio</option>
              <option value="MANTENCION">Mantención</option>
            </select>
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 px-5 py-2.5 rounded-lg border border-brand-border text-[13px] font-semibold text-brand-text-mid bg-brand-bg hover:bg-brand-divider transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex-1 px-5 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-dark transition-colors text-white text-[13px] font-bold cursor-pointer border-none shadow-sm disabled:opacity-50">
              {isPending ? 'Creando...' : 'Crear Grúa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
