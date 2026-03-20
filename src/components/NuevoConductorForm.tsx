'use client'

import { createConductor } from '@/lib/actions'
import { useState, useTransition, useRef, useEffect } from 'react'
import { Plus, X } from 'lucide-react'

const inputClass = "w-full px-3 py-2.5 rounded-lg border border-control-border bg-control-bg text-[13px] text-ink placeholder:text-ink-muted outline-none transition-colors duration-150 focus:border-amber focus:ring-2 focus:ring-control-focus"
const labelClass = "text-[11px] font-medium text-ink-tertiary uppercase tracking-[0.04em] block mb-1.5"

export function NuevoConductorForm({ gruas }: { gruas: { id: string, patente: string, marca: string, modelo: string }[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

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
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber hover:bg-amber-hover transition-colors duration-150 text-white text-[13px] font-medium cursor-pointer border-none">
        <Plus size={15} /> Nuevo Conductor
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 backdrop-blur-[2px]" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="bg-surface-1 rounded-t-2xl sm:rounded-xl p-6 w-full sm:max-w-lg border border-edge sm:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[16px] font-semibold text-ink tracking-[-0.02em]">Nuevo Conductor</h2>
          <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-ink-tertiary hover:text-ink-secondary hover:bg-[rgba(0,0,0,0.04)] transition-colors duration-150 cursor-pointer bg-transparent border-none">
            <X size={16} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Nombre Completo</label>
            <input name="nombre" type="text" required className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" required placeholder="chofer@gruaspluma.cl" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contraseña</label>
              <input name="password" type="password" required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Teléfono</label>
              <input name="telefono" type="text" placeholder="+56 9 ..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Licencia</label>
              <select name="licencia" required className={inputClass}>
                <option value="">Seleccionar...</option>
                <option value="A-2">A-2</option>
                <option value="A-4">A-4</option>
                <option value="A-5">A-5</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Grúa Asignada</label>
            <select name="gruaId" className={inputClass}>
              <option value="">Sin asignar</option>
              {gruas.map(g => <option key={g.id} value={g.id}>{g.patente} — {g.marca} {g.modelo}</option>)}
            </select>
          </div>

          <div className="flex gap-3 mt-1 pt-4 border-t border-edge">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-edge text-[13px] font-medium text-ink-secondary hover:bg-[rgba(0,0,0,0.03)] transition-colors duration-150 cursor-pointer bg-transparent">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex-1 px-4 py-2.5 rounded-lg bg-amber hover:bg-amber-hover transition-colors duration-150 text-white text-[13px] font-medium cursor-pointer border-none disabled:opacity-50">
              {isPending ? 'Creando...' : 'Crear Conductor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
