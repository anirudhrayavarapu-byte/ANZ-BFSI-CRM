import { Box, Typography, Chip } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/followUpStatus'
import { formatRelative } from '../../utils/dateFormat'

export default function ClientListItem({ client, onClick }) {
  const status = client.followUpStatus
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2, py: 1.75,
        borderBottom: '1px solid', borderColor: 'divider',
        cursor: 'pointer', bgcolor: '#fff',
        '&:active': { bgcolor: 'action.selected' },
        minHeight: 64,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap>{client.name}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {client.title} · {client.accounts?.name}
        </Typography>
        {client.lastMeetingDate && (
          <Typography variant="caption" display="block" color="text.secondary">
            Last met {formatRelative(client.lastMeetingDate)}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1, flexShrink: 0 }}>
        {status && status !== 'none' && status !== 'future' && (
          <Chip
            label={STATUS_LABELS[status]}
            size="small"
            sx={{
              bgcolor: STATUS_COLORS[status] + '20',
              color: STATUS_COLORS[status],
              fontWeight: 700, fontSize: 10, height: 22,
            }}
          />
        )}
        <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
      </Box>
    </Box>
  )
}
