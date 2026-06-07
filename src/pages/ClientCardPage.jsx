import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Tabs, Tab, Typography, CircularProgress } from '@mui/material'
import AppShell from '../components/AppShell'
import IntelTab from '../components/clientcard/IntelTab'
import MeetingsTab from '../components/clientcard/MeetingsTab'
import ProfileTab from '../components/clientcard/ProfileTab'
import { supabase } from '../lib/supabase'

function TabPanel({ value, index, children }) {
  return value === index ? <Box>{children}</Box> : null
}

export default function ClientCardPage() {
  const { id } = useParams()
  const [tab, setTab] = useState(0)
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('clients')
        .select('*, accounts ( name, strategic_importance, industry ), users!assigned_to ( username )')
        .eq('id', id)
        .single()
      setClient(data)
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

  return (
    <AppShell title={client?.name ?? ''}>
      <Box sx={{ bgcolor: '#1a237e', px: 2, pb: 2 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>{client?.title}</Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{client?.accounts?.name}</Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 56, zIndex: 9 }}
      >
        <Tab label="Intel" />
        <Tab label="Meetings" />
        <Tab label="Profile" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <IntelTab clientId={id} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <MeetingsTab clientId={id} accountId={client?.account_id} />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <ProfileTab client={client} />
      </TabPanel>
    </AppShell>
  )
}
