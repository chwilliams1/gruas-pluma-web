'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  tarifa: {
    id: string
    nombre: string
    valorHora: number
    minimoHoras: number
    activa: boolean
  }
}

export function EditTarifaForm({ tarifa }: Props) {
  const router = useRouter()
  const [valorHora, setValorHora] = useState(String(tarifa.valorHora))
  const [minimoHoras, setMinimoHoras] = useState(String(tarifa.minimoHoras))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const hasChanges = Number(valorHora) !== tarifa.valorHora || Number(minimoHoras) !== tarifa.minimoHoras

  const handleSave = async () => {
    if (!hasChanges) return
    setSaving(true)
    setSaved(false)

    try {
      const res = await fetch('/api/tarifas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tarifa.id,
          valorHora: Number(valorHora),
          minimoHoras: Number(minimoHoras),
        }),
      })

      if (res.ok) {
        setSaved(true)
        router.refresh()
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {}
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-ink-tertiary block mb-1">Valor/hora ($)</label>
          <input
            type="number"
            value={valorHora}
            onChange={e => setValorHora(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-edge bg-canvas text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
          />
        </div>
        <div>
          <label className="text-[11px] text-ink-tertiary block mb-1">Min. horas</label>
          <input
            type="number"
            value={minimoHoras}
            onChange={e => setMinimoHoras(e.target.value)}
            step="0.5"
            className="w-full px-3 py-2 rounded-lg border border-edge bg-canvas text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={!hasChanges || saving}
        className="w-full py-2 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-amber text-white hover:bg-amber-dark"
      >
        {saved ? 'Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}
