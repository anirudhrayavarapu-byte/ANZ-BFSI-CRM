import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, CircularProgress, TextField, Button, Divider, Collapse } from '@mui/material'
import EditNoteIcon from '@mui/icons-material/EditNote'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import AppShell from '../components/AppShell'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { formatDate, formatRelative } from '../utils/dateFormat'

function MeetingRow({ meeting }) {
  const [open, setOpen] = useState(false)
  return (
    <Box sx={{ borderBottom: '1px solid var(--c-divider)' }}>
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2.5, py: 1.5, cursor: 'pointer',
          '&:active': { bgcolor: 'var(--c-surface)' },
        }}
      >
        <Box>
          <Typography fontWeight={600} fontSize={14}>{formatRelative(meeting.meeting_date)}</Typography>
          {meeting.notes && !open && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{
              display: 'block', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {meeting.notes}
            </Typography>
          )}
        </Box>
        {open
          ? <ExpandLessIcon sx={{ fontSize: 18, color: 'var(--c-text-3)' }} />
          : <ExpandMoreIcon sx={{ fontSize: 18, color: 'var(--c-text-3)' }} />}
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 2.5, pb: 2, bgcolor: 'var(--c-surface)' }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Notes
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
            {meeting.notes || <em style={{ color: 'var(--c-text-3)' }}>No notes recorded</em>}
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--c-text-3)', display: 'block', mt: 1 }}>
            {formatDate(meeting.meeting_date)}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  )
}

export default function PartnerContactPage() {
  const { orgId, contactId } = useParams()
  const { profile } = useAuthStore()

  const [contact, setContact] = useState(null)
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  const [logging, setLogging] = useState(false)
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const loadMeetings = useCallback(async () => {
    const { data } = await supabase.from('partner_meetings')
      .select('id, meeting_date, notes')
      .eq('partner_contact_id', contactId)
      .order('meeting_date', { ascending: false })
    setMeetings(data ?? [])
  }, [contactId])

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('partner_contacts')
        .select('id, name, title, email, phone')
        .eq('id', contactId).single()
      setContact(c)
      await loadMeetings()
      setLoading(false)
    }
    load()
  }, [contactId, loadMeetings])

  async function handleLog() {
    if (!meetingDate) return
    setSaving(true)
    await supabase.from('partner_meetings').insert({
      partner_contact_id: contactId,
      partner_org_id: orgId,
      logged_by: profile?.id,
      meeting_date: meetingDate,
      notes: notes.trim() || null,
    })
    setNotes('')
    setMeetingDate(new Date().toISOString().split('T')[0])
    setLogging(false)
    setSaving(false)
    await loadMeetings()
  }

  if (loading) return (
    <AppShell title="">
      <Box sx={{ pt: 8, textAlign: 'center' }}><CircularProgress /></Box>
    </AppShell>
  )

  return (
    <AppShell title={contact?.name ?? 'Contact'}>
      <Box sx={{ pb: 10 }}>

        {/* Contact info */}
        <Box sx={{ bgcolor: 'var(--c-card)', px: 2.5, py: 2.5, borderBottom: '1px solid var(--c-divider)' }}>
          {contact?.title && (
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 0.25 }}>
              {contact.title}
            </Typography>
          )}
          {contact?.email && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {contact.email}
            </Typography>
          )}
          {contact?.phone && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {contact.phone}
            </Typography>
          )}
        </Box>

        {/* Log meeting toggle */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: logging ? 0 : 2.5 }}>
          {!logging ? (
            <Button
              startIcon={<EditNoteIcon />}
              onClick={() => setLogging(true)}
              sx={{
                bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)',
                borderRadius: '12px', fontWeight: 700, px: 2.5, py: 1.25,
                '&:hover': { bgcolor: 'var(--c-hero-raised)' },
              }}
            >
              Log Meeting
            </Button>
          ) : (
            <Box sx={{ bgcolor: 'var(--c-card)', borderRadius: '16px', p: 2.5, border: '1px solid var(--c-divider)', mb: 2.5 }}>
              <Typography sx={{
                fontSize: 11, fontWeight: 700, letterSpacing: '1px',
                textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.5,
              }}>
                New Meeting
              </Typography>
              <TextField
                type="date"
                fullWidth
                value={meetingDate}
                onChange={e => setMeetingDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': { bgcolor: 'var(--c-surface)', fontWeight: 600 },
                  '& fieldset': { border: 'none' },
                }}
              />
              <TextField
                multiline minRows={3} fullWidth
                placeholder="What was discussed? Key takeaways, actions..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': { bgcolor: 'var(--c-surface)', fontSize: 14 },
                  '& fieldset': { border: 'none' },
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  disabled={saving || !meetingDate}
                  onClick={handleLog}
                  sx={{
                    bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)', borderRadius: '12px',
                    fontWeight: 700, py: 1.25, '&:hover': { bgcolor: 'var(--c-hero-raised)' },
                    '&.Mui-disabled': { bgcolor: 'var(--c-border)', color: 'var(--c-text-3)' },
                  }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={() => { setLogging(false); setNotes('') }}
                  sx={{ borderRadius: '12px', color: 'var(--c-text-2)', fontWeight: 600, px: 2 }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* Meeting history */}
        <Divider sx={{ mx: 2.5, mb: 0 }} />
        <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
          <Typography sx={{
            fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
            textTransform: 'uppercase', color: 'var(--c-text-2)',
          }}>
            Meeting history ({meetings.length})
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'var(--c-card)', border: '1px solid var(--c-divider)', mx: 2.5, borderRadius: '16px', overflow: 'hidden' }}>
          {meetings.length === 0 ? (
            <Box sx={{ px: 2.5, py: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontStyle="italic">
                No meetings logged yet
              </Typography>
            </Box>
          ) : (
            meetings.map(m => <MeetingRow key={m.id} meeting={m} />)
          )}
        </Box>
      </Box>
    </AppShell>
  )
}
