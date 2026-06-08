import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, TextField, Button, Typography, CircularProgress, Alert, InputAdornment, IconButton } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash — it auto-processes it
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setValidSession(true)
    })
  }, [])

  async function handleReset(e) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(err.message); setLoading(false); return }

    setDone(true)
    setTimeout(() => navigate('/'), 2000)
  }

  return (
    <Box sx={{
      minHeight: '100dvh',
      bgcolor: 'var(--c-hero)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      px: 2.5,
    }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography sx={{ color: 'var(--c-hero-text)', fontWeight: 800, fontSize: 28, letterSpacing: '-0.8px', lineHeight: 1, mb: 0.75 }}>
          TM Client Card
        </Typography>
        <Typography sx={{ color: 'var(--c-hero-muted)', fontSize: 13, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          BFSI · APJ
        </Typography>
      </Box>

      <Box sx={{ width: '100%', maxWidth: 400, bgcolor: 'var(--c-card)', borderRadius: '20px', p: 3.5, boxShadow: '0 24px 64px oklch(5% 0.02 262 / 0.5)' }}>
        {done ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography sx={{ fontSize: 32, mb: 1 }}>✓</Typography>
            <Typography fontWeight={800} fontSize={20} color="var(--c-text)">Password updated</Typography>
            <Typography color="var(--c-text-2)" fontSize={14} mt={1}>Redirecting you to the app…</Typography>
          </Box>
        ) : (
          <>
            <Typography sx={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px', mb: 0.5, color: 'var(--c-text)' }}>
              Set new password
            </Typography>
            <Typography sx={{ color: 'var(--c-text-2)', fontSize: 14, mb: 3 }}>
              Choose a strong password for your account
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: 13 }}>{error}</Alert>}

            {!validSession && (
              <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2, fontSize: 13 }}>
                This link may have expired. Request a new one from the login page.
              </Alert>
            )}

            <form onSubmit={handleReset}>
              <TextField
                label="New password"
                type={showPw ? 'text' : 'password'}
                fullWidth required
                value={password}
                onChange={e => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: 'var(--c-text-3)', fontSize: 19 }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPw(s => !s)} edge="end">
                        {showPw ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Confirm password"
                type={showPw ? 'text' : 'password'}
                fullWidth required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: 'var(--c-text-3)', fontSize: 19 }} /></InputAdornment>,
                }}
              />
              <Button
                type="submit" fullWidth size="large"
                disabled={loading || !validSession}
                sx={{
                  py: 1.7, fontSize: 15, fontWeight: 800, borderRadius: '12px',
                  bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)',
                  '&:hover': { bgcolor: 'var(--c-hero-raised)' },
                  '&.Mui-disabled': { bgcolor: 'var(--c-border)', color: 'var(--c-text-3)' },
                }}
              >
                {loading ? <CircularProgress size={20} sx={{ color: 'var(--c-hero-muted)' }} /> : 'Update password'}
              </Button>
            </form>
          </>
        )}
      </Box>
    </Box>
  )
}
