import { describe, it, expect, vi } from 'vitest'
import { fetchWeather, fetchRadar, searchCity } from '../api'

describe('fetchWeather', () => {
  it('should construct correct Open-Meteo URL and return parsed data', async () => {
    const mockResponse = {
      latitude: 39.9,
      longitude: 116.4,
      timezone: 'Asia/Shanghai',
      current: {
        time: '2026-06-26T12:00',
        temperature_2m: 30.5,
        relative_humidity_2m: 60,
        apparent_temperature: 32.1,
        weather_code: 0,
        wind_speed_10m: 12.3,
        wind_direction_10m: 180,
        pressure_msl: 1013.0,
        uv_index: 6.0,
        visibility: 10000.0,
      },
      hourly: {
        time: ['2026-06-26T00:00', '2026-06-26T01:00'],
        temperature_2m: [25.0, 24.5],
        precipitation_probability: [0, 5],
        weather_code: [0, 0],
        wind_speed_10m: [5.0, 5.5],
      },
      daily: {
        time: ['2026-06-26', '2026-06-27'],
        temperature_2m_max: [32.0, 30.0],
        temperature_2m_min: [22.0, 21.0],
        precipitation_probability_max: [10, 30],
        weather_code: [0, 45],
        sunrise: ['2026-06-26T04:48', '2026-06-27T04:49'],
        sunset: ['2026-06-26T19:45', '2026-06-27T19:44'],
      },
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await fetchWeather(39.9, 116.4)

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.open-meteo.com/v1/forecast?latitude=39.9&longitude=116.4')
    )
    expect(result.current.temperature).toBe(30.5)
    expect(result.current.weatherCode).toBe(0)
    expect(result.hourly.time).toHaveLength(2)
    expect(result.daily.time).toHaveLength(2)
  })

  it('should throw on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    await expect(fetchWeather(0, 0)).rejects.toThrow('Weather API error: 500')
  })
})

describe('fetchRadar', () => {
  it('should return radar data with full tile URLs', async () => {
    const mockResponse = {
      generated: 1719400000,
      host: 'https://tilecache.rainviewer.com',
      radar: {
        past: [
          { time: 1719399600, path: '/v2/map/past/abc/256/{z}/{x}/{y}/2/1_1.png' },
        ],
        nowcast: [
          { time: 1719400000, path: '/v2/map/nowcast/def/256/{z}/{x}/{y}/2/1_1.png' },
        ],
      },
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await fetchRadar()

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.rainviewer.com/public/weather-maps.json'
    )
    expect(result.host).toBe('https://tilecache.rainviewer.com')
    expect(result.radar.past[0].time).toBe(1719399600)
    expect(result.radar.past[0].path).toContain('/v2/map/past/')
  })

  it('should throw on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    await expect(fetchRadar()).rejects.toThrow('Radar API error: 500')
  })
})

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
      expect.stringContaining('https://geocoding-api.open-meteo.com/v1/search?name=%E5%8C%97&count=5&language=zh&format=json'),
      { signal: undefined }
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
