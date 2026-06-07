const URGENCY_ORDER = { overdue: 0, today: 1, upcoming: 2, future: 3, none: 4 }

export function getFollowUpStatus(dateStr) {
  if (!dateStr) return 'none'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  const diffDays = Math.round((date - today) / 86400000)
  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 7) return 'upcoming'
  return 'future'
}

export function sortByUrgency(items, dateKey = 'next_followup_date') {
  return [...items].sort((a, b) => {
    const sa = URGENCY_ORDER[getFollowUpStatus(a[dateKey])]
    const sb = URGENCY_ORDER[getFollowUpStatus(b[dateKey])]
    return sa - sb
  })
}

export const STATUS_LABELS = {
  overdue: 'Overdue',
  today: 'Due today',
  upcoming: 'Due soon',
  future: 'On track',
  none: '',
}

export const STATUS_COLORS = {
  overdue: '#d32f2f',
  today: '#f57c00',
  upcoming: '#f9a825',
  future: '#388e3c',
  none: '#9e9e9e',
}
