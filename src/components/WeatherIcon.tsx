interface WeatherIconProps {
  code: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = { sm: 24, md: 40, lg: 64 }

function SunIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="14" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line key={angle} x1="32" y1="6" x2="32" y2="14" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round"
          transform={`rotate(${angle} 32 32)`} />
      ))}
    </svg>
  )
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="36" rx="20" ry="12" fill="#9CA3AF" />
      <ellipse cx="26" cy="30" rx="14" ry="10" fill="#D1D5DB" />
      <ellipse cx="38" cy="28" rx="12" ry="9" fill="#E5E7EB" />
    </svg>
  )
}

function PartlyCloudyIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="24" r="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <line key={angle} x1="22" y1="6" x2="22" y2="12" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round"
          transform={`rotate(${angle} 22 24)`} />
      ))}
      <ellipse cx="36" cy="40" rx="18" ry="11" fill="#D1D5DB" />
      <ellipse cx="32" cy="36" rx="13" ry="9" fill="#E5E7EB" />
    </svg>
  )
}

function RainIcon({ heavy }: { heavy?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="26" rx="18" ry="10" fill="#9CA3AF" />
      <ellipse cx="26" cy="22" rx="14" ry="9" fill="#D1D5DB" />
      {heavy ? (
        <>
          <line x1="20" y1="34" x2="16" y2="48" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="30" y1="34" x2="26" y2="52" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="40" y1="34" x2="36" y2="46" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1="24" y1="32" x2="20" y2="44" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="32" x2="32" y2="42" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

function SnowIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="24" rx="18" ry="10" fill="#9CA3AF" />
      <ellipse cx="26" cy="20" rx="14" ry="9" fill="#D1D5DB" />
      <circle cx="18" cy="40" r="2.5" fill="white" stroke="#93C5FD" strokeWidth="1" />
      <circle cx="28" cy="46" r="2.5" fill="white" stroke="#93C5FD" strokeWidth="1" />
      <circle cx="38" cy="38" r="2.5" fill="white" stroke="#93C5FD" strokeWidth="1" />
      <circle cx="44" cy="44" r="2.5" fill="white" stroke="#93C5FD" strokeWidth="1" />
    </svg>
  )
}

function FogIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="24" x2="52" y2="24" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round" />
      <line x1="16" y1="34" x2="48" y2="34" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round" />
      <line x1="14" y1="44" x2="50" y2="44" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function ThunderstormIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="24" rx="18" ry="10" fill="#6B7280" />
      <ellipse cx="26" cy="20" rx="14" ry="9" fill="#9CA3AF" />
      <polygon points="32,28 24,44 30,44 26,56 40,36 32,36 36,28" fill="#FBBF24" />
    </svg>
  )
}

function getIcon(code: number) {
  if (code === 0) return SunIcon
  if (code >= 1 && code <= 3) return PartlyCloudyIcon
  if (code === 45 || code === 48) return FogIcon
  if (code >= 51 && code <= 57) return () => <RainIcon />
  if (code >= 61 && code <= 67) return () => <RainIcon />
  if (code >= 71 && code <= 77) return SnowIcon
  if (code >= 80 && code <= 82) return () => <RainIcon heavy />
  if (code >= 95 && code <= 99) return ThunderstormIcon
  return CloudIcon
}

export function WeatherIcon({ code, size = 'md', className = '' }: WeatherIconProps) {
  const IconComponent = getIcon(code)
  const px = sizeMap[size]

  return (
    <div className={`inline-flex ${className}`} style={{ width: px, height: px }}>
      <IconComponent />
    </div>
  )
}
