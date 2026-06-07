import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Tabs, Tab, Typography, CircularProgress, Avatar, Chip } from '@mui/material'
import AppShell from '../components/AppShell'
import IntelTab from '../components/clientcard/IntelTab'
import MeetingsTab from '../components/clientcard/MeetingsTab'
import ProfileTab from '../components/clientcard/ProfileTab'
import { supabase } from '../lib/supabase'
import { getFollowUpStatus, STATUS_LABELS, STATUS_COLORS } from '../utils/followUpStatus'

function TabPanel({ value, index, children }) {
  return value === index ? <Box>{children}</Box> : null
}

const AVATAR_COLORS = ['#1a237e', '#1565c0', '#1b5e20', '#4a148c', '#bf360c', '#006064', '#33691e', '#880e4f']
function avatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}
function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

export default function ClientCardPage() {
  const { id } = useParams()
  const [tab, setTab] = useState(0)
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [latestFollowUp, setLatestFollowUp] = useState(null)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('clients')
        .select('*, accounts ( name, strategic_importance, industry ), users!assigned_to ( username )')
        .eq('id', id)
        .single()
      setClient(data)

      const { data: meetings } = await supabase
        .from('meetings')
        .select('next_followup_date')
        .eq('client_id', id)
        .order('meeting_date', { ascending: false })
        .limit(1)
      setLatestFollowUp(meetings?.[0]?.next_followup_date ?? null)
      setLoading(false)
    }
    fetch()
  }, [id])

  if (loading) {
    return (
      <AppShell title="">
        <Box sx={{ pt: 6, textAlign: 'center' }}><CircularProgress /></Box>
      </AppShell>
    )
  }

  const status = getFollowUpStatus(latestFollowUp)

  return (
    <AppShell title="">
      <Box sx={{
        background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 100%)',
        px: 2, pt: 2, pb: 3,
        display: 'flex', alignItems: 'flex-start', gap: 2,
      }}>
        <Avatar sx={{
          width: 56, height: 56, flexShrink: 0,
          bgcolor: avatarColor(client?.name),
          border: '3px solid rgba(255,255,255,0.3)',
          fontWeight: 700, fontSize: 20,
        }}>
          {getInitials(client?.name)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', letterSpacing: '-0.3px', fontSize: 18, lineHeight: 1.2 }}>
            {client?.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.25 }}>
            {client?.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              {client?.accounts?.name}
            </Typography>
            {latestFollowUp && status !== 'none' && (
              <Chip
                label={STATUS_LABELS[status]}
                size="small"
                sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: STATUS_COLORS[status] + '30', color: '#fff', border: `1px solid ${STATUS_COLORS[status]}60` }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ bgcolor: '#fff', position: 'sticky', top: 56, zIndex: 9, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          <Tab label="Intel" />
          <Tab label="Meetings" />
          <Tab label="Profile" />
        </Tabs>
      </Box>

      <TabPanel value={tab} index={0}><IntelTab clientId={id} /></TabPanel>
      <TabPanel value={tab} index={1}><MeetingsTab clientId={id} accountId={client?.account_id} /></TabPanel>
      <TabPanel value={tab} index={2}><ProfileTab client={client} /></TabPanel>
    </AppShell>
  )
}
