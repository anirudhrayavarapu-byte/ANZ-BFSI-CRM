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
import AddClientPage from './pages/AddClientPage'
import OnboardingPage from './pages/OnboardingPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AccountListPage from './pages/AccountListPage'
import AccountDetailPage from './pages/AccountDetailPage'

const shadow1 = '0 1px 2px oklch(12% 0.030 262 / 0.05), 0 2px 8px oklch(12% 0.030 262 / 0.06)'
const shadow2 = '0 4px 16px oklch(12% 0.030 262 / 0.10), 0 1px 4px oklch(12% 0.030 262 / 0.06)'
const shadow3 = '0 8px 32px oklch(12% 0.030 262 / 0.14)'

const theme = createTheme({
  palette: {
    primary:    { main: '#1a237e', light: '#534bae', dark: '#000051' },
    secondary:  { main: '#0288d1' },
    background: { default: '#f3f4f8', paper: '#ffffff' },
    text:       { primary: '#191c2a', secondary: '#666d8a', disabled: '#9ba0b4' },
    success:    { main: '#2e7d32' },
    error:      { main: '#c62828' },
    warning:    { main: '#e65100' },
    divider:    '#eeeef4',
  },
  typography: {
    fontFamily: "'Figtree', system-ui, sans-serif",
    h4: { fontWeight: 800, letterSpacing: '-0.6px' },
    h5: { fontWeight: 800, letterSpacing: '-0.5px' },
    h6: { fontWeight: 700, letterSpacing: '-0.3px' },
    subtitle1: { fontWeight: 600, letterSpacing: '-0.1px' },
    subtitle2: { fontWeight: 600 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.55 },
    caption: { lineHeight: 1.4, letterSpacing: '0.1px' },
    overline: { fontWeight: 700, letterSpacing: '1px', fontSize: 11 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.1px' },
  },
  shape: { borderRadius: 14 },
  shadows: ['none', shadow1, shadow2, shadow3, shadow3, ...Array(20).fill(shadow3)],
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, minHeight: 46, fontWeight: 700 },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: shadow1 } },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', minHeight: 46, fontWeight: 600, fontSize: 14, letterSpacing: '-0.1px' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700, borderRadius: 8, fontFamily: "'Figtree', system-ui, sans-serif" },
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
      styleOverrides: { root: { borderRadius: 18, boxShadow: shadow1 } },
    },
    MuiFab: {
      styleOverrides: { root: { boxShadow: shadow2 } },
    },
    MuiAvatar: {
      styleOverrides: { root: { fontFamily: "'Figtree', system-ui, sans-serif", fontWeight: 700 } },
    },
    MuiCssBaseline: {
      styleOverrides: { body: { fontFamily: "'Figtree', system-ui, sans-serif" } },
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
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientListPage /></ProtectedRoute>} />
          <Route path="/clients/:id" element={<ProtectedRoute><ClientCardPage /></ProtectedRoute>} />
          <Route path="/log-meeting" element={<ProtectedRoute><LogMeetingPage /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute allowedRoles={['manager','super_manager']}><TeamViewPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['manager','super_manager']}><UserManagementPage /></ProtectedRoute>} />
          <Route path="/clients/new" element={<ProtectedRoute><AddClientPage /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute><AccountListPage /></ProtectedRoute>} />
          <Route path="/accounts/:id" element={<ProtectedRoute><AccountDetailPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
