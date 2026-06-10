import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, TextField, Button, CircularProgress, Chip, Select, MenuItem } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../utils/dateFormat'

const formatAUD = v => {
  if (v == null) return '—'
  const n = new Intl.NumberFormat('en-AU', {
    style: 'currency', currency: 'AUD',
    maximumFractionDigits: v % 1 === 0 ? 0 : 1,
  }).format(v)
  return `${n}M`
}

const STATUS_CONFIG = {
  active: { label: 'Active', color: '#1565c0', bg: '#1565c018' },
  won:    { label: 'Won',    color: '#2e7d32', bg: '#2e7d3218' },
  lost:   { label: 'Lost',   color: '#757575', bg: '#75757518' },
}

function OppRow({ opp, onStatusChange }) {
  const sc = STATUS_CONFIG[opp.status] ?? STATUS_CONFIG.active

  return (
    <Box sx={{
      px: 2, py: 1.75,
      borderBottom: '1px solid var(--c-divider)',
      '&:last-child': { borderBottom: 'none' },
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
        <Typography fontWeight={700} fontSize={14} letterSpacing="-0.2px" sx={{ flex: 1, mr: 1, lineHeight: 1.3 }}>
          {opp.name}
        </Typography>
        <Select
          value={opp.status}
          onChange={e => onStatusChange(opp.id, e.target.value)}
          size="small"
          variant="standard"
          disableUnderline
          sx={{
            fontSize: 11, fontWeight: 700,
            color: sc.color,
            bgcolor: sc.bg,
            borderRadius: '8px', px: 0.75, py: 0.25,
            '& .MuiSelect-icon': { color: sc.color, fontSize: 16 },
            '& .MuiSelect-select': { py: '2px !important', pr: '20px !important', pl: '6px !important' },
          }}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="won">Won</MenuItem>
          <MenuItem value="lost">Lost</MenuItem>
        </Select>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontWeight={800} fontSize={17} color="primary.main" letterSpacing="-0.3px">
          {formatAUD(opp.deal_value)}
        </Typography>
        {opp.close_date && (
          <Typography variant="caption" color="text.secondary">
            Close: {formatDate(opp.close_date)}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default function OpportunityTab({ clientId, accountId }) {
  const { profile } = useAuthStore()
  const [opps, setOpps] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  const [name, setName]           = useState('')
  const [dealValue, setDealValue] = useState('')
  const [closeDate, setCloseDate] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase.from('opportunities')
      .select('id, name, deal_value, close_date, status')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    setOpps(data ?? [])
    setLoading(false)
  }, [clientId])

  useEffect(() => { load() }, [load])

  async function handleAdd() {
    if (!name.trim()) return
    setSaving(true)
    await supabase.from('opportunities').insert({
      client_id:  clientId,
      account_id: accountId ?? null,
      name:       name.trim(),
      deal_value: dealValue ? parseFloat(dealValue) : null,
      close_date: closeDate || null,
      status:     'active',
      created_by: profile?.id,
    })
    setName(''); setDealValue(''); setCloseDate('')
    setAdding(false); setSaving(false)
    await load()
  }

  async function handleStatusChange(id, status) {
    await supabase.from('opportunities').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setOpps(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const totalActive = opps
    .filter(o => o.status === 'active')
    .reduce((s, o) => s + (o.deal_value ?? 0), 0)

  if (loading) return (
    <Box sx={{ pt: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
  )

  return (
    <Box sx={{ pb: 10 }}>

      {/* Summary bar */}
      {opps.length > 0 && (
        <Box sx={{ px: 2.5, py: 2, bgcolor: 'var(--c-card)', borderBottom: '1px solid var(--c-divider)', display: 'flex', gap: 3 }}>
          <Box>
            <Typography fontWeight={800} fontSize={18} color="primary.main" lineHeight={1}>
              {formatAUD(totalActive)}
            </Typography>
            <Typography variant="caption" color="text.secondary">Active pipeline</Typography>
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize={18} lineHeight={1}>{opps.length}</Typography>
            <Typography variant="caption" color="text.secondary">Total deals</Typography>
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize={18} sx={{ color: '#2e7d32', lineHeight: 1 }}>
              {opps.filter(o => o.status === 'won').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">Won</Typography>
          </Box>
        </Box>
      )}

      {/* Add form */}
      {adding ? (
        <Box sx={{ px: 2.5, py: 2.5, bgcolor: 'var(--c-card)', borderBottom: '1px solid var(--c-divider)' }}>
          <Typography sx={{
            fontSize: 11, fontWeight: 700, letterSpacing: '1px',
            textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.5,
          }}>
            New Opportunity
          </Typography>
          <TextField
            fullWidth placeholder="Opportunity name *"
            value={name} onChange={e => setName(e.target.value)}
            sx={{ mb: 1.25, '& .MuiOutlinedInput-root': { bgcolor: 'var(--c-surface)', fontSize: 14 }, '& fieldset': { border: 'none' } }}
          />
          <Box sx={{ display: 'flex', gap: 1.25, mb: 1.25 }}>
            <TextField
              placeholder="Value (A$M) e.g. 1.5" type="number"
              value={dealValue} onChange={e => setDealValue(e.target.value)}
              sx={{ flex: 1, '& .MuiOutlinedInput-root': { bgcolor: 'var(--c-surface)', fontSize: 14 }, '& fieldset': { border: 'none' } }}
            />
            <TextField
              type="date" label="Close date"
              InputLabelProps={{ shrink: true }}
              value={closeDate} onChange={e => setCloseDate(e.target.value)}
              sx={{ flex: 1, '& .MuiOutlinedInput-root': { bgcolor: 'var(--c-surface)', fontSize: 14 }, '& fieldset': { border: 'none' } }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth disabled={saving || !name.trim()} onClick={handleAdd}
              sx={{
                bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)', borderRadius: '12px',
                fontWeight: 700, py: 1.25, '&:hover': { bgcolor: 'var(--c-hero-raised)' },
                '&.Mui-disabled': { bgcolor: 'var(--c-border)', color: 'var(--c-text-3)' },
              }}
            >
              {saving ? 'Saving...' : 'Add Deal'}
            </Button>
            <Button onClick={() => { setAdding(false); setName(''); setDealValue(''); setCloseDate('') }}
              sx={{ borderRadius: '12px', color: 'var(--c-text-2)', fontWeight: 600, px: 2 }}>
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ px: 2.5, pt: 2 }}>
          <Button
            startIcon={<AddIcon />} onClick={() => setAdding(true)}
            sx={{
              bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)',
              borderRadius: '12px', fontWeight: 700, px: 2.5, py: 1.25,
              '&:hover': { bgcolor: 'var(--c-hero-raised)' },
            }}
          >
            Add Opportunity
          </Button>
        </Box>
      )}

      {/* Opportunity list */}
      {opps.length === 0 ? (
        <Box sx={{ textAlign: 'center', pt: 5, px: 3 }}>
          <Typography color="text.secondary" fontWeight={600}>No opportunities yet</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Track deals and pipeline for this client
          </Typography>
        </Box>
      ) : (
        <Box sx={{ bgcolor: 'var(--c-card)', mx: 2.5, mt: 2.5, borderRadius: '16px', border: '1px solid var(--c-divider)', overflow: 'hidden' }}>
          {opps.map(o => (
            <OppRow key={o.id} opp={o} onStatusChange={handleStatusChange} />
          ))}
        </Box>
      )}
    </Box>
  )
}
