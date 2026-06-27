# City Search & Location Switching

## Overview

Add city search to `LocationHeader` so users can switch weather data to any city. Uses Open-Meteo Geocoding API (free, no key).

## API: `searchCity`

Added to `src/utils/api.ts`:

```
GET https://geocoding-api.open-meteo.com/v1/search
  ?name={query}&count=5&language=zh&format=json
```

Returns `CityResult[]` where each result has `name`, `latitude`, `longitude`, `country`, `admin1`.

## Hook: `useGeolocation` changes

Add manual override on top of existing GPS/default logic:

- `manualLocation: { lat, lon, cityName } | null` — when set, overrides GPS/default
- `setManualLocation(city: CityResult): void` — sets override
- `clearManualLocation(): void` — falls back to GPS/default

Priority: manualLocation > GPS > default (Zhengzhou).

## Component: `CitySearch`

Embedded inside `LocationHeader`. Interaction flow:

1. Default: city name shown with a dropdown indicator
2. Click city name: input expands, auto-focuses
3. Type >= 2 chars: debounce 300ms, call `searchCity`
4. Results appear as dropdown list
5. Click a result: calls `setManualLocation`, input collapses
6. Escape / click outside: collapse, restore previous city
7. Bottom of list: "back to current GPS location" shortcut

States: idle / active / searching / results / no_results / error.

## Error handling

| Scenario | Behavior |
|----------|----------|
| Search API fails | Show "搜索失败" inline, keep stale results |
| No results | Show "未找到匹配城市" |
| Weather API fails for new city | Show error banner with retry button, keep old weather data visible |

## Testing

- `searchCity`: normal response, empty results, network error
- `useGeolocation`: manual/auto priority, clearManualLocation
- `CitySearch`: debounce, AbortController cancellation, keyboard (Escape), click outside
