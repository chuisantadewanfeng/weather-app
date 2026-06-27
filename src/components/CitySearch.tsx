import { useState, useRef, useEffect, useCallback } from 'react'
import type { CityResult } from '../types/weather'
import { searchCity } from '../utils/api'

interface CitySearchProps {
  currentCityName: string
  onSelect: (city: CityResult) => void
  onClearManual?: () => void
  showGpsFallback?: boolean
}

type SearchState = 'idle' | 'active' | 'searching' | 'results' | 'no_results' | 'error'

export function CitySearch({ currentCityName, onSelect, onClearManual, showGpsFallback }: CitySearchProps) {
  const [state, setState] = useState<SearchState>('idle')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CityResult[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const open = useCallback(() => {
    setState('active')
    setQuery('')
    setResults([])
    setErrorMsg('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  const close = useCallback(() => {
    setState('idle')
    setQuery('')
    setResults([])
    setErrorMsg('')
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setState('active')
      setResults([])
      return
    }

    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()

    setState('searching')
    try {
      const data = await searchCity(q, abortRef.current.signal)
      if (data.length === 0) {
        setState('no_results')
        setResults([])
      } else {
        setState('results')
        setResults(data)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setState('error')
      setErrorMsg(err instanceof Error ? err.message : '搜索失败')
    }
  }, [])

  const handleInput = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }, [doSearch])

  const handleSelect = useCallback((city: CityResult) => {
    onSelect(city)
    close()
  }, [onSelect, close])

  const handleClearManual = useCallback(() => {
    onClearManual?.()
    close()
  }, [onClearManual, close])

  // Click outside to close
  useEffect(() => {
    if (state === 'idle') return

    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [state, close])

  // Keyboard: Escape to close
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }, [close])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {state === 'idle' ? (
        <button
          onClick={open}
          className="text-left hover:opacity-80 transition-opacity focus:outline-none"
        >
          <span className="text-2xl md:text-3xl font-bold tracking-tight">
            {currentCityName}
          </span>
          <span className="ml-1 text-sm text-white/50 align-top">&#9660;</span>
        </button>
      ) : (
        <div className="w-64">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索城市..."
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40
                       focus:outline-none focus:border-white/40 text-sm"
          />
          <div className="absolute top-full mt-1 w-full bg-slate-800 border border-white/20 rounded-lg shadow-xl z-50 overflow-hidden">
              {state === 'searching' && (
                <div className="px-3 py-4 text-center text-sm text-white/50">搜索中...</div>
              )}
              {state === 'results' && (
                <div>
                  {results.map((city, i) => (
                    <button
                      key={`${city.latitude}-${city.longitude}-${i}`}
                      onClick={() => handleSelect(city)}
                      className="w-full text-left px-3 py-2.5 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-white">{city.name}</div>
                      <div className="text-xs text-white/50">
                        {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {state === 'no_results' && (
                <div className="px-3 py-4 text-center text-sm text-white/50">未找到匹配城市</div>
              )}
              {state === 'error' && (
                <div className="px-3 py-4 text-center text-sm">
                  <p className="text-red-300">{errorMsg}</p>
                  <button
                    onClick={() => doSearch(query)}
                    className="mt-1 text-sky-300 hover:text-sky-200 text-xs"
                  >
                    重试
                  </button>
                </div>
              )}
              {showGpsFallback && onClearManual && (
                <button
                  onClick={handleClearManual}
                  className="w-full text-left px-3 py-2.5 hover:bg-white/10 transition-colors border-t border-white/10 text-sm text-sky-300"
                >
                  回到当前 GPS 位置
                </button>
              )}
            </div>
        </div>
      )}
    </div>
  )
}
