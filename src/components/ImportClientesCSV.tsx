'use client'

import { importClientes } from '@/lib/actions'
import { useState, useTransition, useRef } from 'react'
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'

type ImportResult = { created: number, updated: number, errors: string[] }

export function ImportClientesCSV() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string[][]>([])
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter(l => l.trim())
    return lines.map(line => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      for (const ch of line) {
        if (ch === '"') { inQuotes = !inQuotes; continue }
        if ((ch === ',' || ch === ';') && !inQuotes) { result.push(current.trim()); current = ''; continue }
        current += ch
      }
      result.push(current.trim())
      return result
    })
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const rows = parseCSV(text)
      setPreview(rows)
    }
    reader.readAsText(file)
  }

  const handleImport = () => {
    if (preview.length < 2) return
    const headers = preview[0].map(h => h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    const dataRows = preview.slice(1)

    const jsonRows = dataRows.map(row => {
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => { obj[h] = row[i] || '' })
      return obj
    })

    startTransition(async () => {
      const res = await importClientes(JSON.stringify(jsonRows))
      setResult(res)
    })
  }

  const reset = () => { setOpen(false); setPreview([]); setResult(null); setFileName('') }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-text transition-colors text-white text-[13px] font-bold cursor-pointer border-none shadow-sm"
      >
        <Upload size={16} /> Importar CSV
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-brand-card rounded-2xl p-8 w-full max-w-3xl shadow-2xl border border-brand-border max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-brand-text">Importar Clientes desde CSV</h2>
          <button onClick={reset} className="text-brand-text-light hover:text-brand-text cursor-pointer bg-transparent border-none">
            <X size={20} />
          </button>
        </div>

        {/* Instrucciones */}
        <div className="bg-brand-bg rounded-xl p-4 mb-6 border border-brand-border">
          <div className="flex items-start gap-3">
            <FileSpreadsheet size={20} className="text-brand-accent shrink-0 mt-0.5" />
            <div className="text-[12px] text-brand-text-mid">
              <p className="font-bold text-brand-text mb-1">Formato del archivo CSV:</p>
              <p className="mb-1">El archivo debe tener las siguientes columnas (separado por <code className="bg-brand-divider px-1 rounded">,</code> o <code className="bg-brand-divider px-1 rounded">;</code>):</p>
              <code className="block bg-brand-divider px-3 py-2 rounded-lg text-[11px] mb-2">
                nombre, rut, telefono, direccion
              </code>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li><strong>nombre / empresa:</strong> Nombre del cliente o empresa (obligatorio)</li>
                <li><strong>rut:</strong> RUT de la empresa (ej: 76083169-7)</li>
                <li><strong>telefono:</strong> Numero de contacto</li>
                <li><strong>direccion:</strong> Direccion del cliente</li>
              </ul>
              <p className="mt-2 text-[11px] text-brand-text-light">Si un cliente ya existe (mismo nombre), se actualizaran los campos vacios.</p>
            </div>
          </div>
        </div>

        {/* Upload */}
        <div className="mb-6">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt,.xls,.xlsx"
            onChange={handleFile}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-6 rounded-xl border-2 border-dashed border-brand-border hover:border-brand-accent text-brand-text-light hover:text-brand-accent transition-all cursor-pointer bg-transparent flex flex-col items-center gap-2"
          >
            <Upload size={24} />
            <span className="text-[13px] font-semibold">{fileName || 'Seleccionar archivo CSV'}</span>
          </button>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-bold text-brand-text-mid uppercase tracking-wider">
                Vista previa ({preview.length - 1} filas de datos)
              </span>
            </div>
            <div className="overflow-auto max-h-[300px] rounded-xl border border-brand-border">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-brand-divider">
                    {preview[0].map((h, i) => (
                      <th key={i} className="py-2 px-3 border-b border-brand-border font-bold text-brand-text-mid whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(1, 11).map((row, i) => (
                    <tr key={i} className="border-b border-brand-divider">
                      {row.map((cell, j) => (
                        <td key={j} className="py-2 px-3 text-brand-text whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 11 && (
                <div className="text-[11px] text-brand-text-light text-center py-2 bg-brand-bg">
                  ... y {preview.length - 11} filas mas
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-xl p-4 mb-6 border ${result.errors.length > 0 ? 'bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.2)]' : 'bg-brand-success-bg border-[rgba(16,185,129,0.2)]'}`}>
            <div className="flex items-start gap-2">
              {result.errors.length === 0 ? (
                <CheckCircle size={18} className="text-brand-success shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="text-brand-accent shrink-0 mt-0.5" />
              )}
              <div className="text-[12px]">
                <p className="font-bold text-brand-text">
                  {result.created} clientes creados{result.updated > 0 ? `, ${result.updated} actualizados` : ''}
                </p>
                {result.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.errors.map((err, i) => (
                      <p key={i} className="text-brand-danger text-[11px]">{err}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex-1 px-5 py-2.5 rounded-lg border border-brand-border text-[13px] font-semibold text-brand-text-mid bg-brand-bg hover:bg-brand-divider transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={handleImport}
            disabled={isPending || preview.length < 2}
            className="flex-1 px-5 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-dark transition-colors text-white text-[13px] font-bold cursor-pointer border-none shadow-sm disabled:opacity-50"
          >
            {isPending ? 'Importando...' : `Importar ${Math.max(0, preview.length - 1)} Clientes`}
          </button>
        </div>
      </div>
    </div>
  )
}
