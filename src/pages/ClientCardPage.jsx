import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Tabs, Tab, Typography, CircularProgress, Avatar, Chip } from '@mui/material'
import AppShell from '../components/AppShell'
import IntelTab from '../components/clientcard/IntelTab'
import MeetingsTab from '../components/clientcard/MeetingsTab'
import ProfileTab from '../components/clientcard/ProfileTab'
import OpportunityTab from '../components/clientcard/OpportunityTab'
import { supabase } from '../lib/supabase'
import { getFollowUpStatus, STATUS_LABELS, STATUS_COLORS } from '../utils/followUpStatus'

function TabPanel({ value, index, children }) {
  return value === index ? <Box>{children}</Box> : null
}

const AVATAR_PALETTE = [
  'oklch(36% 0.19 262)', 'oklch(32% 0.17 285)', 'oklch(38% 0.15 155)',
  'oklch(34% 0.18 310)', 'oklch(37% 0.17  27)', 'oklch(33% 0.13 200)',
]
function avatarBg(name) {
  if (!name) return AVATAR_PALETTE[0]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[h]
}
function initials(name) {
  if (!name) return '?'
  const p = name.trim().split(/\s+/)
  return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

export default function ClientCardPage() {
  const { id } = useParams()
  const [tab, setTab] = useState(0)
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [latestFollowUp, setLatestFollowUp] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: m }] = await Promise.all([
        supabase.from('clients')
          .select('*, accounts(name, strategic_importance, industry), users!assigned_to(username)')
          .eq('id', id).single(),
        supabase.from('meetings')
          .select('next_followup_date')
          .eq('client_id', id)
          .order('meeting_date', { ascending: false })
          .limit(1),
      ])
      setClient(c)
      setLatestFollowUp(m?.[0]?.next_followup_date ?? null)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <AppShell title="">
        <Box sx={{ pt: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: 'var(--c-text-3)' }} />
        </Box>
      </AppShell>
    )
  }

  const status = getFollowUpStatus(latestFollowUp)

  return (
    <AppShell title="">
      {/* Hero */}
      <Box sx={{
        bgcolor: 'var(--c-hero)',
        px: 2.5, pt: 2, pb: 2.5,
        display: 'flex', alignItems: 'flex-start', gap: 2,
        borderBottom: '1px solid var(--c-hero-border)',
      }}>
        <Avatar sx={{
          width: 52, height: 52,
          bgcolor: avatarBg(client?.name),
          borderRadius: '16px',
          fontSize: 18, fontWeight: 800,
          flexShrink: 0,
          border: '1px solid oklch(100% 0 0 / 0.1)',
        }}>
          {initials(client?.name)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
          <Typography sx={{
            color: 'var(--c-hero-text)',
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: '-0.5px',
            lineHeight: 1.15,
          }}>
            {client?.name}
          </Typography>
          <Typography sx={{ color: 'var(--c-hero-muted)', fontSize: 13, mt: 0.3, lineHeight: 1.3 }}>
            {client?.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
            <Typography sx={{ color: 'oklch(55% 0.015 80)', fontSize: 12 }}>
              {client?.accounts?.name}
            </Typography>
            {latestFollowUp && status !== 'none' && (
              <Chip
                label={STATUS_LABELS[status]}
                size="small"
                sx={{
                  height: 20, fontSize: 10, fontWeight: 700,
                  bgcolor: `${STATUS_COLORS[status]}22`,
                  color: STATUS_COLORS[status],
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{
        bgcolor: 'var(--c-card)',
        position: 'sticky',
        top: 56,
        zIndex: 9,
        borderBottom: '1px solid var(--c-divider)',
      }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              height: 2,
              borderRadius: '2px 2px 0 0',
              bgcolor: 'var(--c-text)',
            },
            '& .MuiTab-root': { color: 'var(--c-text-2)', fontWeight: 600 },
            '& .Mui-selected': { color: 'var(--c-text) !important', fontWeight: 700 },
          }}
        >
          <Tab label="Intel" />
          <Tab label="Meetings" />
          <Tab label="Pipeline" />
          <Tab label="Profile" />
        </Tabs>
      </Box>

      <TabPanel value={tab} index={0}><IntelTab clientId={id} /></TabPanel>
      <TabPanel value={tab} index={1}><MeetingsTab clientId={id} accountId={client?.account_id} /></TabPanel>
      <TabPanel value={tab} index={2}><OpportunityTab clientId={id} accountId={client?.account_id} /></TabPanel>
      <TabPanel value={tab} index={3}><ProfileTab client={client} /></TabPanel>
    </AppShell>
  )
}
