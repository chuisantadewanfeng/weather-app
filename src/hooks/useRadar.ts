import { useState, useEffect, useCallback } from 'react'
import type { RadarFrame } from '../types/weather'
import { fetchRadar } from '../utils/api'

interface RadarState {
  frames: RadarFrame[]
  host: string
  generated: number
  loading: boolean
  error: string | null
}

export function useRadar() {
  const [state, setState] = useState<RadarState>({
    frames: [],
    host: '',
    generated: 0,
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))

    try {
      const data = await fetchRadar()
      const frames = [...data.radar.past, ...data.radar.nowcast]
      setState({
        frames,
        host: data.host,
        generated: data.generated,
        loading: false,
        error: null,
      })
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : '获取雷达数据失败',
      }))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, refresh: load }
}
