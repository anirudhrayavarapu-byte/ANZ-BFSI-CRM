import { Box, Typography, Chip, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/followUpStatus'

export default function FollowUpsList({ followUps, loading }) {
  const navigate = useNavigate()
  if (loading) return <Box sx={{ py: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
  if (!followUps.length) return null

  return (
    <Box sx={{ mx: 2, mt: 2 }}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
        Follow-ups due
      </Typography>
      <Box sx={{ mt: 1, borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
        {followUps.map((f, i) => (
          <Box
            key={f.id}
            onClick={() => navigate(`/clients/${f.client_id}`)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: 2, py: 1.5,
              borderBottom: i < followUps.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              cursor: 'pointer',
              '&:active': { bgcolor: 'action.selected' },
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600}>{f.clients?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{f.clients?.accounts?.name}</Typography>
            </Box>
            <Chip
              label={STATUS_LABELS[f.status]}
              size="small"
              sx={{
                bgcolor: STATUS_COLORS[f.status] + '20',
                color: STATUS_COLORS[f.status],
                fontWeight: 700, fontSize: 11, height: 24,
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  )
}
