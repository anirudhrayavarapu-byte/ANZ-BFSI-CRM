import { Typography, Box } from '@mui/material'
import { useAuthStore } from '../store/authStore'

export default function DashboardPage() {
  const { profile } = useAuthStore()

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={600}>
        Welcome, {profile?.username ?? 'there'}
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={1}>
        Role: {profile?.role}
      </Typography>
    </Box>
  )
}
