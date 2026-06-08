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
      bgcolor: 'var(--c-hero)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2.5,
      pt: 'var(--safe-top)',
      pb: 'var(--safe-bottom)',
    }}>
      {/* Wordmark */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography sx={{
          color: 'var(--c-hero-text)',
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: '-0.8px',
          lineHeight: 1,
          mb: 0.75,
        }}>
          TM Client Card
        </Typography>
        <Typography sx={{
          color: 'var(--c-hero-muted)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
        }}>
          BFSI · APJ
        </Typography>
      </Box>

      {/* Form card */}
      <Box sx={{
        width: '100%',
        maxWidth: 400,
        bgcolor: 'var(--c-card)',
        borderRadius: '20px',
        p: 3.5,
        boxShadow: '0 24px 64px oklch(5% 0.02 262 / 0.5)',
      }}>
        <Typography sx={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px', mb: 0.5, color: 'var(--c-text)' }}>
          Welcome back
        </Typography>
        <Typography sx={{ color: 'var(--c-text-2)', fontSize: 14, mb: 3 }}>
          Sign in to your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: 13 }}>{error}</Alert>
        )}

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
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: 'var(--c-text-3)', fontSize: 19 }} />
                </InputAdornment>
              )
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
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: 'var(--c-text-3)', fontSize: 19 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPw(s => !s)} edge="end">
                    {showPw
                      ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                      : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            type="submit"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              py: 1.7,
              fontSize: 15,
              fontWeight: 800,
              borderRadius: '12px',
              bgcolor: 'var(--c-hero)',
              color: 'var(--c-hero-text)',
              letterSpacing: '-0.2px',
              '&:hover': { bgcolor: 'var(--c-hero-raised)' },
              '&:active': { transform: 'scale(0.99)' },
              '&.Mui-disabled': { bgcolor: 'var(--c-border)', color: 'var(--c-text-3)' },
              transition: 'background 0.15s, transform 0.1s',
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: 'var(--c-hero-muted)' }} /> : 'Sign in'}
          </Button>
        </form>
      </Box>

      <Typography sx={{ color: 'var(--c-hero-muted)', fontSize: 12, mt: 5, letterSpacing: '0.5px' }}>
        Tech Mahindra BFSI APJ
      </Typography>
    </Box>
  )
}
