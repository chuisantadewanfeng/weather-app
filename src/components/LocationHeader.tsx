interface LocationHeaderProps {
  cityName: string | null
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  lastUpdated: string | null
  onRefresh: () => void
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

export function LocationHeader({ cityName, latitude, longitude, accuracy, lastUpdated, onRefresh }: LocationHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {cityName || (latitude && longitude ? formatCoords(latitude, longitude) : '定位中...')}
        </h1>
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
