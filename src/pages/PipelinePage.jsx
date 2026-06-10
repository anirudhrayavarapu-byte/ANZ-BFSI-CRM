import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, CircularProgress, Chip, ToggleButton, ToggleButtonGroup } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AppShell from '../components/AppShell'
import { supabase } from '../lib/supabase'
import { formatDate } from '../utils/dateFormat'

const formatAUD = v =>
  v == null ? '—'
  : new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(v)

const STATUS_CONFIG = {
  active: { label: 'Active',  color: '#1565c0', bg: '#1565c018' },
  won:    { label: 'Won',     color: '#2e7d32', bg: '#2e7d3218' },
  lost:   { label: 'Lost',    color: '#757575', bg: '#75757518' },
}

function closeDateStatus(dateStr, status) {
  if (status !== 'active' || !dateStr) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const d = new Date(dateStr); d.setHours(0,0,0,0)
  const diff = Math.round((d - today) / 86400000)
  if (diff < 0)  return { label: 'Overdue',       color: '#c62828' }
  if (diff <= 30) return { label: 'Closing soon',  color: '#e65100' }
  return null
}

function DealCard({ opp }) {
  const sc = STATUS_CONFIG[opp.status] ?? STATUS_CONFIG.active
  const dateAlert = closeDateStatus(opp.close_date, opp.status)

  return (
    <Box sx={{
      bgcolor: 'var(--c-card)', borderRadius: '16px', p: 2,
      border: '1px solid var(--c-divider)', boxShadow: 'var(--shadow-card)',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
        <Typography fontWeight={700} fontSize={14} letterSpacing="-0.2px" sx={{ flex: 1, mr: 1, lineHeight: 1.3 }}>
          {opp.name}
        </Typography>
        <Chip label={sc.label} size="small" sx={{
          bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: 10,
          height: 20, flexShrink: 0, border: `1px solid ${sc.color}30`,
        }} />
      </Box>

      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mb: 1 }}>
        {opp.clients?.name}
        {opp.clients?.accounts?.name ? ` · ${opp.clients.accounts.name}` : ''}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontWeight={800} fontSize={18} color="primary.main" letterSpacing="-0.3px">
          {formatAUD(opp.deal_value)}
        </Typography>
        {opp.close_date && (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: dateAlert?.color ?? 'var(--c-text-3)', fontWeight: dateAlert ? 700 : 500 }}>
              {dateAlert ? `${dateAlert.label} · ` : ''}{formatDate(opp.close_date)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default function PipelinePage() {
  const [opps, setOpps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')

  useEffect(() => {
    supabase.from('opportunities')
      .select('id, name, deal_value, close_date, status, clients(id, name, accounts(name))')
      .order('close_date', { ascending: true, nullsFirst: false })
      .then(({ data }) => { setOpps(data ?? []); setLoading(false) })
  }, [])

  const stats = useMemo(() => {
    const active = opps.filter(o => o.status === 'active')
    const won    = opps.filter(o => o.status === 'won')
    const totalValue = active.reduce((s, o) => s + (o.deal_value ?? 0), 0)
    const wonValue   = won.reduce((s, o) => s + (o.deal_value ?? 0), 0)
    return { active: active.length, won: won.length, lost: opps.filter(o => o.status === 'lost').length, totalValue, wonValue }
  }, [opps])

  const visible = useMemo(() =>
    filter === 'all' ? opps : opps.filter(o => o.status === filter)
  , [opps, filter])

  return (
    <AppShell title="Pipeline">
      <Box sx={{ pb: 10 }}>

        {/* Summary */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 2, bgcolor: 'var(--c-card)', borderBottom: '1px solid var(--c-divider)' }}>
          <Box sx={{ display: 'flex', gap: 2.5, mb: 1.5 }}>
            <Box>
              <Typography fontWeight={800} fontSize={22} color="primary.main" lineHeight={1}>
                {formatAUD(stats.totalValue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Active pipeline</Typography>
            </Box>
            <Box>
              <Typography fontWeight={800} fontSize={22} sx={{ color: '#2e7d32', lineHeight: 1 }}>
                {formatAUD(stats.wonValue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Won</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              <Box component="span" fontWeight={700} color="text.primary">{stats.active}</Box> active
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <Box component="span" fontWeight={700} sx={{ color: '#2e7d32' }}>{stats.won}</Box> won
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <Box component="span" fontWeight={700} color="text.secondary">{stats.lost}</Box> lost
            </Typography>
          </Box>
        </Box>

        {/* Filter */}
        <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
          <ToggleButtonGroup
            value={filter} exclusive
            onChange={(_, v) => { if (v) setFilter(v) }}
            size="small"
            sx={{
              bgcolor: 'var(--c-card)', border: '1px solid var(--c-divider)', borderRadius: '12px',
              '& .MuiToggleButton-root': {
                border: 'none', borderRadius: '10px !important',
                fontWeight: 600, fontSize: 12, px: 1.75, py: 0.75, color: 'var(--c-text-2)',
                '&.Mui-selected': { bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)', fontWeight: 700 },
              },
            }}
          >
            <ToggleButton value="active">Active</ToggleButton>
            <ToggleButton value="won">Won</ToggleButton>
            <ToggleButton value="lost">Lost</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Deals */}
        <Box sx={{ px: 2.5, pt: 1, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', pt: 6 }}><CircularProgress /></Box>
          ) : visible.length === 0 ? (
            <Box sx={{ textAlign: 'center', pt: 6 }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: 'var(--c-text-3)', mb: 1 }} />
              <Typography color="text.secondary" fontWeight={600}>No {filter === 'all' ? '' : filter} deals yet</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Add opportunities from a client card
              </Typography>
            </Box>
          ) : (
            visible.map(o => <DealCard key={o.id} opp={o} />)
          )}
        </Box>
      </Box>
    </AppShell>
  )
}
