'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'

interface FilterOption {
  label: string
  value: string
}

interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
}

interface Props {
  placeholder?: string
  filters?: FilterConfig[]
}

export function SearchFilterBar({ placeholder = 'Buscar...', filters = [] }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '')

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset pagination on filter change
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const handleSearch = useCallback(() => {
    updateParams('q', localSearch.trim())
  }, [updateParams, localSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }, [handleSearch])

  const clearSearch = useCallback(() => {
    setLocalSearch('')
    updateParams('q', '')
  }, [updateParams])

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search input */}
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 rounded-lg border border-edge bg-surface-0 text-[13px] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber transition-colors"
        />
        {localSearch && (
          <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters */}
      {filters.map(filter => (
        <div key={filter.key} className="relative">
          <select
            value={searchParams.get(filter.key) || ''}
            onChange={e => updateParams(filter.key, e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-edge bg-surface-0 text-[13px] text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber transition-colors"
          >
            <option value="">{filter.label}</option>
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
        </div>
      ))}
    </div>
  )
}

export function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between mt-6 px-1">
      <p className="text-[12px] text-ink-tertiary">
        Pagina {currentPage} de {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 text-[12px] rounded-md border border-edge bg-surface-0 text-ink-secondary hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 text-[12px] rounded-md border border-edge bg-surface-0 text-ink-secondary hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
