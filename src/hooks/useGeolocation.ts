import { useState, useEffect, useCallback } from 'react'
import { reverseGeocode } from '../utils/api'
import type { CityResult, ManualLocation } from '../types/weather'

interface AutoGeoState {
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
  const [autoState, setAutoState] = useState<AutoGeoState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    cityName: null,
    loading: true,
    error: null,
  })

  const [manualLocation, setManualLocationState] = useState<ManualLocation | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setAutoState({
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

        setAutoState({
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
        setAutoState({
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

  const setManual = useCallback((city: CityResult) => {
    setManualLocationState({
      latitude: city.latitude,
      longitude: city.longitude,
      cityName: city.name,
    })
  }, [])

  const clearManual = useCallback(() => {
    setManualLocationState(null)
  }, [])

  const effective = manualLocation ?? {
    latitude: autoState.latitude,
    longitude: autoState.longitude,
    cityName: autoState.cityName,
  }

  return {
    latitude: effective.latitude,
    longitude: effective.longitude,
    accuracy: manualLocation ? null : autoState.accuracy,
    cityName: effective.cityName,
    loading: autoState.loading,
    error: autoState.error,
    manualLocation,
    setManualLocation: setManual,
    clearManualLocation: clearManual,
  }
}
