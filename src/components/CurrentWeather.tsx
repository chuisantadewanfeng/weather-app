import type { CurrentWeather as CurrentWeatherType } from '../types/weather'
import { WeatherIcon } from './WeatherIcon'

interface CurrentWeatherProps {
  current: CurrentWeatherType
  timezone: string | null
  sunrise: string | null
  sunset: string | null
}

function windDirectionText(deg: number): string {
  const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
  const index = Math.round(deg / 45) % 8
  return dirs[index]
}

function uvLevel(index: number): { label: string; color: string } {
  if (index <= 2) return { label: '低', color: 'text-green-300' }
  if (index <= 5) return { label: '中等', color: 'text-yellow-300' }
  if (index <= 7) return { label: '高', color: 'text-orange-300' }
  if (index <= 10) return { label: '很高', color: 'text-red-400' }
  return { label: '极高', color: 'text-purple-400' }
}

function formatTimeOnly(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export function CurrentWeather({ current, sunrise, sunset }: CurrentWeatherProps) {
  const uv = uvLevel(current.uvIndex)

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <WeatherIcon code={current.weatherCode} size="lg" />
        <div>
          <div className="text-5xl font-bold tracking-tighter">
            {current.temperature.toFixed(1)}°
          </div>
          <div className="text-sm text-white/70">
            体感 {current.apparentTemperature.toFixed(1)}°
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-white/60">湿度</span>
          <span>{current.relativeHumidity}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">风速</span>
          <span>{current.windSpeed.toFixed(1)} km/h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">风向</span>
          <span>{windDirectionText(current.windDirection)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">气压</span>
          <span>{current.pressure.toFixed(0)} hPa</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">能见度</span>
          <span>{(current.visibility / 1000).toFixed(1)} km</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">紫外线</span>
          <span className={uv.color}>
            {current.uvIndex.toFixed(0)} ({uv.label})
          </span>
        </div>
        {sunrise && (
          <div className="flex justify-between">
            <span className="text-white/60">日出</span>
            <span>{formatTimeOnly(sunrise)}</span>
          </div>
        )}
        {sunset && (
          <div className="flex justify-between">
            <span className="text-white/60">日落</span>
            <span>{formatTimeOnly(sunset)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
