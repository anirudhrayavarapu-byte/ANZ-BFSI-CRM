import { Box, Typography, Chip, CircularProgress, Avatar } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/followUpStatus'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

export default function FollowUpsList({ followUps, loading }) {
  const navigate = useNavigate()
  if (loading) return <Box sx={{ py: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
  if (!followUps.length) return null

  return (
    <Box sx={{ mx: 2, mt: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          Follow-ups due
        </Typography>
        <Chip label={followUps.length} size="small" color="error" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
      </Box>
      <Box sx={{ borderRadius: '16px', overflow: 'hidden', bgcolor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        {followUps.map((f, i) => (
          <Box
            key={f.id}
            onClick={() => navigate(`/clients/${f.client_id}`)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 2, py: 1.5,
              borderBottom: i < followUps.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              cursor: 'pointer',
              borderLeft: `3px solid ${STATUS_COLORS[f.status]}`,
              '&:active': { bgcolor: '#f5f7ff' },
              transition: 'background 0.1s',
            }}
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: STATUS_COLORS[f.status] + '22', color: STATUS_COLORS[f.status], fontWeight: 700, fontSize: 13 }}>
              {getInitials(f.clients?.name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>{f.clients?.name}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{f.clients?.accounts?.name}</Typography>
            </Box>
            <Chip
              label={STATUS_LABELS[f.status]}
              size="small"
              sx={{ bgcolor: STATUS_COLORS[f.status] + '18', color: STATUS_COLORS[f.status], fontWeight: 700, fontSize: 10, height: 22, flexShrink: 0 }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  )
}
