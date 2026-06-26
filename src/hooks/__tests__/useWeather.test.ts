import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWeather } from '../useWeather'
import { fetchWeather } from '../../utils/api'

const mockWeatherData = {
  latitude: 39.9,
  longitude: 116.4,
  timezone: 'Asia/Shanghai',
  current: {
    time: '2026-06-26T12:00',
    temperature: 30.5,
    relativeHumidity: 60,
    apparentTemperature: 32.1,
    weatherCode: 0,
    windSpeed: 12.3,
    windDirection: 180,
    pressure: 1013.0,
    uvIndex: 6.0,
    visibility: 10000.0,
  },
  hourly: {
    time: ['2026-06-26T00:00', '2026-06-26T01:00'],
    temperature: [25.0, 24.5],
    precipitationProbability: [0, 5],
    weatherCode: [0, 0],
    windSpeed: [5.0, 5.5],
  },
  daily: {
    time: ['2026-06-26'],
    temperatureMax: [32.0],
    temperatureMin: [22.0],
    precipitationProbabilityMax: [10],
    weatherCode: [0],
    sunrise: ['2026-06-26T04:48'],
    sunset: ['2026-06-26T19:45'],
  },
}

vi.mock('../../utils/api', () => ({
  fetchWeather: vi.fn(),
}))

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useWeather', () => {
  it('should fetch weather data when coords provided', async () => {
    vi.mocked(fetchWeather).mockResolvedValue(mockWeatherData)

    const { result } = renderHook(() => useWeather(39.9, 116.4))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.current?.temperature).toBe(30.5)
    expect(result.current.hourly?.time).toHaveLength(2)
    expect(result.current.error).toBeNull()
  })

  it('should not fetch when coords are null', () => {
    const { result } = renderHook(() => useWeather(null, null))

    expect(result.current.loading).toBe(false)
  })

  it('should handle API error', async () => {
    vi.mocked(fetchWeather).mockRejectedValue(new Error('Weather API error: 500'))

    const { result } = renderHook(() => useWeather(39.9, 116.4))

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(result.current.loading).toBe(false)
    })
  })
})
