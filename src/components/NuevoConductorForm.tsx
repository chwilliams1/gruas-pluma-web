'use client'

import { createConductor } from '@/lib/actions'
import { useState, useTransition, useRef } from 'react'
import { Plus, X } from 'lucide-react'

export function NuevoConductorForm({ gruas }: { gruas: { id: string, patente: string, marca: string, modelo: string }[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await createConductor(formData)
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
        <Plus size={16} /> Nuevo Conductor
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-brand-card rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-brand-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-brand-text">Nuevo Conductor</h2>
          <button onClick={() => setOpen(false)} className="text-brand-text-light hover:text-brand-text cursor-pointer bg-transparent border-none">
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Nombre Completo</label>
            <input name="nombre" type="text" required className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Email</label>
              <input name="email" type="email" required placeholder="chofer@gruaspluma.cl" className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
            </div>
            <div className="flex-1">
              <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Contraseña</label>
              <input name="password" type="password" required className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Teléfono</label>
              <input name="telefono" type="text" placeholder="+56 9 ..." className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
            </div>
            <div className="flex-1">
              <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Licencia</label>
              <select name="licencia" required className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
                <option value="">Seleccionar...</option>
                <option value="A-2">A-2</option>
                <option value="A-4">A-4</option>
                <option value="A-5">A-5</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Grúa Asignada</label>
            <select name="gruaId" className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
              <option value="">Sin asignar</option>
              {gruas.map(g => <option key={g.id} value={g.id}>{g.patente} — {g.marca} {g.modelo}</option>)}
            </select>
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 px-5 py-2.5 rounded-lg border border-brand-border text-[13px] font-semibold text-brand-text-mid bg-brand-bg hover:bg-brand-divider transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex-1 px-5 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-dark transition-colors text-white text-[13px] font-bold cursor-pointer border-none shadow-sm disabled:opacity-50">
              {isPending ? 'Creando...' : 'Crear Conductor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
