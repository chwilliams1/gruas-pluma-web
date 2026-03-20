'use client'

import { deleteReporte } from '@/lib/actions'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

export function DeleteReporteBtn({ reporteId }: { reporteId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => {
        if (confirm('¿Eliminar este reporte y su solicitud asociada?')) {
          startTransition(() => deleteReporte(reporteId))
        }
      }}
      disabled={isPending}
      className="p-2 rounded-lg text-brand-text-light hover:text-brand-danger hover:bg-brand-danger-bg transition-all cursor-pointer bg-transparent border-none disabled:opacity-50"
      title="Eliminar reporte"
    >
      <Trash2 size={15} />
    </button>
  )
}
