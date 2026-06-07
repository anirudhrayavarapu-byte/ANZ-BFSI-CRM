import { Box, Typography, CircularProgress } from '@mui/material'
import AppShell from '../components/AppShell'
import TeamMemberCard from '../components/team/TeamMemberCard'
import { useTeam } from '../hooks/useTeam'

export default function TeamViewPage() {
  const { members, loading } = useTeam()

  const totalClients = members.reduce((s, m) => s + m.clients.length, 0)
  const totalOverdue = members.reduce((s, m) => s + m.overdue, 0)

  return (
    <AppShell title="Team View">
      <Box sx={{ px: 2, pt: 2, pb: 4 }}>
        {loading ? (
          <Box sx={{ pt: 4, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <>
            <Box sx={{ mb: 2.5, p: 2, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight={800} color="primary.main">{members.length}</Typography>
                <Typography variant="caption" color="text.secondary">Team members</Typography>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800}>{totalClients}</Typography>
                <Typography variant="caption" color="text.secondary">Total clients</Typography>
              </Box>
              {totalOverdue > 0 && (
                <Box>
                  <Typography variant="h5" fontWeight={800} color="error.main">{totalOverdue}</Typography>
                  <Typography variant="caption" color="text.secondary">Overdue</Typography>
                </Box>
              )}
            </Box>

            {members.length === 0 ? (
              <Box sx={{ textAlign: 'center', pt: 4 }}>
                <Typography color="text.secondary">No team members found</Typography>
              </Box>
            ) : (
              members.map(m => <TeamMemberCard key={m.id} member={m} />)
            )}
          </>
        )}
      </Box>
    </AppShell>
  )
}
