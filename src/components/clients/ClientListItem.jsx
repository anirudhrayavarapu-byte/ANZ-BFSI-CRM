import { Box, Typography, Chip, Avatar } from '@mui/material'
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/followUpStatus'
import { formatRelative } from '../../utils/dateFormat'

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

export default function ClientListItem({ client, onClick }) {
  const status = client.followUpStatus
  const showStatus = status && status !== 'none' && status !== 'future'

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 2, py: 1.5,
        borderBottom: '1px solid', borderColor: '#f0f2f8',
        cursor: 'pointer', bgcolor: '#fff',
        '&:active': { bgcolor: '#f5f7ff' },
        transition: 'background 0.1s',
        minHeight: 68,
      }}
    >
      <Avatar sx={{ width: 44, height: 44, bgcolor: avatarColor(client.name), fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
        {getInitials(client.name)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap sx={{ letterSpacing: '-0.1px' }}>{client.name}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
          {client.title} · {client.accounts?.name}
        </Typography>
        {client.lastMeetingDate && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
            Last met {formatRelative(client.lastMeetingDate)}
          </Typography>
        )}
      </Box>
      {showStatus && (
        <Chip
          label={STATUS_LABELS[status]}
          size="small"
          sx={{ bgcolor: STATUS_COLORS[status] + '18', color: STATUS_COLORS[status], fontWeight: 700, fontSize: 10, height: 22, flexShrink: 0 }}
        />
      )}
    </Box>
  )
}
