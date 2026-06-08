import { Box, Typography } from '@mui/material'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import EditNoteIcon from '@mui/icons-material/EditNote'
import GroupsIcon from '@mui/icons-material/Groups'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import BusinessIcon from '@mui/icons-material/Business'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const CARDS = [
  { key: 'clients',  icon: PeopleAltIcon,      label: 'My Clients',    sub: 'View & manage',     path: '/clients',      roles: ['team_member','manager','super_manager'] },
  { key: 'accounts', icon: BusinessIcon,        label: 'Accounts',      sub: 'Client mapping',    path: '/accounts',     roles: ['team_member','manager','super_manager'] },
  { key: 'log',      icon: EditNoteIcon,        label: 'Log Meeting',   sub: 'Quick entry',        path: '/log-meeting',  roles: ['team_member','manager','super_manager'] },
  { key: 'team',     icon: GroupsIcon,          label: 'Team View',     sub: 'Coverage & cadence', path: '/team',         roles: ['manager','super_manager'] },
  { key: 'users',    icon: ManageAccountsIcon,  label: 'Manage Users',  sub: 'Roles & access',     path: '/admin/users',  roles: ['manager','super_manager'] },
]

export default function ActionCards() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const role = profile?.role ?? 'team_member'
  const visible = CARDS.filter(c => c.roles.includes(role))

  return (
    <Box sx={{ px: 2.5, mt: 2.5 }}>
      <Typography sx={{
        fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
        textTransform: 'uppercase', color: 'var(--c-text-2)',
        mb: 1.5,
      }}>
        Quick actions
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        {visible.map(card => {
          const Icon = card.icon
          return (
            <Box
              key={card.key}
              onClick={() => navigate(card.path)}
              sx={{
                bgcolor: 'var(--c-hero)',
                borderRadius: '18px',
                p: 2.25,
                cursor: 'pointer',
                userSelect: 'none',
                minHeight: 118,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--c-hero-border)',
                transition: 'opacity 0.12s, transform 0.12s',
                '&:active': { opacity: 0.85, transform: 'scale(0.975)' },
              }}
            >
              {/* Watermark icon — large, muted, top-right */}
              <Box sx={{
                position: 'absolute', top: -4, right: -4,
                opacity: 0.06, color: 'var(--c-hero-text)',
                pointerEvents: 'none',
              }}>
                <Icon sx={{ fontSize: 72 }} />
              </Box>

              {/* Small icon badge */}
              <Box sx={{
                width: 36, height: 36,
                borderRadius: '10px',
                bgcolor: 'oklch(100% 0 0 / 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon sx={{ color: 'var(--c-hero-text)', fontSize: 19 }} />
              </Box>

              {/* Label */}
              <Box>
                <Typography sx={{
                  color: 'var(--c-hero-text)',
                  fontWeight: 800,
                  fontSize: 14,
                  letterSpacing: '-0.3px',
                  lineHeight: 1.2,
                }}>
                  {card.label}
                </Typography>
                <Typography sx={{
                  color: 'var(--c-hero-muted)',
                  fontSize: 11,
                  fontWeight: 500,
                  mt: 0.25,
                }}>
                  {card.sub}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
