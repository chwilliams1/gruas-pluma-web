'use client'

import { updateCliente } from '@/lib/actions'
import { useState, useTransition, useRef } from 'react'
import { Pencil, X } from 'lucide-react'

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
        className="p-2 rounded-lg text-brand-text-light hover:text-brand-blue hover:bg-brand-blue-bg transition-all cursor-pointer bg-transparent border-none"
        title="Editar cliente"
      >
        <Pencil size={15} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-brand-card rounded-2xl p-8 w-full max-w-md shadow-2xl border border-brand-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-brand-text">Editar Cliente</h2>
              <button onClick={() => setOpen(false)} className="text-brand-text-light hover:text-brand-text cursor-pointer bg-transparent border-none">
                <X size={20} />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Nombre / Empresa</label>
                <input name="nombre" type="text" required defaultValue={cliente.nombre} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
              </div>
              <div>
                <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">RUT</label>
                <input name="rut" type="text" defaultValue={cliente.rut || ''} placeholder="12345678-9" className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
              </div>
              <div>
                <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Teléfono</label>
                <input name="telefono" type="text" defaultValue={cliente.telefono || ''} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
              </div>
              <div>
                <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Dirección</label>
                <input name="direccion" type="text" defaultValue={cliente.direccion || ''} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
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
        </div>
      )}
    </>
  )
}
