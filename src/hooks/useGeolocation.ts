import { useState, useEffect } from 'react'
import { reverseGeocode } from '../utils/api'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  cityName: string | null
  loading: boolean
  error: string | null
}

const DEFAULT_LAT = 34.7466
const DEFAULT_LON = 113.6253

async function fetchCityName(lat: number, lon: number): Promise<string> {
  try {
    return await reverseGeocode(lat, lon)
  } catch {
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`
  }
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    cityName: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LON,
        accuracy: null,
        cityName: '郑州',
        loading: false,
        error: '浏览器不支持定位，使用默认城市',
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        const cityName = await fetchCityName(lat, lon)

        setState({
          latitude: lat,
          longitude: lon,
          accuracy: position.coords.accuracy,
          cityName,
          loading: false,
          error: null,
        })
      },
      async (err) => {
        const cityName = await fetchCityName(DEFAULT_LAT, DEFAULT_LON)
        setState({
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LON,
          accuracy: null,
          cityName,
          loading: false,
          error: `定位失败: ${err.message}，使用默认城市`,
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  return state
}
