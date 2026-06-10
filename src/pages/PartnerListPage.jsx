import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Avatar } from '@mui/material'
import HandshakeIcon from '@mui/icons-material/Handshake'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { supabase } from '../lib/supabase'

const COLORS = [
  '#1a237e','#0d47a1','#1565c0','#0277bd','#00838f',
  '#2e7d32','#558b2f','#e65100','#bf360c','#4a148c','#880e4f','#37474f',
]

function getBrandColor(name) {
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

export default function PartnerListPage() {
  const navigate = useNavigate()
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('partner_orgs')
      .select('id, name, category, partner_contacts(id, is_active)')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        setPartners((data ?? []).map(p => ({
          ...p,
          contactCount: (p.partner_contacts ?? []).filter(c => c.is_active).length,
        })))
        setLoading(false)
      })
  }, [])

  return (
    <AppShell title="Partners">
      <Box sx={{ px: 2.5, pt: 2.5, pb: 10 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', pt: 8 }}><CircularProgress /></Box>
        ) : (
          <>
            <Typography sx={{
              fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
              textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.75,
            }}>
              {partners.length} partners
            </Typography>
            {partners.map(p => (
              <Box
                key={p.id}
                onClick={() => navigate(`/partners/${p.id}`)}
                sx={{
                  bgcolor: 'var(--c-card)', borderRadius: '18px', p: 2, mb: 1.25,
                  display: 'flex', alignItems: 'center', gap: 1.75,
                  cursor: 'pointer', border: '1px solid var(--c-divider)',
                  boxShadow: 'var(--shadow-card)', transition: 'all 0.12s',
                  '&:active': { opacity: 0.82, transform: 'scale(0.98)' },
                }}
              >
                <Avatar sx={{
                  width: 46, height: 46, borderRadius: '13px',
                  bgcolor: getBrandColor(p.name), fontSize: 14, fontWeight: 800, flexShrink: 0,
                }}>
                  {getInitials(p.name)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={700} fontSize={15} letterSpacing="-0.2px" noWrap>
                    {p.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.3 }}>
                    {p.category && (
                      <Typography variant="caption" color="text.secondary">{p.category}</Typography>
                    )}
                    {p.category && <Typography variant="caption" color="text.secondary">·</Typography>}
                    <Typography variant="caption" color="text.secondary">
                      {p.contactCount} {p.contactCount === 1 ? 'contact' : 'contacts'}
                    </Typography>
                  </Box>
                </Box>
                <ChevronRightIcon sx={{ color: 'var(--c-text-3)', fontSize: 19, flexShrink: 0 }} />
              </Box>
            ))}
          </>
        )}
      </Box>
    </AppShell>
  )
}
