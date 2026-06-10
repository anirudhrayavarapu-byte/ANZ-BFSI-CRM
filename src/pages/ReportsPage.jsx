import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, CircularProgress, Avatar, Chip, ToggleButton, ToggleButtonGroup, Button } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import AppShell from '../components/AppShell'
import { supabase } from '../lib/supabase'
import { formatDate } from '../utils/dateFormat'

const PERIODS = [
  { label: '7 days',  days: 7  },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

const SENTIMENT_LABEL = {
  very_negative: 'Very negative', negative: 'Negative',
  neutral: 'Neutral', positive: 'Positive', very_positive: 'Very positive',
}

const AVATAR_COLORS = [
  '#1a237e','#0d47a1','#1565c0','#0277bd','#00838f',
  '#2e7d32','#558b2f','#e65100','#bf360c','#4a148c',
]
function getColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length > 1 ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase() : name.slice(0,2).toUpperCase()
}

function StatCard({ value, label, color }) {
  return (
    <Box sx={{ flex: 1, bgcolor: 'var(--c-card)', borderRadius: '14px', p: 1.75, border: '1px solid var(--c-divider)', textAlign: 'center' }}>
      <Typography fontWeight={800} fontSize={26} lineHeight={1} sx={{ color: color ?? 'primary.main' }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.4, lineHeight: 1.3 }}>{label}</Typography>
    </Box>
  )
}

function exportCSV(meetings, days) {
  const header = ['Date','Client','Title','Account','Logged By','Topics','Summary','Sentiment','Next Follow-up']
  const rows = meetings.map(m => {
    let topics = []
    try { topics = JSON.parse(m.topics_discussed ?? '[]') } catch {}
    return [
      m.meeting_date,
      m.clients?.name ?? '',
      m.clients?.title ?? '',
      m.clients?.accounts?.name ?? '',
      m.logger?.username ?? '',
      topics.join('; '),
      (m.discussion_summary ?? '').replace(/"/g, '""'),
      SENTIMENT_LABEL[m.client_sentiment] ?? '',
      m.next_followup_date ?? '',
    ].map(v => `"${v}"`).join(',')
  })
  const csv = [header.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `meetings-last-${days}-days.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const [days, setDays] = useState(30)
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
    supabase.from('meetings')
      .select(`
        id, meeting_date, topics_discussed, discussion_summary, client_sentiment, next_followup_date,
        clients(id, name, title, account_id, accounts(id, name)),
        logger:users!logged_by(id, username)
      `)
      .gte('meeting_date', since)
      .order('meeting_date', { ascending: false })
      .then(({ data }) => { setMeetings(data ?? []); setLoading(false) })
  }, [days])

  const stats = useMemo(() => {
    const people  = new Set(meetings.map(m => m.logger?.id).filter(Boolean))
    const clients = new Set(meetings.map(m => m.clients?.id).filter(Boolean))
    const accounts = new Set(meetings.map(m => m.clients?.accounts?.id).filter(Boolean))
    return { total: meetings.length, people: people.size, clients: clients.size, accounts: accounts.size }
  }, [meetings])

  const byPerson = useMemo(() => {
    const map = {}
    for (const m of meetings) {
      const uid = m.logger?.id
      if (!uid) continue
      if (!map[uid]) map[uid] = { username: m.logger.username, count: 0, clients: new Set() }
      map[uid].count++
      if (m.clients?.id) map[uid].clients.add(m.clients.id)
    }
    return Object.values(map)
      .map(p => ({ ...p, clientCount: p.clients.size }))
      .sort((a, b) => b.count - a.count)
  }, [meetings])

  const byAccount = useMemo(() => {
    const map = {}
    for (const m of meetings) {
      const aid = m.clients?.accounts?.id
      if (!aid) continue
      if (!map[aid]) map[aid] = { name: m.clients.accounts.name, count: 0, clients: new Set() }
      map[aid].count++
      if (m.clients?.id) map[aid].clients.add(m.clients.id)
    }
    return Object.values(map)
      .map(a => ({ ...a, clientCount: a.clients.size }))
      .sort((a, b) => b.count - a.count)
  }, [meetings])

  return (
    <AppShell title="Reports">
      <Box sx={{ pb: 10 }}>

        {/* Period selector + export */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <ToggleButtonGroup
            value={days}
            exclusive
            onChange={(_, v) => { if (v) setDays(v) }}
            size="small"
            sx={{
              bgcolor: 'var(--c-card)', border: '1px solid var(--c-divider)', borderRadius: '12px',
              '& .MuiToggleButton-root': {
                border: 'none', borderRadius: '10px !important',
                fontWeight: 600, fontSize: 12, px: 1.5, py: 0.75, color: 'var(--c-text-2)',
                '&.Mui-selected': { bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)', fontWeight: 700 },
              },
            }}
          >
            {PERIODS.map(p => (
              <ToggleButton key={p.days} value={p.days}>{p.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Button
            startIcon={<DownloadIcon />}
            disabled={loading || meetings.length === 0}
            onClick={() => exportCSV(meetings, days)}
            size="small"
            sx={{
              bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)', borderRadius: '10px',
              fontWeight: 700, fontSize: 12, px: 1.75, py: 0.9,
              '&:hover': { bgcolor: 'var(--c-hero-raised)' },
              '&.Mui-disabled': { bgcolor: 'var(--c-border)', color: 'var(--c-text-3)' },
            }}
          >
            CSV
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', pt: 8 }}><CircularProgress /></Box>
        ) : (
          <>
            {/* Summary stats */}
            <Box sx={{ px: 2.5, pb: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <StatCard value={stats.total}    label="Meetings"  />
                <StatCard value={stats.people}   label="Team members" color="#0277bd" />
                <StatCard value={stats.clients}  label="Clients"   color="#2e7d32" />
                <StatCard value={stats.accounts} label="Accounts"  color="#e65100" />
              </Box>
            </Box>

            {meetings.length === 0 ? (
              <Box sx={{ textAlign: 'center', pt: 4, px: 3 }}>
                <Typography color="text.secondary" fontWeight={600}>No meetings in this period</Typography>
              </Box>
            ) : (
              <>
                {/* By person */}
                <Box sx={{ px: 2.5, mb: 2.5 }}>
                  <Typography sx={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
                    textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.5,
                  }}>
                    Activity by person
                  </Typography>
                  <Box sx={{ bgcolor: 'var(--c-card)', borderRadius: '16px', border: '1px solid var(--c-divider)', overflow: 'hidden' }}>
                    {byPerson.map((p, i) => (
                      <Box key={p.username} sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        px: 2, py: 1.5,
                        borderBottom: i < byPerson.length - 1 ? '1px solid var(--c-divider)' : 'none',
                      }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: getColor(p.username), fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                          {getInitials(p.username)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight={600} fontSize={14} noWrap>{p.username}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.clientCount} {p.clientCount === 1 ? 'client' : 'clients'}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography fontWeight={800} fontSize={18} color="primary.main" lineHeight={1}>{p.count}</Typography>
                          <Typography variant="caption" color="text.secondary">meetings</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* By account */}
                <Box sx={{ px: 2.5, mb: 2.5 }}>
                  <Typography sx={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
                    textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.5,
                  }}>
                    Activity by account
                  </Typography>
                  <Box sx={{ bgcolor: 'var(--c-card)', borderRadius: '16px', border: '1px solid var(--c-divider)', overflow: 'hidden' }}>
                    {byAccount.map((a, i) => (
                      <Box key={a.name} sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        px: 2, py: 1.5,
                        borderBottom: i < byAccount.length - 1 ? '1px solid var(--c-divider)' : 'none',
                      }}>
                        <Avatar sx={{ width: 34, height: 34, borderRadius: '9px', bgcolor: getColor(a.name), fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                          {getInitials(a.name)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight={600} fontSize={14} noWrap>{a.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {a.clientCount} {a.clientCount === 1 ? 'client' : 'clients'}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography fontWeight={800} fontSize={18} color="primary.main" lineHeight={1}>{a.count}</Typography>
                          <Typography variant="caption" color="text.secondary">meetings</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Meeting feed */}
                <Box sx={{ px: 2.5 }}>
                  <Typography sx={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
                    textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.5,
                  }}>
                    All meetings ({meetings.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {meetings.map(m => {
                      let topics = []
                      try { topics = JSON.parse(m.topics_discussed ?? '[]') } catch {}
                      return (
                        <Box key={m.id} sx={{
                          bgcolor: 'var(--c-card)', borderRadius: '14px', p: 2,
                          border: '1px solid var(--c-divider)',
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                            <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                              <Typography fontWeight={700} fontSize={14} letterSpacing="-0.2px" noWrap>
                                {m.clients?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                {m.clients?.accounts?.name}
                                {m.logger?.username ? ` · ${m.logger.username}` : ''}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'var(--c-text-3)', flexShrink: 0 }}>
                              {formatDate(m.meeting_date)}
                            </Typography>
                          </Box>
                          {topics.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.75, mb: 0.5 }}>
                              {topics.map(t => (
                                <Chip key={t} label={t} size="small" sx={{
                                  height: 18, fontSize: 10, fontWeight: 600,
                                  bgcolor: 'var(--c-surface)', color: 'var(--c-text-2)',
                                }} />
                              ))}
                            </Box>
                          )}
                          {m.discussion_summary && (
                            <Typography variant="caption" color="text.secondary" sx={{
                              display: '-webkit-box', WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical', overflow: 'hidden',
                              lineHeight: 1.55, mt: 0.5,
                            }}>
                              {m.discussion_summary}
                            </Typography>
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </AppShell>
  )
}
