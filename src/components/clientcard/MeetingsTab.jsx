import { useState } from 'react'
import { Box, Typography, Chip, Fab, Collapse, CircularProgress } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useNavigate } from 'react-router-dom'
import { useMeetings } from '../../hooks/useMeetings'
import { formatRelative, formatDate } from '../../utils/dateFormat'
import { STATUS_LABELS, STATUS_COLORS, getFollowUpStatus } from '../../utils/followUpStatus'

const SENTIMENT_EMOJI = {
  very_negative: '😞', negative: '🙁', neutral: '😐', positive: '😊', very_positive: '🤩'
}

function MeetingRow({ meeting }) {
  const [open, setOpen] = useState(false)
  const status = getFollowUpStatus(meeting.next_followup_date)
  let topics = []
  try { topics = JSON.parse(meeting.topics_discussed ?? '[]') } catch {}

  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, cursor: 'pointer' }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={600}>{formatRelative(meeting.meeting_date)}</Typography>
            <Typography variant="body2">{SENTIMENT_EMOJI[meeting.client_sentiment] ?? ''}</Typography>
          </Box>
          {topics.length > 0 && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {topics.join(' · ')}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {meeting.next_followup_date && (
            <Chip
              label={STATUS_LABELS[status]}
              size="small"
              sx={{ bgcolor: STATUS_COLORS[status] + '20', color: STATUS_COLORS[status], fontWeight: 700, fontSize: 10, height: 22 }}
            />
          )}
          {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </Box>
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 2, pb: 2, bgcolor: '#fafafa' }}>
          {meeting.discussion_summary && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">DISCUSSION</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{meeting.discussion_summary}</Typography>
            </Box>
          )}
          {meeting.outcomes && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">OUTCOMES</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{meeting.outcomes}</Typography>
            </Box>
          )}
          {meeting.next_followup_date && (
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary">FOLLOW-UP</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{formatDate(meeting.next_followup_date)}</Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

export default function MeetingsTab({ clientId, accountId }) {
  const navigate = useNavigate()
  const { meetings, loading } = useMeetings(clientId)

  return (
    <Box>
      {loading ? (
        <Box sx={{ pt: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
      ) : meetings.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No meetings logged yet</Typography>
        </Box>
      ) : (
        meetings.map(m => <MeetingRow key={m.id} meeting={m} />)
      )}
      <Fab
        color="primary"
        size="medium"
        aria-label="Log meeting"
        sx={{ position: 'fixed', bottom: 'calc(var(--safe-bottom) + 16px)', right: 16 }}
        onClick={() => navigate(`/log-meeting?clientId=${clientId}&accountId=${accountId ?? ''}`)}
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}
