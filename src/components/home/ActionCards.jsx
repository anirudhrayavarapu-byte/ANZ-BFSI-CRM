import { Box, Typography } from '@mui/material'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import EditNoteIcon from '@mui/icons-material/EditNote'
import GroupsIcon from '@mui/icons-material/Groups'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const CARDS = [
  {
    key: 'clients', icon: PeopleAltIcon, label: 'My Clients', sub: 'View & manage',
    path: '/clients',
    gradient: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
    iconBg: 'rgba(255,255,255,0.15)',
    roles: ['team_member', 'manager', 'super_manager'],
  },
  {
    key: 'log', icon: EditNoteIcon, label: 'Log Meeting', sub: 'Quick entry',
    path: '/log-meeting',
    gradient: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
    iconBg: 'rgba(255,255,255,0.15)',
    roles: ['team_member', 'manager', 'super_manager'],
  },
  {
    key: 'team', icon: GroupsIcon, label: 'Team View', sub: 'Coverage & cadence',
    path: '/team',
    gradient: 'linear-gradient(135deg, #bf360c 0%, #e64a19 100%)',
    iconBg: 'rgba(255,255,255,0.15)',
    roles: ['manager', 'super_manager'],
  },
  {
    key: 'users', icon: ManageAccountsIcon, label: 'Manage Users', sub: 'Roles & access',
    path: '/admin/users',
    gradient: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',
    iconBg: 'rgba(255,255,255,0.15)',
    roles: ['manager', 'super_manager'],
  },
]

export default function ActionCards() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const role = profile?.role ?? 'team_member'
  const visible = CARDS.filter(c => c.roles.includes(role))

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mx: 2, mt: 2 }}>
      {visible.map(card => {
        const Icon = card.icon
        return (
          <Box
            key={card.key}
            onClick={() => navigate(card.path)}
            sx={{
              background: card.gradient,
              borderRadius: '20px',
              p: 2.5,
              cursor: 'pointer',
              userSelect: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 110,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s, box-shadow 0.15s',
              '&:active': { transform: 'scale(0.96)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -20, right: -20,
                width: 80, height: 80,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -30, right: 10,
                width: 100, height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            <Box sx={{
              width: 40, height: 40, borderRadius: '12px',
              bgcolor: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}>
              <Icon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box sx={{ zIndex: 1 }}>
              <Typography variant="body2" fontWeight={800} sx={{ color: '#fff', fontSize: 14, letterSpacing: '-0.2px' }}>
                {card.label}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                {card.sub}
              </Typography>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
