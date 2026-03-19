'use client'

import { deleteCliente } from '@/lib/actions'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

export function DeleteClienteBtn({ clienteId }: { clienteId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => {
        if (confirm('¿Eliminar este cliente?')) {
          startTransition(() => deleteCliente(clienteId).catch(() => alert('No se puede eliminar: tiene solicitudes asociadas')))
        }
      }}
      disabled={isPending}
      className="p-2 rounded-lg text-brand-text-light hover:text-brand-danger hover:bg-brand-danger-bg transition-all cursor-pointer bg-transparent border-none disabled:opacity-50"
      title="Eliminar cliente"
    >
      <Trash2 size={15} />
    </button>
  )
}
