import type { WeatherResponse, RadarResponse, CityResult } from '../types/weather'

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast'
const RAINVIEWER_URL = 'https://api.rainviewer.com/public/weather-maps.json'

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,uv_index,visibility',
    hourly: 'temperature_2m,precipitation_probability,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,sunrise,sunset',
    timezone: 'auto',
  })

  const res = await fetch(`${OPEN_METEO_BASE}?${params}`)

  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status}`)
  }

  const json = await res.json()

  return {
    latitude: json.latitude,
    longitude: json.longitude,
    timezone: json.timezone,
    current: {
      time: json.current.time,
      temperature: json.current.temperature_2m,
      relativeHumidity: json.current.relative_humidity_2m,
      apparentTemperature: json.current.apparent_temperature,
      weatherCode: json.current.weather_code,
      windSpeed: json.current.wind_speed_10m,
      windDirection: json.current.wind_direction_10m,
      pressure: json.current.pressure_msl,
      uvIndex: json.current.uv_index,
      visibility: json.current.visibility,
    },
    hourly: {
      time: json.hourly.time,
      temperature: json.hourly.temperature_2m,
      precipitationProbability: json.hourly.precipitation_probability,
      weatherCode: json.hourly.weather_code,
      windSpeed: json.hourly.wind_speed_10m,
    },
    daily: {
      time: json.daily.time,
      temperatureMax: json.daily.temperature_2m_max,
      temperatureMin: json.daily.temperature_2m_min,
      precipitationProbabilityMax: json.daily.precipitation_probability_max,
      weatherCode: json.daily.weather_code,
      sunrise: json.daily.sunrise,
      sunset: json.daily.sunset,
    },
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Geocode error: ${res.status}`)
  }

  const json = await res.json()
  return json.locality || json.city || json.principalSubdivision || `${lat.toFixed(2)}, ${lon.toFixed(2)}`
}

export async function fetchRadar(): Promise<RadarResponse> {
  const res = await fetch(RAINVIEWER_URL)

  if (!res.ok) {
    throw new Error(`Radar API error: ${res.status}`)
  }

  return res.json()
}

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
