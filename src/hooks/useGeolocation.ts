import { useState, useEffect } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  loading: boolean
  error: string | null
}

const DEFAULT_LAT = 39.9042
const DEFAULT_LON = 116.4074

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LON,
        accuracy: null,
        loading: false,
        error: '浏览器不支持定位，使用默认城市',
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
        })
      },
      (err) => {
        setState({
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LON,
          accuracy: null,
          loading: false,
          error: `定位失败: ${err.message}，使用默认城市`,
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  return state
}
