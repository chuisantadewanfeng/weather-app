# City Search & Location Switching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add city search to LocationHeader so users can switch weather data to any city using Open-Meteo Geocoding API.

**Architecture:** Add `searchCity` to api.ts → add `ManualLocation` type and override logic to useGeolocation → create `CitySearch` dropdown component → integrate into LocationHeader → pass new props through App.

**Tech Stack:** React 19, TypeScript 6, Vitest 4, @testing-library/react 16, jsdom, Tailwind CSS 3

---

### Task 1: Add `searchCity` API with types

**Files:**
- Modify: `src/types/weather.ts` (append new interface)
- Modify: `src/utils/api.ts` (append new function)
- Create: `src/utils/__tests__/api.test.ts` (append new describe block — file exists)

- [ ] **Step 1: Add `CityResult` type**

Append to `src/types/weather.ts`:

```ts
export interface CityResult {
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
}
```

- [ ] **Step 2: Write failing test for `searchCity`**

Append to `src/utils/__tests__/api.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { searchCity } from '../api'

describe('searchCity', () => {
  it('should call Open-Meteo geocoding API and return parsed results', async () => {
    const mockResponse = {
      results: [
        { name: '北京', latitude: 39.9, longitude: 116.4, country: '中国', admin1: '北京' },
        { name: '上海', latitude: 31.2, longitude: 121.5, country: '中国', admin1: '上海' },
      ],
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const results = await searchCity('北')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://geocoding-api.open-meteo.com/v1/search?name=%E5%8C%97&count=5&language=zh&format=json')
    )
    expect(results).toHaveLength(2)
    expect(results[0].name).toBe('北京')
    expect(results[0].latitude).toBe(39.9)
    expect(results[0].longitude).toBe(116.4)
    expect(results[0].country).toBe('中国')
  })

  it('should return empty array when no results', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: null }),
    })

    const results = await searchCity('xxxxx')
    expect(results).toEqual([])
  })

  it('should throw on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    await expect(searchCity('test')).rejects.toThrow('Geocoding API error: 500')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/utils/__tests__/api.test.ts 2>&1 | tail -20`
Expected: FAIL — `searchCity` is not exported / not defined

- [ ] **Step 4: Implement `searchCity`**

Append to `src/utils/api.ts`:

```ts
import type { CityResult } from '../types/weather'

const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search'

export async function searchCity(query: string): Promise<CityResult[]> {
  const params = new URLSearchParams({
    name: query,
    count: '5',
    language: 'zh',
    format: 'json',
  })

  const res = await fetch(`${GEOCODING_BASE}?${params}`)

  if (!res.ok) {
    throw new Error(`Geocoding API error: ${res.status}`)
  }

  const json = await res.json()
  return json.results ?? []
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/utils/__tests__/api.test.ts 2>&1 | tail -20`
Expected: 5 passed (2 fetchWeather + 2 fetchRadar + 1 searchCity) — wait, that's not right. 2 fetchWeather + 2 fetchRadar + 3 searchCity = 7 total. All should pass.

- [ ] **Step 6: Commit**

```bash
git add src/types/weather.ts src/utils/api.ts src/utils/__tests__/api.test.ts
git commit -m "feat: add searchCity API with Open-Meteo geocoding"
```

---

### Task 2: Add manual override to `useGeolocation`

**Files:**
- Modify: `src/types/weather.ts` (append ManualLocation)
- Modify: `src/hooks/useGeolocation.ts`
- Modify: `src/hooks/__tests__/useGeolocation.test.ts` (append new describe/tests)

- [ ] **Step 1: Add `ManualLocation` type**

Append to `src/types/weather.ts`:

```ts
export interface ManualLocation {
  latitude: number
  longitude: number
  cityName: string
}
```

- [ ] **Step 2: Write failing test for manual override**

Append to `src/hooks/__tests__/useGeolocation.test.ts`:

```ts
import { act } from '@testing-library/react'

describe('useGeolocation manual override', () => {
  it('should use manual location when setManualLocation is called', async () => {
    mockGetCurrentPosition.mockImplementationOnce((success: PositionCallback) => {
      success({
        coords: { latitude: 39.9, longitude: 116.4, accuracy: 10 },
        timestamp: Date.now(),
      } as GeolocationPosition)
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.cityName).toBe('Test City')

    act(() => {
      result.current.setManualLocation({
        name: '上海',
        latitude: 31.2,
        longitude: 121.5,
        country: '中国',
      })
    })

    expect(result.current.latitude).toBe(31.2)
    expect(result.current.longitude).toBe(121.5)
    expect(result.current.cityName).toBe('上海')
    expect(result.current.manualLocation).toEqual({
      latitude: 31.2,
      longitude: 121.5,
      cityName: '上海',
    })
  })

  it('should fall back to GPS when clearManualLocation is called', async () => {
    mockGetCurrentPosition.mockImplementationOnce((success: PositionCallback) => {
      success({
        coords: { latitude: 39.9, longitude: 116.4, accuracy: 10 },
        timestamp: Date.now(),
      } as GeolocationPosition)
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setManualLocation({
        name: '上海',
        latitude: 31.2,
        longitude: 121.5,
        country: '中国',
      })
    })

    act(() => {
      result.current.clearManualLocation()
    })

    expect(result.current.latitude).toBe(39.9)
    expect(result.current.cityName).toBe('Test City')
    expect(result.current.manualLocation).toBeNull()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useGeolocation.test.ts 2>&1 | tail -20`
Expected: FAIL — `setManualLocation` and `clearManualLocation` are not functions

- [ ] **Step 4: Implement manual override in `useGeolocation`**

Rewrite `src/hooks/useGeolocation.ts`:

```ts
import { useState, useEffect, useCallback } from 'react'
import { reverseGeocode } from '../utils/api'
import type { CityResult, ManualLocation } from '../types/weather'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  cityName: string | null
  loading: boolean
  error: string | null
  manualLocation: ManualLocation | null
}

const DEFAULT_LAT = 34.7466
const DEFAULT_LON = 113.6253

async function fetchCityName(lat: number, lon: number): Promise<string> {
  try {
    return await reverseGeocode(lat, lon)
  } catch {
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`
  }
}

export function useGeolocation() {
  const [autoState, setAutoState] = useState<{
    latitude: number | null
    longitude: number | null
    accuracy: number | null
    cityName: string | null
    loading: boolean
    error: string | null
  }>({
    latitude: null,
    longitude: null,
    accuracy: null,
    cityName: null,
    loading: true,
    error: null,
  })

  const [manualLocation, setManualLocation] = useState<ManualLocation | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setAutoState({
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LON,
        accuracy: null,
        cityName: '郑州',
        loading: false,
        error: '浏览器不支持定位，使用默认城市',
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        const cityName = await fetchCityName(lat, lon)

        setAutoState({
          latitude: lat,
          longitude: lon,
          accuracy: position.coords.accuracy,
          cityName,
          loading: false,
          error: null,
        })
      },
      async (err) => {
        const cityName = await fetchCityName(DEFAULT_LAT, DEFAULT_LON)
        setAutoState({
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LON,
          accuracy: null,
          cityName,
          loading: false,
          error: `定位失败: ${err.message}，使用默认城市`,
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  const setManual = useCallback((city: CityResult) => {
    setManualLocation({
      latitude: city.latitude,
      longitude: city.longitude,
      cityName: city.name,
    })
  }, [])

  const clearManual = useCallback(() => {
    setManualLocation(null)
  }, [])

  const effective = manualLocation ?? {
    latitude: autoState.latitude,
    longitude: autoState.longitude,
    cityName: autoState.cityName,
  }

  return {
    latitude: effective.latitude,
    longitude: effective.longitude,
    accuracy: manualLocation ? null : autoState.accuracy,
    cityName: effective.cityName,
    loading: autoState.loading,
    error: autoState.error,
    manualLocation,
    setManualLocation: setManual,
    clearManualLocation: clearManual,
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useGeolocation.test.ts 2>&1 | tail -20`
Expected: 4 passed (2 original + 2 new)

- [ ] **Step 6: Commit**

```bash
git add src/types/weather.ts src/hooks/useGeolocation.ts src/hooks/__tests__/useGeolocation.test.ts
git commit -m "feat: add manual location override to useGeolocation"
```

---

### Task 3: Create `CitySearch` component

**Files:**
- Create: `src/components/CitySearch.tsx`
- Create: `src/components/__tests__/CitySearch.test.tsx`

- [ ] **Step 1: Write failing test for `CitySearch`**

Create `src/components/__tests__/CitySearch.test.tsx`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CitySearch } from '../CitySearch'

vi.mock('../../utils/api', () => ({
  searchCity: vi.fn().mockResolvedValue([
    { name: '北京', latitude: 39.9, longitude: 116.4, country: '中国', admin1: '北京' },
    { name: '上海', latitude: 31.2, longitude: 121.5, country: '中国', admin1: '上海' },
  ]),
}))

describe('CitySearch', () => {
  const onSelect = vi.fn()

  beforeEach(() => {
    onSelect.mockClear()
  })

  it('should display current city name by default', () => {
    render(<CitySearch currentCityName="郑州" onSelect={onSelect} />)
    expect(screen.getByText('郑州')).toBeInTheDocument()
  })

  it('should show search input when city name is clicked', async () => {
    const user = userEvent.setup()
    render(<CitySearch currentCityName="郑州" onSelect={onSelect} />)

    await user.click(screen.getByText('郑州'))

    expect(screen.getByPlaceholderText('搜索城市...')).toBeInTheDocument()
  })

  it('should show results when typing >= 2 characters', async () => {
    const user = userEvent.setup()
    render(<CitySearch currentCityName="郑州" onSelect={onSelect} />)

    await user.click(screen.getByText('郑州'))
    await user.type(screen.getByPlaceholderText('搜索城市...'), '北京')

    await waitFor(() => {
      expect(screen.getByText('北京')).toBeInTheDocument()
      expect(screen.getByText('上海')).toBeInTheDocument()
    })
  })

  it('should call onSelect when a result is clicked', async () => {
    const user = userEvent.setup()
    render(<CitySearch currentCityName="郑州" onSelect={onSelect} />)

    await user.click(screen.getByText('郑州'))
    await user.type(screen.getByPlaceholderText('搜索城市...'), '北京')

    await waitFor(() => {
      expect(screen.getByText('北京')).toBeInTheDocument()
    })

    await user.click(screen.getByText('北京'))

    expect(onSelect).toHaveBeenCalledWith({
      name: '北京',
      latitude: 39.9,
      longitude: 116.4,
      country: '中国',
      admin1: '北京',
    })
  })

  it('should show "back to GPS" option', async () => {
    const user = userEvent.setup()
    render(<CitySearch currentCityName="上海" onSelect={onSelect} showGpsFallback />)

    await user.click(screen.getByText('上海'))

    expect(screen.getByText('回到当前 GPS 位置')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/__tests__/CitySearch.test.tsx 2>&1 | tail -20`
Expected: FAIL — `CitySearch` module not found

- [ ] **Step 3: Implement `CitySearch` component**

Create `src/components/CitySearch.tsx`:

```ts
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
      const data = await searchCity(q)
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
          <span className="ml-1 text-sm text-white/50 align-top">▼</span>
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
          {(state === 'searching' || state === 'results' || state === 'no_results' || state === 'error') && (
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
                  {showGpsFallback && onClearManual && (
                    <button
                      onClick={handleClearManual}
                      className="w-full text-left px-3 py-2.5 hover:bg-white/10 transition-colors border-t border-white/10 text-sm text-sky-300"
                    >
                      回到当前 GPS 位置
                    </button>
                  )}
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/__tests__/CitySearch.test.tsx 2>&1 | tail -20`
Expected: 5 passed

- [ ] **Step 5: Commit**

```bash
git add src/components/CitySearch.tsx src/components/__tests__/CitySearch.test.tsx
git commit -m "feat: add CitySearch component with debounced search"
```

---

### Task 4: Integrate `CitySearch` into `LocationHeader` and `App`

**Files:**
- Modify: `src/components/LocationHeader.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Update `LocationHeader` to include `CitySearch`**

Rewrite `src/components/LocationHeader.tsx`:

```ts
import type { CityResult } from '../types/weather'
import { CitySearch } from './CitySearch'

interface LocationHeaderProps {
  cityName: string | null
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  lastUpdated: string | null
  onRefresh: () => void
  onCitySelect: (city: CityResult) => void
  onClearManual?: () => void
  showGpsFallback?: boolean
}

function formatCoords(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export function LocationHeader({
  cityName, latitude, longitude, accuracy, lastUpdated, onRefresh,
  onCitySelect, onClearManual, showGpsFallback,
}: LocationHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        {cityName ? (
          <CitySearch
            currentCityName={cityName}
            onSelect={onCitySelect}
            onClearManual={onClearManual}
            showGpsFallback={showGpsFallback}
          />
        ) : (
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">定位中...</h1>
        )}
        <div className="flex items-center gap-2 mt-1 text-sm text-white/70">
          {latitude && longitude && (
            <span>{formatCoords(latitude, longitude)}</span>
          )}
          {accuracy !== null && (
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
              accuracy <= 20 ? 'bg-green-500/30 text-green-200' : 'bg-yellow-500/30 text-yellow-200'
            }`}>
              {accuracy <= 20 ? 'GPS 高精度' : 'GPS 低精度'}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-sm text-white/60">
            更新于 {formatTime(lastUpdated)}
          </span>
        )}
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          title="刷新数据"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `App` to pass new props**

Modify `src/App.tsx` — change the `LocationHeader` usage block. Replace lines 39-49:

```tsx
        <LocationHeader
          cityName={geo.cityName}
          latitude={geo.latitude}
          longitude={geo.longitude}
          accuracy={geo.accuracy}
          lastUpdated={weather.current?.time ?? null}
          onRefresh={() => {
            weather.refresh()
            radar.refresh()
          }}
          onCitySelect={geo.setManualLocation}
          onClearManual={geo.clearManualLocation}
          showGpsFallback={geo.manualLocation !== null}
        />
```

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run 2>&1 | tail -20`
Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/LocationHeader.tsx src/App.tsx
git commit -m "feat: integrate CitySearch into LocationHeader and App"
```

---

### Task 5: Manual verification

**Files:** None (manual testing only)

- [ ] **Step 1: Start dev server**

Run: `npx vite --host 0.0.0.0`
Open in browser, verify app loads with GPS/default city.

- [ ] **Step 2: Test city search flow**

1. Click city name → search input appears
2. Type "北京" → dropdown shows results
3. Click "北京" → weather updates to Beijing
4. Click city name → "回到当前 GPS 位置" appears at bottom
5. Click "回到当前 GPS 位置" → reverts to GPS city

- [ ] **Step 3: Test edge cases**

1. Type gibberish "xxxxx" → shows "未找到匹配城市"
2. Click outside search → dropdown closes, city unchanged
3. Press Escape → dropdown closes, city unchanged
4. Refresh button still works for manual city

- [ ] **Step 4: Run tests one final time and commit if any changes were made**

Run: `npx vitest run 2>&1`
```bash
git add -A && git commit -m "chore: final verification tweaks"
```
(Only if changes were made during manual testing)
