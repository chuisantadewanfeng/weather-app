import { useState, useEffect, useCallback } from 'react'
import type { CurrentWeather, HourlyData, DailyData } from '../types/weather'
import { fetchWeather } from '../utils/api'

interface WeatherState {
  timezone: string | null
  current: CurrentWeather | null
  hourly: HourlyData | null
  daily: DailyData | null
  loading: boolean
  error: string | null
}

export function useWeather(lat: number | null, lon: number | null) {
  const [state, setState] = useState<WeatherState>({
    timezone: null,
    current: null,
    hourly: null,
    daily: null,
    loading: false,
    error: null,
  })

  const load = useCallback(async () => {
    if (lat === null || lon === null) return

    setState((s) => ({ ...s, loading: true, error: null }))

    try {
      const data = await fetchWeather(lat, lon)
      setState({
        timezone: data.timezone,
        current: data.current,
        hourly: data.hourly,
        daily: data.daily,
        loading: false,
        error: null,
      })
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : '获取天气失败',
      }))
    }
  }, [lat, lon])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, refresh: load }
}
