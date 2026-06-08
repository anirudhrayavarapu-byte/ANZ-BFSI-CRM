import { useLocation, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { CircularProgress, Box } from '@mui/material'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuthStore()
  const { pathname } = useLocation()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // New team members without a manager assigned → onboarding
  if (
    profile?.role === 'team_member' &&
    !profile?.manager_id &&
    pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
