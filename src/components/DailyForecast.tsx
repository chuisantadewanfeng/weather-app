import type { DailyData } from '../types/weather'
import { WeatherIcon } from './WeatherIcon'

interface DailyForecastProps {
  daily: DailyData
}

function formatDay(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date)
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000)

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[target.getDay()]
}

export function DailyForecast({ daily }: DailyForecastProps) {
  const allTemps = [...daily.temperatureMax, ...daily.temperatureMin]
  const tempMin = Math.min(...allTemps)
  const tempMax = Math.max(...allTemps)
  const tempRange = tempMax - tempMin || 1

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">7天预报</h2>
      <div className="space-y-2">
        {daily.time.map((day, i) => {
          const leftPercent = ((daily.temperatureMin[i] - tempMin) / tempRange) * 100
          const widthPercent = ((daily.temperatureMax[i] - daily.temperatureMin[i]) / tempRange) * 100

          return (
            <div
              key={day}
              className="grid grid-cols-[60px_36px_1fr_40px] items-center gap-3 py-2"
            >
              <span className="text-sm font-medium">{formatDay(day)}</span>
              <WeatherIcon code={daily.weatherCode[i]} size="sm" />
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                  style={{ left: `${leftPercent}%`, width: `${Math.max(widthPercent, 6)}%` }}
                />
              </div>
              <div className="text-right text-sm">
                <span className="font-medium">{daily.temperatureMax[i].toFixed(0)}°</span>
                <span className="text-white/50 ml-1">{daily.temperatureMin[i].toFixed(0)}°</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
