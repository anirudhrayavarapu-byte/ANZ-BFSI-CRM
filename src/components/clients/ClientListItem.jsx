import { Box, Typography, Chip, Avatar } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/followUpStatus'
import { formatRelative } from '../../utils/dateFormat'

const AVATAR_PALETTE = [
  'oklch(36% 0.19 262)',  /* brand navy  */
  'oklch(32% 0.17 285)',  /* indigo      */
  'oklch(38% 0.15 155)',  /* forest      */
  'oklch(34% 0.18 310)',  /* plum        */
  'oklch(37% 0.17  27)',  /* mahogany    */
  'oklch(33% 0.13 200)',  /* teal        */
]

function avatarBg(name) {
  if (!name) return AVATAR_PALETTE[0]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[h]
}

function initials(name) {
  if (!name) return '?'
  const p = name.trim().split(/\s+/)
  return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

export default function ClientListItem({ client, onClick }) {
  const status = client.followUpStatus
  const urgent = status === 'overdue' || status === 'today'

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 2.5, py: 1.5,
        borderBottom: '1px solid var(--c-divider)',
        bgcolor: 'var(--c-card)',
        cursor: 'pointer',
        minHeight: 70,
        transition: 'background 0.1s',
        '&:active': { bgcolor: 'var(--c-surface)' },
      }}
    >
      <Avatar sx={{
        width: 44, height: 44,
        bgcolor: avatarBg(client.name),
        fontSize: 14, fontWeight: 800,
        flexShrink: 0,
        borderRadius: '13px',
      }}>
        {initials(client.name)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontWeight: urgent ? 700 : 600,
          fontSize: 14.5,
          letterSpacing: '-0.2px',
          color: 'var(--c-text)',
          lineHeight: 1.3,
        }} noWrap>
          {client.name}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: 'var(--c-text-2)', mt: 0.2 }} noWrap>
          {client.title} · {client.accounts?.name}
        </Typography>
        {client.lastMeetingDate && (
          <Typography sx={{ fontSize: 11.5, color: 'var(--c-text-3)', mt: 0.1 }}>
            Last met {formatRelative(client.lastMeetingDate)}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        {status && status !== 'none' && status !== 'future' && (
          <Chip
            label={STATUS_LABELS[status]}
            size="small"
            sx={{
              bgcolor: `${STATUS_COLORS[status]}16`,
              color: STATUS_COLORS[status],
              fontWeight: 700,
              fontSize: 10,
              height: 22,
            }}
          />
        )}
        <ChevronRightIcon sx={{ color: 'var(--c-text-3)', fontSize: 18 }} />
      </Box>
    </Box>
  )
}
