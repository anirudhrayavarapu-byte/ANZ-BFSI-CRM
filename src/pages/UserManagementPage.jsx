import { Box, Typography, Chip, Switch, Select, MenuItem, CircularProgress, Divider, Alert } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import AppShell from '../components/AppShell'
import { useUsers } from '../hooks/useUsers'
import { useAuthStore } from '../store/authStore'

const ROLE_LABELS = { team_member: 'Team Member', manager: 'Manager', super_manager: 'Super Manager' }
const ROLE_COLORS = { team_member: '#e3f2fd', manager: '#e8f5e9', super_manager: '#fce4ec' }
const ROLE_TEXT = { team_member: '#1565c0', manager: '#2e7d32', super_manager: '#880e4f' }

function UserRow({ user, allUsers, onUpdate, isSuperManager }) {
  const managers = allUsers.filter(u => u.role === 'manager' || u.role === 'super_manager')

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 2, mb: 1.5, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <PersonIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} variant="body2" noWrap>{user.username}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{user.email}</Typography>
        </Box>
        <Switch
          size="small"
          checked={user.is_active}
          onChange={e => onUpdate(user.id, { is_active: e.target.checked })}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 120 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Role</Typography>
          {isSuperManager ? (
            <Select
              value={user.role}
              onChange={e => onUpdate(user.id, { role: e.target.value })}
              size="small" fullWidth sx={{ mt: 0.5 }}
            >
              <MenuItem value="team_member">Team Member</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="super_manager">Super Manager</MenuItem>
            </Select>
          ) : (
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={ROLE_LABELS[user.role]}
                size="small"
                sx={{ bgcolor: ROLE_COLORS[user.role], color: ROLE_TEXT[user.role], fontWeight: 700 }}
              />
            </Box>
          )}
        </Box>

        {isSuperManager && (
          <Box sx={{ flex: 1, minWidth: 120 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Reports to</Typography>
            <Select
              value={user.manager_id ?? ''}
              onChange={e => onUpdate(user.id, { manager_id: e.target.value || null })}
              size="small" fullWidth sx={{ mt: 0.5 }}
              displayEmpty
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {managers.filter(m => m.id !== user.id).map(m => (
                <MenuItem key={m.id} value={m.id}>{m.username}</MenuItem>
              ))}
            </Select>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default function UserManagementPage() {
  const { profile } = useAuthStore()
  const { users, loading, updateUser } = useUsers()
  const isSuperManager = profile?.role === 'super_manager'

  const active = users.filter(u => u.is_active)
  const inactive = users.filter(u => !u.is_active)

  return (
    <AppShell title="Manage Users">
      <Box sx={{ px: 2, pt: 2, pb: 6 }}>
        <Alert severity="info" sx={{ mb: 2, fontSize: 13 }}>
          To invite new users, go to your <strong>Supabase Dashboard → Authentication → Users → Invite</strong>. Once they sign up, set their role here.
        </Alert>

        <Box sx={{ display: 'flex', gap: 3, mb: 2.5, p: 2, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="primary.main">{active.length}</Typography>
            <Typography variant="caption" color="text.secondary">Active</Typography>
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>{users.length}</Typography>
            <Typography variant="caption" color="text.secondary">Total users</Typography>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', pt: 4 }}><CircularProgress /></Box>
        ) : (
          <>
            {active.map(u => (
              <UserRow key={u.id} user={u} allUsers={users} onUpdate={updateUser} isSuperManager={isSuperManager} />
            ))}

            {inactive.length > 0 && (
              <>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" color="text.secondary">Inactive</Typography>
                </Divider>
                {inactive.map(u => (
                  <UserRow key={u.id} user={u} allUsers={users} onUpdate={updateUser} isSuperManager={isSuperManager} />
                ))}
              </>
            )}
          </>
        )}
      </Box>
    </AppShell>
  )
}
