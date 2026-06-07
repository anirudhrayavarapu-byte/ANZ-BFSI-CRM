import { Box, Typography } from '@mui/material'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import EditNoteIcon from '@mui/icons-material/EditNote'
import GroupsIcon from '@mui/icons-material/Groups'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const CARDS = [
  { key: 'clients', icon: PeopleAltIcon, label: 'My Clients', sub: 'client list', path: '/clients', color: '#e8eaf6', iconColor: '#3949ab', roles: ['team_member','manager','super_manager'] },
  { key: 'log', icon: EditNoteIcon, label: 'Log Meeting', sub: 'quick entry', path: '/log-meeting', color: '#e8f5e9', iconColor: '#2e7d32', roles: ['team_member','manager','super_manager'] },
  { key: 'team', icon: GroupsIcon, label: 'Team View', sub: 'manager only', path: '/team', color: '#fff3e0', iconColor: '#e65100', roles: ['manager','super_manager'] },
  { key: 'users', icon: ManageAccountsIcon, label: 'Manage Users', sub: 'roles & access', path: '/admin/users', color: '#f3e5f5', iconColor: '#6a1b9a', roles: ['manager','super_manager'] },
]

export default function ActionCards() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const role = profile?.role ?? 'team_member'
  const visible = CARDS.filter(c => c.roles.includes(role))

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mx: 2, mt: 2 }}>
      {visible.map(card => {
        const Icon = card.icon
        return (
          <Box
            key={card.key}
            onClick={() => navigate(card.path)}
            sx={{
              bgcolor: '#fff', borderRadius: 3, p: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              cursor: 'pointer', userSelect: 'none',
              '&:active': { transform: 'scale(0.97)', transition: 'transform 0.1s' },
              display: 'flex', flexDirection: 'column', gap: 0.5,
              minHeight: 80,
            }}
          >
            <Box sx={{ bgcolor: card.color, borderRadius: 2, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon sx={{ color: card.iconColor, fontSize: 22 }} />
            </Box>
            <Typography variant="body2" fontWeight={700} mt={0.5}>{card.label}</Typography>
            <Typography variant="caption" color="text.secondary">{card.sub}</Typography>
          </Box>
        )
      })}
    </Box>
  )
}
