import { Box, Typography, Chip, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/followUpStatus'

const STATUS_VARS = {
  overdue:  { dot: 'var(--c-overdue)',  bg: 'var(--c-overdue-bg)'  },
  today:    { dot: 'var(--c-today)',    bg: 'var(--c-today-bg)'    },
  upcoming: { dot: 'var(--c-upcoming)', bg: 'var(--c-upcoming-bg)' },
  future:   { dot: 'var(--c-ontrack)',  bg: 'transparent'          },
  none:     { dot: 'var(--c-text-3)',   bg: 'transparent'          },
}

export default function FollowUpsList({ followUps, loading }) {
  const navigate = useNavigate()

  if (loading) return (
    <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress size={20} sx={{ color: 'var(--c-text-3)' }} />
    </Box>
  )
  if (!followUps.length) return null

  const overdue = followUps.filter(f => f.status === 'overdue').length

  return (
    <Box sx={{ px: 2.5, pt: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{
          fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
          textTransform: 'uppercase', color: 'var(--c-text-2)',
        }}>
          Follow-ups
        </Typography>
        {overdue > 0 && (
          <Typography sx={{
            fontSize: 11, fontWeight: 700, color: 'var(--c-overdue)',
            letterSpacing: '0.2px',
          }}>
            {overdue} overdue
          </Typography>
        )}
      </Box>

      <Box sx={{
        bgcolor: 'var(--c-card)',
        borderRadius: '16px',
        border: '1px solid var(--c-divider)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}>
        {followUps.map((f, i) => {
          const sv = STATUS_VARS[f.status] ?? STATUS_VARS.none
          return (
            <Box
              key={f.id}
              onClick={() => navigate(`/clients/${f.client_id}`)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.75,
                px: 2,
                py: 1.5,
                bgcolor: sv.bg,
                borderBottom: i < followUps.length - 1 ? '1px solid var(--c-divider)' : 'none',
                cursor: 'pointer',
                transition: 'background 0.1s',
                '&:active': { bgcolor: 'var(--c-surface)' },
              }}
            >
              {/* Status dot — replaces border-left */}
              <Box sx={{
                width: 7, height: 7,
                borderRadius: '50%',
                bgcolor: sv.dot,
                flexShrink: 0,
                mt: '1px',
              }} />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                  fontWeight: f.status === 'overdue' || f.status === 'today' ? 700 : 600,
                  fontSize: 14,
                  letterSpacing: '-0.1px',
                  color: 'var(--c-text)',
                  lineHeight: 1.3,
                }}>
                  {f.clients?.name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'var(--c-text-2)', mt: 0.15 }}>
                  {f.clients?.accounts?.name}
                </Typography>
              </Box>

              <Chip
                label={STATUS_LABELS[f.status]}
                size="small"
                sx={{
                  bgcolor: `${STATUS_COLORS[f.status]}18`,
                  color: STATUS_COLORS[f.status],
                  fontWeight: 700,
                  fontSize: 10,
                  height: 22,
                  flexShrink: 0,
                }}
              />
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
