import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material'
import AppShell from '../components/AppShell'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

const INDUSTRIES = ['Banking', 'Insurance', 'Wealth Management', 'Capital Markets', 'Fintech', 'Other']

function Label({ children }) {
  return (
    <Typography sx={{
      fontSize: 11, fontWeight: 700, letterSpacing: '1px',
      textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.25,
    }}>
      {children}
    </Typography>
  )
}

function FieldBox({ children, last }) {
  return (
    <Box sx={{ px: 2.5, py: 2, borderBottom: last ? 'none' : '1px solid var(--c-divider)' }}>
      {children}
    </Box>
  )
}

function InlineInput({ placeholder, value, onChange }) {
  return (
    <TextField
      fullWidth placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: 'var(--c-surface)',
          fontFamily: "'Figtree', system-ui, sans-serif",
          fontSize: 14, fontWeight: 500,
        },
        '& fieldset': { border: 'none' },
      }}
    />
  )
}

export default function AddAccountPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()

  const [name, setName]         = useState('')
  const [industry, setIndustry] = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  async function handleSave() {
    if (!name.trim()) { setError('Account name is required'); return }
    setSaving(true)
    setError('')

    const { data: existing } = await supabase
      .from('accounts')
      .select('id')
      .ilike('name', name.trim())
      .maybeSingle()
    if (existing) {
      setError(`An account named "${name.trim()}" already exists. Search for it in the Accounts list.`)
      setSaving(false)
      return
    }

    const { data, error: err } = await supabase.from('accounts').insert({
      name:     name.trim(),
      industry: industry.trim() || null,
      owner_id: profile?.id,
    }).select('id').single()
    if (err) { setError(err.message); setSaving(false); return }
    navigate(`/accounts/${data.id}`, { replace: true })
  }

  return (
    <AppShell title="New Account">
      <Box sx={{ bgcolor: 'var(--c-surface)', minHeight: '100%', pb: 12 }}>
        {error && (
          <Box sx={{ px: 2.5, pt: 2 }}>
            <Alert severity="error" sx={{ borderRadius: 2, fontSize: 13 }}>{error}</Alert>
          </Box>
        )}

        <Box sx={{ bgcolor: 'var(--c-card)', mt: 1.5 }}>
          <FieldBox>
            <Label>Account name</Label>
            <InlineInput placeholder="e.g. Westpac, Brighter Super" value={name} onChange={setName} />
          </FieldBox>
          <FieldBox last>
            <Label>Industry <Typography component="span" sx={{ fontSize: 10, color: 'var(--c-text-3)', fontWeight: 500 }}>optional</Typography></Label>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: industry ? 1 : 0 }}>
              {INDUSTRIES.map(ind => {
                const active = industry === ind
                return (
                  <Box
                    key={ind}
                    onClick={() => setIndustry(active ? '' : ind)}
                    sx={{
                      px: 1.75, py: 0.9, borderRadius: '10px', cursor: 'pointer',
                      bgcolor: active ? 'var(--c-hero)' : 'var(--c-surface)',
                      border: '1px solid', borderColor: active ? 'var(--c-hero)' : 'var(--c-border)',
                      transition: 'all 0.12s', '&:active': { transform: 'scale(0.95)' },
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? 'var(--c-hero-text)' : 'var(--c-text)' }}>
                      {ind}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
            {!INDUSTRIES.includes(industry) && industry && (
              <InlineInput placeholder="Other industry..." value={industry} onChange={setIndustry} />
            )}
            {INDUSTRIES.includes(industry) || (
              <Box onClick={() => setIndustry('custom')} sx={{ mt: 1, cursor: 'pointer' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--c-brand)' }}>+ Type custom industry</Typography>
              </Box>
            )}
          </FieldBox>
        </Box>
      </Box>

      <Box sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        px: 2.5, pt: 1.5, pb: 'calc(var(--safe-bottom) + 16px)',
        bgcolor: 'var(--c-card)', borderTop: '1px solid var(--c-divider)',
      }}>
        <Button
          fullWidth size="large" disabled={saving} onClick={handleSave}
          sx={{
            py: 1.7, fontSize: 15, fontWeight: 800, borderRadius: '14px',
            bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)', boxShadow: 'none',
            '&:hover': { bgcolor: 'var(--c-hero-raised)', boxShadow: 'none' },
            '&.Mui-disabled': { bgcolor: 'var(--c-border)', color: 'var(--c-text-3)' },
          }}
        >
          {saving ? <CircularProgress size={20} sx={{ color: 'var(--c-hero-muted)' }} /> : 'Create Account'}
        </Button>
      </Box>
    </AppShell>
  )
}
