import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getFollowUpStatus, sortByUrgency } from './followUpStatus'

describe('getFollowUpStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-07'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns overdue for dates in the past', () => {
    expect(getFollowUpStatus('2026-06-01')).toBe('overdue')
  })

  it('returns today for today\'s date', () => {
    expect(getFollowUpStatus('2026-06-07')).toBe('today')
  })

  it('returns upcoming for dates within 7 days', () => {
    expect(getFollowUpStatus('2026-06-10')).toBe('upcoming')
  })

  it('returns future for dates beyond 7 days', () => {
    expect(getFollowUpStatus('2026-07-01')).toBe('future')
  })

  it('returns none for null', () => {
    expect(getFollowUpStatus(null)).toBe('none')
  })
})

describe('sortByUrgency', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-07'))
  })
  afterEach(() => vi.useRealTimers())

  it('sorts overdue before today before upcoming', () => {
    const items = [
      { next_followup_date: '2026-06-10', label: 'upcoming' },
      { next_followup_date: '2026-06-01', label: 'overdue' },
      { next_followup_date: '2026-06-07', label: 'today' },
    ]
    const sorted = sortByUrgency(items)
    expect(sorted[0].label).toBe('overdue')
    expect(sorted[1].label).toBe('today')
    expect(sorted[2].label).toBe('upcoming')
  })
})
