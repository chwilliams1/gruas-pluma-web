'use client'

import { deleteConductor } from '@/lib/actions'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

export function DeleteConductorBtn({ conductorId }: { conductorId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => {
        if (confirm('¿Eliminar este conductor?')) {
          startTransition(() => deleteConductor(conductorId).catch(() => alert('No se puede eliminar: tiene solicitudes o reportes asociados')))
        }
      }}
      disabled={isPending}
      className="p-2 rounded-lg text-brand-text-light hover:text-brand-danger hover:bg-brand-danger-bg transition-all cursor-pointer bg-transparent border-none disabled:opacity-50"
      title="Eliminar conductor"
    >
      <Trash2 size={15} />
    </button>
  )
}
