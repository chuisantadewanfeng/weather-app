import { useState, useEffect, useRef, useCallback } from 'react'
import type { RadarFrame } from '../types/weather'
import './RadarMap.css'

interface RadarMapProps {
  frames: RadarFrame[]
  host: string
  latitude: number
  longitude: number
}

function lonToTileX(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * Math.pow(2, zoom)
}

function latToTileY(lat: number, zoom: number): number {
  const rad = (lat * Math.PI) / 180
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, zoom)
}

const ZOOM = 7
const TILE_SIZE = 256

export function RadarMap({ frames, host, latitude, longitude }: RadarMapProps) {
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const centerTileX = lonToTileX(longitude, ZOOM)
  const centerTileY = latToTileY(latitude, ZOOM)

  useEffect(() => {
    if (!playing || frames.length <= 1) return
    const interval = setInterval(() => {
      setFrameIndex((i) => (i + 1) % frames.length)
    }, 500)
    return () => clearInterval(interval)
  }, [playing, frames.length])

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current
      setOffset({
        x: container.clientWidth / 2 - centerTileX * TILE_SIZE,
        y: container.clientHeight / 2 - centerTileY * TILE_SIZE,
      })
    }
  }, [centerTileX, centerTileY])

  const tileUrl = frames.length > 0
    ? `${host}${frames[frameIndex].path}/256/{z}/{x}/{y}/2/1_1.png`
    : ''

  const renderTiles = useCallback(() => {
    if (!tileUrl) return null
    const cx = Math.floor(centerTileX)
    const cy = Math.floor(centerTileY)
    const tiles = []
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const tx = cx + dx
        const ty = cy + dy
        const url = tileUrl
          .replace('{z}', ZOOM.toString())
          .replace('{x}', tx.toString())
          .replace('{y}', ty.toString())
        tiles.push(
          <img
            key={`${tx}_${ty}`}
            src={url}
            alt=""
            className="radar-tile"
            style={{
              position: 'absolute',
              left: tx * TILE_SIZE + offset.x,
              top: ty * TILE_SIZE + offset.y,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
          />
        )
      }
    }
    return tiles
  }, [tileUrl, centerTileX, centerTileY, offset])

  const crosshairX = centerTileX * TILE_SIZE + offset.x
  const crosshairY = centerTileY * TILE_SIZE + offset.y

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">降水雷达</h2>

      <div className="relative">
        <div
          ref={containerRef}
          className="radar-container relative overflow-hidden rounded-xl bg-gray-900"
          style={{ height: 400 }}
        >
          <div className="absolute inset-0">
            {renderTiles()}
          </div>

          <div
            className="absolute pointer-events-none z-10"
            style={{ left: crosshairX, top: crosshairY, transform: 'translate(-50%, -50%)' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="4" fill="none" stroke="#3B82F6" strokeWidth="2" />
              <line x1="10" y1="2" x2="10" y2="6" stroke="#3B82F6" strokeWidth="2" />
              <line x1="10" y1="14" x2="10" y2="18" stroke="#3B82F6" strokeWidth="2" />
              <line x1="2" y1="10" x2="6" y2="10" stroke="#3B82F6" strokeWidth="2" />
              <line x1="14" y1="10" x2="18" y2="10" stroke="#3B82F6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {frames.length > 1 && (
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setPlaying(!playing)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {playing ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          <input
            type="range"
            min={0}
            max={frames.length - 1}
            value={frameIndex}
            onChange={(e) => {
              setFrameIndex(Number(e.target.value))
              setPlaying(false)
            }}
            className="flex-1 h-1 accent-sky-400"
          />

          <span className="text-xs text-white/60 min-w-[80px] text-right">
            {frameIndex + 1} / {frames.length}
          </span>
        </div>
      )}
    </div>
  )
}
