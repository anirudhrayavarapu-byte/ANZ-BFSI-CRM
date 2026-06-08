import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material'
import AppShell from '../components/AppShell'
import { useAccounts } from '../hooks/useAccounts'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

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

export default function AddClientPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { accounts } = useAccounts()

  const [selectedAccount, setSelectedAccount] = useState(null)
  const [newAccountName, setNewAccountName] = useState('')
  const [newAccountIndustry, setNewAccountIndustry] = useState('')
  const [isNewAccount, setIsNewAccount] = useState(false)

  const [name, setName]   = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  async function handleSave() {
    if (!name.trim() || !title.trim()) { setError('Name and title are required'); return }
    if (!isNewAccount && !selectedAccount) { setError('Select or create an account'); return }
    if (isNewAccount && !newAccountName.trim()) { setError('Account name is required'); return }

    setSaving(true)
    setError('')

    try {
      let accountId = selectedAccount?.id

      if (isNewAccount) {
        const { data: acc, error: accErr } = await supabase.from('accounts').insert({
          name: newAccountName.trim(),
          industry: newAccountIndustry.trim() || null,
          owner_id: profile.id,
        }).select('id').single()
        if (accErr) throw accErr
        accountId = acc.id
      }

      const { data: client, error: cErr } = await supabase.from('clients').insert({
        account_id:  accountId,
        name:        name.trim(),
        title:       title.trim(),
        email:       email.trim() || null,
        phone:       phone.trim() || null,
        assigned_to: profile.id,
        created_by:  profile.id,
      }).select('id').single()
      if (cErr) throw cErr

      navigate(`/clients/${client.id}`, { replace: true })
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <AppShell title="New Client">
      <Box sx={{ bgcolor: 'var(--c-surface)', minHeight: '100%', pb: 12 }}>

        {error && (
          <Box sx={{ px: 2.5, pt: 2 }}>
            <Alert severity="error" sx={{ borderRadius: 2, fontSize: 13 }}>{error}</Alert>
          </Box>
        )}

        {/* Account section */}
        <Box sx={{ bgcolor: 'var(--c-card)', mt: 0 }}>
          <FieldBox>
            <Label>Account</Label>

            {!isNewAccount ? (
              <>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: accounts.length ? 1.5 : 0 }}>
                  {accounts.map(a => {
                    const active = selectedAccount?.id === a.id
                    return (
                      <Box
                        key={a.id}
                        onClick={() => setSelectedAccount(a)}
                        sx={{
                          px: 1.75, py: 0.9, borderRadius: '10px', cursor: 'pointer',
                          bgcolor: active ? 'var(--c-hero)' : 'var(--c-surface)',
                          border: '1px solid', borderColor: active ? 'var(--c-hero)' : 'var(--c-border)',
                          transition: 'all 0.12s', '&:active': { transform: 'scale(0.95)' },
                        }}
                      >
                        <Typography sx={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? 'var(--c-hero-text)' : 'var(--c-text)' }}>
                          {a.name}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
                <Box
                  onClick={() => { setIsNewAccount(true); setSelectedAccount(null) }}
                  sx={{ cursor: 'pointer', mt: accounts.length ? 0 : 0 }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--c-brand)', letterSpacing: '-0.1px' }}>
                    + Create new account
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <InlineInput placeholder="Account name (e.g. Westpac)" value={newAccountName} onChange={setNewAccountName} />
                <Box sx={{ mt: 1.5 }}>
                  <InlineInput placeholder="Industry (e.g. Banking)" value={newAccountIndustry} onChange={setNewAccountIndustry} />
                </Box>
                <Box onClick={() => { setIsNewAccount(false); setNewAccountName(''); setNewAccountIndustry('') }} sx={{ mt: 1.25, cursor: 'pointer' }}>
                  <Typography sx={{ fontSize: 12, color: 'var(--c-text-2)' }}>← Pick existing account</Typography>
                </Box>
              </>
            )}
          </FieldBox>
        </Box>

        {/* Client details */}
        <Box sx={{ bgcolor: 'var(--c-card)', mt: 1.5 }}>
          <FieldBox>
            <Label>Full name</Label>
            <InlineInput placeholder="e.g. James Hartley" value={name} onChange={setName} />
          </FieldBox>
          <FieldBox>
            <Label>Title / Role</Label>
            <InlineInput placeholder="e.g. Chief Financial Officer" value={title} onChange={setTitle} />
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

      {/* Fixed save button */}
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
            py: 1.7, fontSize: 15, fontWeight: 800,
            borderRadius: '14px', letterSpacing: '-0.2px',
            bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)',
            boxShadow: 'none',
            '&:hover': { bgcolor: 'var(--c-hero-raised)', boxShadow: 'none' },
            '&.Mui-disabled': { bgcolor: 'var(--c-border)', color: 'var(--c-text-3)' },
          }}
        >
          {saving ? <CircularProgress size={20} sx={{ color: 'var(--c-hero-muted)' }} /> : 'Save Client'}
        </Button>
      </Box>
    </AppShell>
  )
}
