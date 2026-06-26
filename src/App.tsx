import { useGeolocation } from './hooks/useGeolocation'
import { useWeather } from './hooks/useWeather'
import { useRadar } from './hooks/useRadar'
import { LocationHeader } from './components/LocationHeader'
import { CurrentWeather } from './components/CurrentWeather'
import { HourlyForecast } from './components/HourlyForecast'
import { DailyForecast } from './components/DailyForecast'
import { RadarMap } from './components/RadarMap'

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 to-sky-700 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-white/20 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white/10 rounded-2xl" />
          <div className="h-64 bg-white/10 rounded-2xl" />
        </div>
        <div className="h-40 bg-white/10 rounded-2xl" />
        <div className="h-80 bg-white/10 rounded-2xl" />
        <div className="h-80 bg-white/10 rounded-2xl" />
      </div>
    </div>
  )
}

function App() {
  const geo = useGeolocation()
  const weather = useWeather(geo.latitude, geo.longitude)
  const radar = useRadar()

  if (geo.loading || (weather.loading && !weather.current)) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 via-sky-800 to-sky-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
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
        />

        {weather.error && (
          <div className="bg-red-500/20 border border-red-400/40 rounded-xl p-4 text-center">
            <p className="text-red-200">{weather.error}</p>
            <button
              onClick={weather.refresh}
              className="mt-2 px-4 py-2 bg-red-500/40 hover:bg-red-500/60 rounded-lg text-sm transition-colors"
            >
              重试
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {weather.current && (
              <CurrentWeather
                current={weather.current}
                timezone={weather.timezone}
                sunrise={weather.daily?.sunrise?.[0] ?? null}
                sunset={weather.daily?.sunset?.[0] ?? null}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            {weather.hourly && weather.timezone && (
              <HourlyForecast hourly={weather.hourly} timezone={weather.timezone} />
            )}
          </div>
        </div>

        {weather.daily && (
          <DailyForecast daily={weather.daily} />
        )}

        {!radar.error && radar.frames.length > 0 && (
          <RadarMap
            frames={radar.frames}
            host={radar.host}
            latitude={geo.latitude ?? 0}
            longitude={geo.longitude ?? 0}
          />
        )}

        {radar.error && (
          <div className="bg-gray-800/50 rounded-2xl p-6 text-center text-gray-400">
            <p>雷达图加载失败: {radar.error}</p>
            <button
              onClick={radar.refresh}
              className="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              重试
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
