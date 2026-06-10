import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Avatar, Fab } from '@mui/material'
import BusinessIcon from '@mui/icons-material/Business'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import PeopleIcon from '@mui/icons-material/People'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { supabase } from '../lib/supabase'

const AVATAR_COLORS = [
  '#1a237e', '#0d47a1', '#1565c0', '#0277bd', '#00838f',
  '#2e7d32', '#558b2f', '#e65100', '#bf360c', '#4a148c',
]

function getBrandColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function AccountCard({ account, onClick }) {
  const color = getBrandColor(account.name)
  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: 'var(--c-card)',
        borderRadius: '18px',
        p: 2,
        mb: 1.25,
        display: 'flex',
        alignItems: 'center',
        gap: 1.75,
        cursor: 'pointer',
        border: '1px solid var(--c-divider)',
        boxShadow: 'var(--shadow-card)',
        transition: 'all 0.12s',
        '&:active': { opacity: 0.82, transform: 'scale(0.98)' },
      }}
    >
      <Avatar sx={{
        width: 46, height: 46, borderRadius: '13px',
        bgcolor: color, fontSize: 14, fontWeight: 800, flexShrink: 0,
      }}>
        {getInitials(account.name)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={700} fontSize={15} letterSpacing="-0.2px" noWrap>
          {account.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.3 }}>
          {account.industry && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {account.industry}
            </Typography>
          )}
          {account.industry && (
            <Typography variant="caption" color="text.secondary">·</Typography>
          )}
          <PeopleIcon sx={{ fontSize: 11, color: 'var(--c-text-3)' }} />
          <Typography variant="caption" color="text.secondary">
            {account.clientCount} {account.clientCount === 1 ? 'client' : 'clients'}
          </Typography>
        </Box>
        {account.owner?.username && (
          <Typography variant="caption" sx={{ color: 'var(--c-text-3)', display: 'block', mt: 0.15 }}>
            Owner: {account.owner.username}
          </Typography>
        )}
      </Box>

      <ChevronRightIcon sx={{ color: 'var(--c-text-3)', fontSize: 19, flexShrink: 0 }} />
    </Box>
  )
}

export default function AccountListPage() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('accounts')
      .select('id, name, industry, owner:users!owner_id(username), clients(id, is_active)')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        setAccounts((data ?? []).map(a => ({
          ...a,
          clientCount: (a.clients ?? []).filter(c => c.is_active).length,
        })))
        setLoading(false)
      })
  }, [])

  return (
    <AppShell title="Accounts">
      <Box sx={{ px: 2.5, pt: 2.5, pb: 10 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', pt: 8 }}><CircularProgress /></Box>
        ) : accounts.length === 0 ? (
          <Box sx={{ textAlign: 'center', pt: 10 }}>
            <BusinessIcon sx={{ fontSize: 52, color: 'var(--c-text-3)', mb: 1.5 }} />
            <Typography fontWeight={600} color="text.secondary">No accounts yet</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Accounts are created when you add a client
            </Typography>
          </Box>
        ) : (
          <>
            <Typography sx={{
              fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
              textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.75,
            }}>
              {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
            </Typography>
            {accounts.map(a => (
              <AccountCard
                key={a.id}
                account={a}
                onClick={() => navigate(`/accounts/${a.id}`)}
              />
            ))}
          </>
        )}
      </Box>

      <Fab
        color="primary"
        aria-label="Add account"
        sx={{ position: 'fixed', bottom: 'calc(var(--safe-bottom) + 16px)', right: 16, bgcolor: 'var(--c-hero)', '&:hover': { bgcolor: 'var(--c-hero-raised)' } }}
        onClick={() => navigate('/accounts/new')}
      >
        <AddIcon />
      </Fab>
    </AppShell>
  )
}
