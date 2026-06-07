import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, TextField, Button, Typography, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, fetchProfile } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error } = await signIn(email, password)
    if (error) { setError(error.message); setLoading(false); return }
    await fetchProfile(data.user.id)
    navigate('/')
  }

  return (
    <Box sx={{
      minHeight: '100dvh',
      background: 'linear-gradient(145deg, #0d1b6e 0%, #1a237e 40%, #1565c0 75%, #0288d1 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      px: 2, pt: 'var(--safe-top)', pb: 'var(--safe-bottom)',
    }}>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '20px',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 2.5,
          fontSize: 28,
        }}>
          💼
        </Box>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', letterSpacing: '-0.5px' }}>
          TM Client Card
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.5 }}>
          BFSI Sales CRM
        </Typography>
      </Box>

      <Box sx={{
        width: '100%', maxWidth: 400,
        background: 'rgba(255,255,255,0.97)',
        borderRadius: '24px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        p: 3.5,
      }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5, letterSpacing: '-0.3px' }}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to your account
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>
            }}
          />
          <TextField
            label="Password"
            type={showPw ? 'text' : 'password'}
            fullWidth
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPw(s => !s)} edge="end">
                    {showPw ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            type="submit" variant="contained" fullWidth size="large"
            disabled={loading}
            sx={{ py: 1.6, fontSize: 15, fontWeight: 700, borderRadius: '12px',
              background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 100%)',
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
          </Button>
        </form>
      </Box>

      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 4 }}>
        Tech Mahindra BFSI APJ
      </Typography>
    </Box>
  )
}
