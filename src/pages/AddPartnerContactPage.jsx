import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material'
import AppShell from '../components/AppShell'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

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

function InlineInput({ placeholder, value, onChange, type = 'text' }) {
  return (
    <TextField
      fullWidth type={type}
      placeholder={placeholder}
      value={value}
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

export default function AddPartnerContactPage() {
  const { orgId } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuthStore()

  const [name, setName]   = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('partner_contacts').insert({
      partner_org_id: orgId,
      name:  name.trim(),
      title: title.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      added_by: profile?.id,
    })
    if (err) { setError(err.message); setSaving(false); return }
    navigate(-1)
  }

  return (
    <AppShell title="Add Contact">
      <Box sx={{ bgcolor: 'var(--c-surface)', minHeight: '100%', pb: 12 }}>
        {error && (
          <Box sx={{ px: 2.5, pt: 2 }}>
            <Alert severity="error" sx={{ borderRadius: 2, fontSize: 13 }}>{error}</Alert>
          </Box>
        )}

        <Box sx={{ bgcolor: 'var(--c-card)', mt: 1.5 }}>
          <FieldBox>
            <Label>Full name</Label>
            <InlineInput placeholder="e.g. Sarah Chen" value={name} onChange={setName} />
          </FieldBox>
          <FieldBox>
            <Label>Title / Role <Typography component="span" sx={{ fontSize: 10, color: 'var(--c-text-3)', fontWeight: 500 }}>optional</Typography></Label>
            <InlineInput placeholder="e.g. Head of Partnerships" value={title} onChange={setTitle} />
          </FieldBox>
          <FieldBox>
            <Label>Email <Typography component="span" sx={{ fontSize: 10, color: 'var(--c-text-3)', fontWeight: 500 }}>optional</Typography></Label>
            <InlineInput placeholder="email@company.com" value={email} onChange={setEmail} type="email" />
          </FieldBox>
          <FieldBox last>
            <Label>Phone <Typography component="span" sx={{ fontSize: 10, color: 'var(--c-text-3)', fontWeight: 500 }}>optional</Typography></Label>
            <InlineInput placeholder="+61 4xx xxx xxx" value={phone} onChange={setPhone} type="tel" />
          </FieldBox>
        </Box>
      </Box>

      <Box sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        px: 2.5, pt: 1.5, pb: 'calc(var(--safe-bottom) + 16px)',
        bgcolor: 'var(--c-card)', borderTop: '1px solid var(--c-divider)',
      }}>
        <Button
          fullWidth size="large"
          disabled={saving}
          onClick={handleSave}
          sx={{
            py: 1.7, fontSize: 15, fontWeight: 800, borderRadius: '14px',
            bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)', boxShadow: 'none',
            '&:hover': { bgcolor: 'var(--c-hero-raised)', boxShadow: 'none' },
            '&.Mui-disabled': { bgcolor: 'var(--c-border)', color: 'var(--c-text-3)' },
          }}
        >
          {saving ? <CircularProgress size={20} sx={{ color: 'var(--c-hero-muted)' }} /> : 'Save Contact'}
        </Button>
      </Box>
    </AppShell>
  )
}
