'use client'

import { updateCliente } from '@/lib/actions'
import { useState, useTransition, useRef, useEffect } from 'react'
import { Pencil, X } from 'lucide-react'

const inputClass = "w-full px-3 py-2.5 rounded-lg border border-control-border bg-control-bg text-[13px] text-ink placeholder:text-ink-muted outline-none transition-colors duration-150 focus:border-amber focus:ring-2 focus:ring-control-focus"
const labelClass = "text-[11px] font-medium text-ink-tertiary uppercase tracking-[0.04em] block mb-1.5"

type ClienteData = {
  id: string
  nombre: string
  rut: string | null
  telefono: string | null
  direccion: string | null
}

export function EditClienteBtn({ cliente }: { cliente: ClienteData }) {
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
    formData.set('id', cliente.id)
    startTransition(async () => {
      await updateCliente(formData)
      setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-md text-ink-tertiary hover:text-info hover:bg-info-subtle transition-colors duration-150 cursor-pointer bg-transparent border-none"
        title="Editar cliente"
      >
        <Pencil size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 backdrop-blur-[2px]" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-surface-1 rounded-t-2xl sm:rounded-xl p-6 w-full sm:max-w-md border border-edge sm:mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[16px] font-semibold text-ink tracking-[-0.02em]">Editar Cliente</h2>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-ink-tertiary hover:text-ink-secondary hover:bg-[rgba(0,0,0,0.04)] transition-colors duration-150 cursor-pointer bg-transparent border-none">
                <X size={16} />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Nombre / Empresa</label>
                <input name="nombre" type="text" required defaultValue={cliente.nombre} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>RUT</label>
                <input name="rut" type="text" defaultValue={cliente.rut || ''} placeholder="12.345.678-9" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input name="telefono" type="text" defaultValue={cliente.telefono || ''} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Dirección</label>
                <input name="direccion" type="text" defaultValue={cliente.direccion || ''} className={inputClass} />
              </div>

              <div className="flex gap-3 mt-1 pt-4 border-t border-edge">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-edge text-[13px] font-medium text-ink-secondary hover:bg-[rgba(0,0,0,0.03)] transition-colors duration-150 cursor-pointer bg-transparent">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="flex-1 px-4 py-2.5 rounded-lg bg-amber hover:bg-amber-hover transition-colors duration-150 text-white text-[13px] font-medium cursor-pointer border-none disabled:opacity-50">
                  {isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
