export interface GeoCoords {
  latitude: number
  longitude: number
  accuracy: number | null
}

export interface CurrentWeather {
  time: string
  temperature: number
  relativeHumidity: number
  apparentTemperature: number
  weatherCode: number
  windSpeed: number
  windDirection: number
  pressure: number
  uvIndex: number
  visibility: number
}

export interface HourlyData {
  time: string[]
  temperature: number[]
  precipitationProbability: number[]
  weatherCode: number[]
  windSpeed: number[]
}

export interface DailyData {
  time: string[]
  temperatureMax: number[]
  temperatureMin: number[]
  precipitationProbabilityMax: number[]
  weatherCode: number[]
  sunrise: string[]
  sunset: string[]
}

export interface WeatherResponse {
  latitude: number
  longitude: number
  timezone: string
  current: CurrentWeather
  hourly: HourlyData
  daily: DailyData
}

export interface RadarFrame {
  time: number
  path: string
}

export interface RadarResponse {
  generated: number
  host: string
  radar: {
    past: RadarFrame[]
    nowcast: RadarFrame[]
  }
}

export interface LocationState {
  latitude: number
  longitude: number
  accuracy: number | null
  cityName: string
  loading: boolean
  error: string | null
}
