import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CitySearch } from '../CitySearch'

vi.mock('../../utils/api', () => ({
  searchCity: vi.fn().mockResolvedValue([
    { name: '北京', latitude: 39.9, longitude: 116.4, country: '中国', admin1: '北京' },
    { name: '上海', latitude: 31.2, longitude: 121.5, country: '中国', admin1: '上海' },
  ]),
}))

describe('CitySearch', () => {
  const onSelect = vi.fn()
  const onClearManual = vi.fn()

  beforeEach(() => {
    onSelect.mockClear()
    onClearManual.mockClear()
  })

  it('should display current city name by default', () => {
    render(<CitySearch currentCityName="郑州" onSelect={onSelect} />)
    expect(screen.getByText('郑州')).toBeInTheDocument()
  })

  it('should show search input when city name is clicked', async () => {
    const user = userEvent.setup()
    render(<CitySearch currentCityName="郑州" onSelect={onSelect} />)

    await user.click(screen.getByText('郑州'))

    expect(screen.getByPlaceholderText('搜索城市...')).toBeInTheDocument()
  })

  it('should show results when typing >= 2 characters', async () => {
    const user = userEvent.setup()
    render(<CitySearch currentCityName="郑州" onSelect={onSelect} />)

    await user.click(screen.getByText('郑州'))
    await user.type(screen.getByPlaceholderText('搜索城市...'), '北京')

    await waitFor(() => {
      expect(screen.getByText('北京')).toBeInTheDocument()
      expect(screen.getByText('上海')).toBeInTheDocument()
    })
  })

  it('should call onSelect when a result is clicked', async () => {
    const user = userEvent.setup()
    render(<CitySearch currentCityName="郑州" onSelect={onSelect} />)

    await user.click(screen.getByText('郑州'))
    await user.type(screen.getByPlaceholderText('搜索城市...'), '北京')

    await waitFor(() => {
      expect(screen.getByText('北京')).toBeInTheDocument()
    })

    await user.click(screen.getByText('北京'))

    expect(onSelect).toHaveBeenCalledWith({
      name: '北京',
      latitude: 39.9,
      longitude: 116.4,
      country: '中国',
      admin1: '北京',
    })
  })

  it('should show "back to GPS" option', async () => {
    const user = userEvent.setup()
    render(<CitySearch currentCityName="上海" onSelect={onSelect} onClearManual={onClearManual} showGpsFallback />)

    await user.click(screen.getByText('上海'))

    expect(screen.getByText('回到当前 GPS 位置')).toBeInTheDocument()
  })
})
