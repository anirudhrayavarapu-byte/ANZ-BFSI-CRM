import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box, Typography, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert, Collapse,
  Divider
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import AppShell from '../components/AppShell'
import SentimentPicker from '../components/meeting/SentimentPicker'
import TopicChips from '../components/meeting/TopicChips'
import { useMeetingStore } from '../store/meetingStore'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

const FOLLOWUP_OPTIONS = [
  { value: '1_week', label: '1 week' },
  { value: '1_month', label: '1 month' },
  { value: '1_quarter', label: '1 quarter' },
  { value: 'custom', label: 'Custom date' },
]

function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function followUpFromOption(option, customDate) {
  if (option === '1_week') return addDays(7)
  if (option === '1_month') return addDays(30)
  if (option === '1_quarter') return addDays(91)
  return customDate ?? null
}

export default function LogMeetingPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const clientId = params.get('clientId')
  const accountId = params.get('accountId')

  const { profile } = useAuthStore()
  const { logMeeting, submitting, error } = useMeetingStore()

  const [clientName, setClientName] = useState('')
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0])
  const [sentiment, setSentiment] = useState('neutral')
  const [followUp, setFollowUp] = useState('1_month')
  const [customDate, setCustomDate] = useState('')
  const [topics, setTopics] = useState([])
  const [summary, setSummary] = useState('')
  const [outcomes, setOutcomes] = useState('')
  const [showExtra, setShowExtra] = useState(false)

  useEffect(() => {
    if (!clientId) return
    supabase.from('clients').select('name').eq('id', clientId).single()
      .then(({ data }) => { if (data) setClientName(data.name) })
  }, [clientId])

  async function handleSubmit() {
    const payload = {
      client_id: clientId,
      account_id: accountId || null,
      logged_by: profile?.id,
      meeting_date: meetingDate,
      topics_discussed: JSON.stringify(topics),
      discussion_summary: summary || null,
      outcomes: outcomes || null,
      client_sentiment: sentiment,
      next_followup: followUp,
      next_followup_date: followUpFromOption(followUp, customDate),
    }

    const { success } = await logMeeting(payload)
    if (success) navigate(-1)
  }

  return (
    <AppShell title="Log Meeting">
      <Box sx={{ px: 2, pt: 2, pb: 10 }}>
        {clientName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Meeting with <strong>{clientName}</strong>
          </Typography>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          label="Meeting date"
          type="date"
          fullWidth
          value={meetingDate}
          onChange={e => setMeetingDate(e.target.value)}
          sx={{ mb: 3 }}
          InputLabelProps={{ shrink: true }}
        />

        <Box sx={{ mb: 3 }}>
          <SentimentPicker value={sentiment} onChange={setSentiment} />
        </Box>

        <Box sx={{ mb: 3 }}>
          <TopicChips value={topics} onChange={setTopics} />
        </Box>

        <TextField
          label="What was discussed"
          multiline
          minRows={2}
          fullWidth
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Key topics from the conversation..."
          sx={{ mb: 3 }}
        />

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Next follow-up</InputLabel>
          <Select value={followUp} label="Next follow-up" onChange={e => setFollowUp(e.target.value)}>
            {FOLLOWUP_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>

        {followUp === 'custom' && (
          <TextField
            label="Follow-up date"
            type="date"
            fullWidth
            value={customDate}
            onChange={e => setCustomDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />
        )}

        <Divider sx={{ mb: 2 }}>
          <Box
            onClick={() => setShowExtra(s => !s)}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: 'text.secondary' }}
          >
            <Typography variant="caption">More details</Typography>
            {showExtra ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </Box>
        </Divider>

        <Collapse in={showExtra}>
          <TextField
            label="Outcomes & actions"
            multiline
            minRows={2}
            fullWidth
            value={outcomes}
            onChange={e => setOutcomes(e.target.value)}
            placeholder="Commitments made, follow-up actions..."
            sx={{ mb: 3 }}
          />
        </Collapse>

        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={submitting || !meetingDate || !sentiment}
          onClick={handleSubmit}
          sx={{ py: 1.75, fontSize: 16, fontWeight: 700, borderRadius: 3 }}
        >
          {submitting ? <CircularProgress size={22} color="inherit" /> : 'Log Meeting'}
        </Button>
      </Box>
    </AppShell>
  )
}
