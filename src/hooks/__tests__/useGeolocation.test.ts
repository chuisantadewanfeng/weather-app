import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGeolocation } from '../useGeolocation'

const mockGetCurrentPosition = vi.fn()
const mockWatchPosition = vi.fn()

beforeEach(() => {
  vi.stubGlobal('navigator', {
    geolocation: {
      getCurrentPosition: mockGetCurrentPosition,
      watchPosition: mockWatchPosition,
    },
  })
  vi.stubGlobal('localStorage', {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
  })
})

describe('useGeolocation', () => {
  it('should set coords on successful geolocation', async () => {
    mockGetCurrentPosition.mockImplementationOnce((success: PositionCallback) => {
      success({
        coords: { latitude: 39.9, longitude: 116.4, accuracy: 10 },
        timestamp: Date.now(),
      } as GeolocationPosition)
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.latitude).toBe(39.9)
      expect(result.current.longitude).toBe(116.4)
      expect(result.current.accuracy).toBe(10)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  it('should set error on geolocation failure', async () => {
    mockGetCurrentPosition.mockImplementationOnce(
      (_success: PositionCallback, error: PositionErrorCallback) => {
        error({ code: 1, message: 'Permission denied' } as GeolocationPositionError)
      }
    )

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(result.current.loading).toBe(false)
    })
  })
})
