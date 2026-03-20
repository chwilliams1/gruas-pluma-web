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
      className="p-2 rounded-md text-ink-tertiary hover:text-danger hover:bg-danger-subtle transition-colors duration-150 cursor-pointer bg-transparent border-none disabled:opacity-50"
      title="Eliminar grúa"
    >
      <Trash2 size={14} />
    </button>
  )
}
