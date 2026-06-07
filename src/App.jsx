import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ClientListPage from './pages/ClientListPage'
import ClientCardPage from './pages/ClientCardPage'
import LogMeetingPage from './pages/LogMeetingPage'
import TeamViewPage from './pages/TeamViewPage'
import UserManagementPage from './pages/UserManagementPage'

const theme = createTheme({
  palette: {
    primary: { main: '#1a237e', light: '#534bae', dark: '#000051' },
    secondary: { main: '#0288d1' },
    background: { default: '#f0f2f8', paper: '#ffffff' },
    success: { main: '#2e7d32' },
    error: { main: '#c62828' },
    warning: { main: '#e65100' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h6: { fontWeight: 700, letterSpacing: '-0.3px' },
    body2: { lineHeight: 1.55 },
    caption: { lineHeight: 1.4 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '0 3px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
    '0 6px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
    '0 10px 24px rgba(0,0,0,0.12)',
    ...Array(20).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 12, minHeight: 46, fontWeight: 600, letterSpacing: '0.1px' },
        contained: { boxShadow: '0 2px 8px rgba(26,35,126,0.3)', '&:hover': { boxShadow: '0 4px 12px rgba(26,35,126,0.4)' } },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', minHeight: 46, fontWeight: 600, fontSize: 14 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
        sizeSmall: { height: 22, fontSize: 11 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 12 } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: { boxShadow: '0 4px 16px rgba(26,35,126,0.35)' },
      },
    },
  },
})

export default function App() {
  const { setUser, setLoading, fetchProfile } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientListPage /></ProtectedRoute>} />
          <Route path="/clients/:id" element={<ProtectedRoute><ClientCardPage /></ProtectedRoute>} />
          <Route path="/log-meeting" element={<ProtectedRoute><LogMeetingPage /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute allowedRoles={['manager','super_manager']}><TeamViewPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['manager','super_manager']}><UserManagementPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
