import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { profile, fetchProfile, user } = useAuthStore()

  const [managers, setManagers] = useState([])
  const [selectedManager, setSelectedManager] = useState(null)
  const [displayName, setDisplayName] = useState(profile?.username ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('users')
      .select('id, username, role')
      .in('role', ['manager', 'super_manager'])
      .order('username')
      .then(({ data }) => setManagers(data ?? []))
  }, [])

  async function handleSave() {
    if (!displayName.trim()) { setError('Please enter your name'); return }
    if (!selectedManager) { setError('Please select your manager'); return }
    setSaving(true)
    setError('')

    const { error: err } = await supabase
      .from('users')
      .update({ username: displayName.trim(), manager_id: selectedManager.id })
      .eq('id', profile.id)

    if (err) { setError(err.message); setSaving(false); return }

    await fetchProfile(user.id)
    navigate('/', { replace: true })
  }

  return (
    <Box sx={{
      minHeight: '100dvh',
      bgcolor: 'var(--c-hero)',
      display: 'flex', flexDirection: 'column',
      pt: 'var(--safe-top)', pb: 'var(--safe-bottom)',
    }}>
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 4, pb: 3 }}>
        <Typography sx={{ color: 'var(--c-hero-muted)', fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', mb: 1 }}>
          Welcome to TM Client Card
        </Typography>
        <Typography sx={{ color: 'var(--c-hero-text)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.15 }}>
          Let's set up{'\n'}your account
        </Typography>
        <Typography sx={{ color: 'var(--c-hero-muted)', fontSize: 14, mt: 1.5, lineHeight: 1.5 }}>
          This takes 30 seconds. Your manager will be able to see your client activity.
        </Typography>
      </Box>

      {/* Form card */}
      <Box sx={{ flex: 1, bgcolor: 'var(--c-surface)', borderRadius: '24px 24px 0 0', pt: 2 }}>
        {/* Display name */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid var(--c-divider)', bgcolor: 'var(--c-card)' }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.25 }}>
            Your name
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g. Rahul Sharma"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { bgcolor: 'var(--c-surface)', fontFamily: "'Figtree', system-ui, sans-serif", fontSize: 15, fontWeight: 600 },
              '& fieldset': { border: 'none' },
            }}
          />
        </Box>

        {/* Manager picker */}
        <Box sx={{ px: 2.5, py: 2, bgcolor: 'var(--c-card)', mt: 1.5 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.5 }}>
            Who is your manager?
          </Typography>

          {managers.length === 0 ? (
            <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={20} sx={{ color: 'var(--c-text-3)' }} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {managers.map(m => {
                const active = selectedManager?.id === m.id
                return (
                  <Box
                    key={m.id}
                    onClick={() => setSelectedManager(m)}
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      px: 2, py: 1.5,
                      borderRadius: '14px',
                      cursor: 'pointer',
                      bgcolor: active ? 'var(--c-hero)' : 'var(--c-surface)',
                      border: '1px solid',
                      borderColor: active ? 'var(--c-hero)' : 'var(--c-border)',
                      transition: 'all 0.12s',
                      '&:active': { transform: 'scale(0.98)' },
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: active ? 'var(--c-hero-text)' : 'var(--c-text)', letterSpacing: '-0.2px' }}>
                        {m.username}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: active ? 'var(--c-hero-muted)' : 'var(--c-text-2)', mt: 0.15 }}>
                        {m.role === 'super_manager' ? 'Super Manager' : 'Manager'}
                      </Typography>
                    </Box>
                    {active && (
                      <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'oklch(100% 0 0 / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: 13, color: 'var(--c-hero-text)', fontWeight: 800, lineHeight: 1 }}>✓</Typography>
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Box>
          )}
        </Box>

        {error && (
          <Box sx={{ px: 2.5, mt: 1.5 }}>
            <Typography sx={{ fontSize: 13, color: 'var(--c-overdue)', fontWeight: 600 }}>{error}</Typography>
          </Box>
        )}
      </Box>

      {/* Fixed button */}
      <Box sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        px: 2.5, pt: 1.5, pb: 'calc(var(--safe-bottom) + 16px)',
        bgcolor: 'var(--c-card)', borderTop: '1px solid var(--c-divider)',
      }}>
        <Button
          fullWidth size="large"
          disabled={saving || !selectedManager || !displayName.trim()}
          onClick={handleSave}
          sx={{
            py: 1.7, fontSize: 15, fontWeight: 800, borderRadius: '14px',
            bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)',
            boxShadow: 'none',
            '&:hover': { bgcolor: 'var(--c-hero-raised)', boxShadow: 'none' },
            '&.Mui-disabled': { bgcolor: 'var(--c-border)', color: 'var(--c-text-3)' },
          }}
        >
          {saving ? <CircularProgress size={20} sx={{ color: 'var(--c-hero-muted)' }} /> : 'Get started →'}
        </Button>
      </Box>
    </Box>
  )
}
