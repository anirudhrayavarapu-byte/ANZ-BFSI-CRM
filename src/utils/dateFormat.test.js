import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatDate, formatRelative } from './dateFormat'

describe('formatDate', () => {
  it('formats a date string to readable format', () => {
    expect(formatDate('2026-06-07')).toBe('7 June 2026')
  })

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('')
  })
})

describe('formatRelative', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-07'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns Today for today', () => {
    expect(formatRelative('2026-06-07')).toBe('Today')
  })

  it('returns Yesterday for yesterday', () => {
    expect(formatRelative('2026-06-06')).toBe('Yesterday')
  })

  it('returns X days ago for recent past', () => {
    expect(formatRelative('2026-06-03')).toBe('4 days ago')
  })

  it('returns formatted date for older dates', () => {
    expect(formatRelative('2026-01-01')).toBe('1 Jan 2026')
  })
})
