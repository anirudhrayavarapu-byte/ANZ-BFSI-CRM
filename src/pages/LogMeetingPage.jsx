import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Typography, TextField, Button, CircularProgress, Alert, Collapse } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import AppShell from '../components/AppShell'
import SentimentPicker from '../components/meeting/SentimentPicker'
import TopicChips from '../components/meeting/TopicChips'
import { useMeetingStore } from '../store/meetingStore'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

const FOLLOWUP_OPTIONS = [
  { value: '1_week',    label: '1 week'   },
  { value: '1_month',   label: '1 month'  },
  { value: '1_quarter', label: '1 quarter'},
  { value: 'custom',    label: 'Custom'   },
]

function addDays(days) {
  const d = new Date(); d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function followUpDate(option, customDate) {
  if (option === '1_week')    return addDays(7)
  if (option === '1_month')   return addDays(30)
  if (option === '1_quarter') return addDays(91)
  return customDate ?? null
}

function Section({ label, children, noPad }) {
  return (
    <Box sx={{ px: noPad ? 0 : 2.5, py: 2, borderBottom: '1px solid var(--c-divider)' }}>
      {label && (
        <Typography sx={{
          fontSize: 11, fontWeight: 700, letterSpacing: '1px',
          textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.5,
        }}>
          {label}
        </Typography>
      )}
      {children}
    </Box>
  )
}

export default function LogMeetingPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const clientId  = params.get('clientId')
  const accountId = params.get('accountId')

  const { profile } = useAuthStore()
  const { logMeeting, submitting, error } = useMeetingStore()

  const [clientName, setClientName]   = useState('')
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0])
  const [sentiment, setSentiment]     = useState('neutral')
  const [followUp, setFollowUp]       = useState('1_month')
  const [customDate, setCustomDate]   = useState('')
  const [topics, setTopics]           = useState([])
  const [summary, setSummary]         = useState('')
  const [outcomes, setOutcomes]       = useState('')
  const [showExtra, setShowExtra]     = useState(false)

  useEffect(() => {
    if (!clientId) return
    supabase.from('clients').select('name').eq('id', clientId).single()
      .then(({ data }) => { if (data) setClientName(data.name) })
  }, [clientId])

  async function handleSubmit() {
    const { success } = await logMeeting({
      client_id:          clientId,
      account_id:         accountId || null,
      logged_by:          profile?.id,
      meeting_date:       meetingDate,
      topics_discussed:   JSON.stringify(topics),
      discussion_summary: summary  || null,
      outcomes:           outcomes || null,
      client_sentiment:   sentiment,
      next_followup:      followUp,
      next_followup_date: followUpDate(followUp, customDate),
    })
    if (success) navigate(-1)
  }

  return (
    <AppShell title="Log Meeting">
      <Box sx={{ bgcolor: 'var(--c-surface)', minHeight: '100%', pb: 12 }}>

        {/* Client context bar */}
        {clientName && (
          <Box sx={{ px: 2.5, py: 1.5, bgcolor: 'var(--c-hero)', borderBottom: '1px solid var(--c-hero-border)' }}>
            <Typography sx={{ fontSize: 12, color: 'var(--c-hero-muted)', fontWeight: 500 }}>
              Meeting with
            </Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'var(--c-hero-text)', letterSpacing: '-0.2px' }}>
              {clientName}
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ px: 2.5, pt: 2 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          </Box>
        )}

        {/* White form card */}
        <Box sx={{ bgcolor: 'var(--c-card)', mx: 0 }}>

          {/* Date */}
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid var(--c-divider)' }}>
            <Typography sx={{
              fontSize: 11, fontWeight: 700, letterSpacing: '1px',
              textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.5,
            }}>
              Meeting date
            </Typography>
            <TextField
              type="date"
              fullWidth
              value={meetingDate}
              onChange={e => setMeetingDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'var(--c-surface)',
                  fontFamily: "'Figtree', system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                },
                '& fieldset': { border: 'none' },
              }}
            />
          </Box>

          {/* Sentiment */}
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid var(--c-divider)' }}>
            <SentimentPicker value={sentiment} onChange={setSentiment} />
          </Box>

          {/* Topics */}
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid var(--c-divider)' }}>
            <TopicChips value={topics} onChange={setTopics} />
          </Box>

          {/* Summary */}
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid var(--c-divider)' }}>
            <Typography sx={{
              fontSize: 11, fontWeight: 700, letterSpacing: '1px',
              textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.5,
            }}>
              Discussion summary
            </Typography>
            <TextField
              multiline minRows={2} fullWidth
              placeholder="Key points from the meeting..."
              value={summary}
              onChange={e => setSummary(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'var(--c-surface)',
                  fontFamily: "'Figtree', system-ui, sans-serif",
                  fontSize: 14,
                },
                '& fieldset': { border: 'none' },
              }}
            />
          </Box>

          {/* Follow-up segmented control */}
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid var(--c-divider)' }}>
            <Typography sx={{
              fontSize: 11, fontWeight: 700, letterSpacing: '1px',
              textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.5,
            }}>
              Follow up in
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {FOLLOWUP_OPTIONS.map(o => {
                const active = followUp === o.value
                return (
                  <Box
                    key={o.value}
                    onClick={() => setFollowUp(o.value)}
                    sx={{
                      px: 1.75, py: 0.9,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      bgcolor: active ? 'var(--c-hero)' : 'var(--c-surface)',
                      border: '1px solid',
                      borderColor: active ? 'var(--c-hero)' : 'var(--c-border)',
                      transition: 'all 0.12s',
                      '&:active': { transform: 'scale(0.95)' },
                    }}
                  >
                    <Typography sx={{
                      fontSize: 13, fontWeight: active ? 700 : 500,
                      color: active ? 'var(--c-hero-text)' : 'var(--c-text)',
                      letterSpacing: '-0.1px',
                    }}>
                      {o.label}
                    </Typography>
                  </Box>
                )
              })}
            </Box>

            {followUp === 'custom' && (
              <TextField
                type="date"
                fullWidth
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  mt: 1.5,
                  '& .MuiOutlinedInput-root': { bgcolor: 'var(--c-surface)', fontWeight: 600 },
                  '& fieldset': { border: 'none' },
                }}
              />
            )}
          </Box>

          {/* Expandable: outcomes */}
          <Box
            onClick={() => setShowExtra(s => !s)}
            sx={{
              px: 2.5, py: 1.75,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', borderBottom: showExtra ? '1px solid var(--c-divider)' : 'none',
              '&:active': { bgcolor: 'var(--c-surface)' },
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-2)' }}>
              Add outcomes & actions
            </Typography>
            {showExtra
              ? <ExpandLessIcon sx={{ fontSize: 18, color: 'var(--c-text-3)' }} />
              : <ExpandMoreIcon sx={{ fontSize: 18, color: 'var(--c-text-3)' }} />}
          </Box>
          <Collapse in={showExtra}>
            <Box sx={{ px: 2.5, py: 2 }}>
              <TextField
                multiline minRows={2} fullWidth
                placeholder="Commitments made, next steps..."
                value={outcomes}
                onChange={e => setOutcomes(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': { bgcolor: 'var(--c-surface)', fontSize: 14 },
                  '& fieldset': { border: 'none' },
                }}
              />
            </Box>
          </Collapse>
        </Box>
      </Box>

      {/* Fixed bottom button */}
      <Box sx={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        px: 2.5,
        pt: 1.5,
        pb: 'calc(var(--safe-bottom) + 16px)',
        bgcolor: 'var(--c-card)',
        borderTop: '1px solid var(--c-divider)',
      }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={submitting || !meetingDate}
          onClick={handleSubmit}
          sx={{
            py: 1.7,
            fontSize: 15,
            fontWeight: 800,
            borderRadius: '14px',
            bgcolor: 'var(--c-hero)',
            color: 'var(--c-hero-text)',
            letterSpacing: '-0.2px',
            boxShadow: 'none',
            '&:hover': { bgcolor: 'var(--c-hero-raised)', boxShadow: 'none' },
            '&.Mui-disabled': { bgcolor: 'var(--c-border)', color: 'var(--c-text-3)' },
          }}
        >
          {submitting ? <CircularProgress size={20} sx={{ color: 'var(--c-hero-muted)' }} /> : 'Log Meeting'}
        </Button>
      </Box>
    </AppShell>
  )
}
