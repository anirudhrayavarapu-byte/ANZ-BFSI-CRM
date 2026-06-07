import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { CircularProgress, Box } from '@mui/material'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuthStore()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
