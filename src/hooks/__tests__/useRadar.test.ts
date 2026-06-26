import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRadar } from '../useRadar'

const mockRadarData = {
  generated: 1719400000,
  host: 'https://tilecache.rainviewer.com',
  radar: {
    past: [{ time: 1719399600, path: '/v2/map/past/abc/256/{z}/{x}/{y}/2/1_1.png' }],
    nowcast: [{ time: 1719400000, path: '/v2/map/nowcast/def/256/{z}/{x}/{y}/2/1_1.png' }],
  },
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useRadar', () => {
  it('should fetch radar data', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRadarData),
    })

    const { result } = renderHook(() => useRadar())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.frames).toHaveLength(2)
    expect(result.current.host).toBe('https://tilecache.rainviewer.com')
  })

  it('should handle error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    const { result } = renderHook(() => useRadar())

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })
})
