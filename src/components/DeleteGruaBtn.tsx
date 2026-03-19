'use client'

import { deleteGrua } from '@/lib/actions'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

export function DeleteGruaBtn({ gruaId }: { gruaId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => {
        if (confirm('¿Eliminar esta grúa?')) {
          startTransition(() => deleteGrua(gruaId).catch(() => alert('No se puede eliminar: tiene choferes o solicitudes asociadas')))
        }
      }}
      disabled={isPending}
      className="p-2 rounded-lg text-brand-text-light hover:text-brand-danger hover:bg-brand-danger-bg transition-all cursor-pointer bg-transparent border-none disabled:opacity-50"
      title="Eliminar grúa"
    >
      <Trash2 size={15} />
    </button>
  )
}
