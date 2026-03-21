'use client'

import { createReporte } from '@/lib/actions'
import { useState, useTransition, useRef, useEffect } from 'react'
import { Plus, X } from 'lucide-react'

const inputClass = "w-full px-3 py-2.5 rounded-lg border border-control-border bg-control-bg text-[13px] text-ink placeholder:text-ink-muted outline-none transition-colors duration-150 focus:border-amber focus:ring-2 focus:ring-control-focus"
const labelClass = "text-[11px] font-medium text-ink-tertiary uppercase tracking-[0.04em] block mb-1.5"

export function NuevoReporteForm({ choferes, clientes }: {
  choferes: { id: string, nombre: string }[]
  clientes: { id: string, nombre: string }[]
}) {
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

    // Capture form values before reset for PDF generation
    const choferName = choferes.find(c => c.id === formData.get('choferId'))?.nombre || ''
    const clienteName = clientes.find(c => c.id === formData.get('clienteId'))?.nombre || ''
    const horas = parseFloat(formData.get('horas') as string || '0')
    const horasExtra = parseFloat(formData.get('horasExtra') as string || '0')
    const valorHora = parseFloat(formData.get('valorHora') as string || '60000')
    const fecha = formData.get('fecha') as string
    const descripcion = formData.get('descripcion') as string
    const numeroReporte = formData.get('numeroReporte') as string
    const estadoReporte = formData.get('estadoReporte') as string || 'sin factura'
    const pagado = formData.get('pagado') === 'true'

    startTransition(async () => {
      const reporteId = await createReporte(formData)
      formRef.current?.reset()
      setOpen(false)

      // Auto-generate PDF client-side
      if (reporteId) {
        try {
          const { generateAndDownloadPDF } = await import('@/lib/generateReportePDF')
          await generateAndDownloadPDF({
            codigo: reporteId,
            numeroReporte: numeroReporte ? parseInt(numeroReporte) : null,
            fecha,
            choferNombre: choferName,
            clienteNombre: clienteName,
            clienteRut: null,
            clienteDireccion: null,
            clienteTelefono: null,
            descripcion,
            horas,
            horasExtra,
            valorHora,
            monto: (horas + horasExtra) * valorHora,
            estadoReporte,
            pagado,
            latitud: null,
            longitud: null,
          })
        } catch {
          // PDF failed silently — report was still created
        }
      }
    })
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber hover:bg-amber-hover transition-colors duration-150 text-white text-[13px] font-medium cursor-pointer border-none">
        <Plus size={15} /> Nuevo Reporte
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 backdrop-blur-[2px]" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="bg-surface-1 rounded-t-2xl sm:rounded-xl p-6 w-full sm:max-w-lg border border-edge sm:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[16px] font-semibold text-ink tracking-[-0.02em]">Nuevo Reporte</h2>
          <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-ink-tertiary hover:text-ink-secondary hover:bg-[rgba(0,0,0,0.04)] transition-colors duration-150 cursor-pointer bg-transparent border-none">
            <X size={16} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Responsable</label>
              <select name="choferId" required className={inputClass}>
                <option value="">Seleccionar...</option>
                {choferes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Empresa / Cliente</label>
              <select name="clienteId" required className={inputClass}>
                <option value="">Seleccionar...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Fecha</label>
              <input name="fecha" type="date" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>N° Reporte</label>
              <input name="numeroReporte" type="number" placeholder="Ej: 35019" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Valor Hora ($)</label>
              <input name="valorHora" type="number" defaultValue="60000" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Horas</label>
              <input name="horas" type="number" step="0.5" min="0" required placeholder="Ej: 3" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>H. Extra</label>
              <input name="horasExtra" type="number" step="0.5" min="0" defaultValue="0" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Descripción del trabajo</label>
            <textarea name="descripcion" rows={2} required placeholder="Descripción del trabajo realizado" className={`${inputClass} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Estado Reporte</label>
              <select name="estadoReporte" className={inputClass}>
                <option value="sin factura">Sin factura</option>
                <option value="facturado">Facturado</option>
                <option value="ESPERA OC">Espera OC</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Estado Pago</label>
              <select name="pagado" className={inputClass}>
                <option value="false">Pendiente</option>
                <option value="true">Pagado</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-1 pt-4 border-t border-edge">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-edge text-[13px] font-medium text-ink-secondary hover:bg-[rgba(0,0,0,0.03)] transition-colors duration-150 cursor-pointer bg-transparent">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex-1 px-4 py-2.5 rounded-lg bg-amber hover:bg-amber-hover transition-colors duration-150 text-white text-[13px] font-medium cursor-pointer border-none disabled:opacity-50">
              {isPending ? 'Creando...' : 'Crear y Generar PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
