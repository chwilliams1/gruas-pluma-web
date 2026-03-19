'use client'

import { updateGrua } from '@/lib/actions'
import { useState, useTransition, useRef } from 'react'
import { Pencil, X } from 'lucide-react'

type GruaData = {
  id: string
  patente: string
  marca: string
  modelo: string
  anio: number | null
  tipo: string
  capacidad: string
  estado: string
}

export function EditGruaBtn({ grua }: { grua: GruaData }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('id', grua.id)
    startTransition(async () => {
      await updateGrua(formData)
      setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-brand-text-light hover:text-brand-blue hover:bg-brand-blue-bg transition-all cursor-pointer bg-transparent border-none"
        title="Editar grúa"
      >
        <Pencil size={15} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-brand-card rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-brand-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-brand-text">Editar Grúa</h2>
              <button onClick={() => setOpen(false)} className="text-brand-text-light hover:text-brand-text cursor-pointer bg-transparent border-none">
                <X size={20} />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Patente</label>
                  <input name="patente" type="text" required defaultValue={grua.patente} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent uppercase" />
                </div>
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Año</label>
                  <input name="anio" type="number" min="1990" max="2030" defaultValue={grua.anio || ''} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Marca</label>
                  <input name="marca" type="text" required defaultValue={grua.marca} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
                </div>
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Modelo</label>
                  <input name="modelo" type="text" required defaultValue={grua.modelo} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Tipo</label>
                  <select name="tipo" required defaultValue={grua.tipo} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
                    <option value="Pluma">Pluma</option>
                    <option value="Telescópica">Telescópica</option>
                    <option value="Articulada">Articulada</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider block mb-1.5">Capacidad</label>
                  <select name="capacidad" required defaultValue={grua.capacidad} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
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
                <select name="estado" required defaultValue={grua.estado} className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-[13px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent">
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
