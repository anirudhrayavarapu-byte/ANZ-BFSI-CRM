import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, CircularProgress, Avatar, Chip, Fab } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AppShell from '../components/AppShell'
import { supabase } from '../lib/supabase'
import { formatRelative } from '../utils/dateFormat'

const COLORS = [
  '#1a237e','#0d47a1','#1565c0','#0277bd','#00838f',
  '#2e7d32','#558b2f','#e65100','#bf360c','#4a148c','#880e4f','#37474f',
]
function getColor(name) {
  if (!name) return COLORS[0]
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0
  return COLORS[Math.abs(h) % COLORS.length]
}
function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

export default function PartnerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [partner, setPartner] = useState(null)
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [{ data: p }, { data: cs }] = await Promise.all([
      supabase.from('partner_orgs').select('id, name, category').eq('id', id).single(),
      supabase.from('partner_contacts')
        .select('id, name, title, partner_meetings(id, meeting_date, notes)')
        .eq('partner_org_id', id)
        .eq('is_active', true)
        .order('name'),
    ])
    setPartner(p)
    setContacts((cs ?? []).map(c => {
      const sorted = (c.partner_meetings ?? [])
        .filter(m => m.meeting_date)
        .sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date))
      return { ...c, lastMeeting: sorted[0] ?? null }
    }))
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const metCount = contacts.filter(c => c.lastMeeting).length

  return (
    <AppShell title={partner?.name ?? 'Partner'}>
      <Box sx={{ pb: 14 }}>
        {/* Header */}
        {partner && (
          <Box sx={{
            px: 2.5, pt: 2, pb: 2.5,
            borderBottom: '1px solid var(--c-divider)',
            bgcolor: 'var(--c-card)',
          }}>
            {partner.category && (
              <Chip label={partner.category} size="small" sx={{
                mb: 1.5, bgcolor: 'var(--c-surface)', color: 'var(--c-text-2)', fontWeight: 600, fontSize: 11,
              }} />
            )}
            {!loading && (
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box>
                  <Typography fontWeight={800} fontSize={22} color="primary.main" lineHeight={1}>{contacts.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Contacts</Typography>
                </Box>
                <Box>
                  <Typography fontWeight={800} fontSize={22} sx={{ color: '#388e3c', lineHeight: 1 }}>{metCount}</Typography>
                  <Typography variant="caption" color="text.secondary">Met</Typography>
                </Box>
                <Box>
                  <Typography fontWeight={800} fontSize={22} sx={{ color: 'var(--c-text-3)', lineHeight: 1 }}>{contacts.length - metCount}</Typography>
                  <Typography variant="caption" color="text.secondary">Not yet</Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Contact list */}
        <Box sx={{ px: 2.5, pt: 2.5 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', pt: 6 }}><CircularProgress /></Box>
          ) : contacts.length === 0 ? (
            <Box sx={{ textAlign: 'center', pt: 6 }}>
              <Typography color="text.secondary" fontWeight={600}>No contacts yet</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Tap + to add your first contact at {partner?.name}
              </Typography>
            </Box>
          ) : (
            <>
              <Typography sx={{
                fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
                textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.75,
              }}>
                Contacts
              </Typography>
              {contacts.map(c => (
                <Box
                  key={c.id}
                  onClick={() => navigate(`/partners/${id}/contacts/${c.id}`)}
                  sx={{
                    bgcolor: 'var(--c-card)', borderRadius: '16px', p: 2, mb: 1.25,
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    cursor: 'pointer', border: '1px solid var(--c-divider)',
                    boxShadow: 'var(--shadow-card)', transition: 'all 0.12s',
                    '&:active': { opacity: 0.82, transform: 'scale(0.98)' },
                  }}
                >
                  <Avatar sx={{
                    width: 42, height: 42, bgcolor: getColor(c.name),
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                  }}>
                    {getInitials(c.name)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={14} letterSpacing="-0.2px" noWrap>
                      {c.name}
                    </Typography>
                    {c.title && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        {c.title}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: 'var(--c-text-3)', display: 'block', mt: 0.15 }}>
                      {c.lastMeeting
                        ? `Last met ${formatRelative(c.lastMeeting.meeting_date)}`
                        : 'No meetings yet'}
                    </Typography>
                  </Box>
                  <ChevronRightIcon sx={{ color: 'var(--c-text-3)', fontSize: 19, flexShrink: 0 }} />
                </Box>
              ))}
            </>
          )}
        </Box>
      </Box>

      <Fab
        onClick={() => navigate(`/partners/${id}/add-contact`)}
        sx={{
          position: 'fixed', bottom: 'calc(var(--safe-bottom) + 24px)', right: 24,
          bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)',
          '&:hover': { bgcolor: 'var(--c-hero-raised)' },
          gap: 1, px: 2.5, borderRadius: '16px', width: 'auto', height: 52,
        }}
        variant="extended"
      >
        <PersonAddIcon sx={{ fontSize: 20 }} />
        Add Contact
      </Fab>
    </AppShell>
  )
}
