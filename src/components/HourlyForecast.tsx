import type { HourlyData } from '../types/weather'
import { WeatherIcon } from './WeatherIcon'

interface HourlyForecastProps {
  hourly: HourlyData
  timezone: string
}

function formatHour(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffHours = Math.round((date.getTime() - now.getTime()) / 3600000)

  if (diffHours === 0) return '现在'
  if (diffHours === 1) return '1小时后'
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export function HourlyForecast({ hourly }: HourlyForecastProps) {
  const displayHours = hourly.time.slice(0, 24)

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 h-full">
      <h2 className="text-lg font-semibold mb-4">逐小时预报</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
        {displayHours.map((time, i) => (
          <div
            key={time}
            className="flex flex-col items-center gap-2 flex-shrink-0 w-16 snap-start"
          >
            <span className="text-xs text-white/60">{formatHour(time)}</span>
            <WeatherIcon code={hourly.weatherCode[i]} size="sm" />
            <span className="text-sm font-medium">{hourly.temperature[i].toFixed(0)}°</span>
            {hourly.precipitationProbability[i] > 0 && (
              <span className="text-xs text-blue-300">{hourly.precipitationProbability[i]}%</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
