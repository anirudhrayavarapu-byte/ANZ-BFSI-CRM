import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Chip, CircularProgress, Avatar, Fab, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material'
import EditNoteIcon from '@mui/icons-material/EditNote'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AppShell from '../components/AppShell'
import { supabase } from '../lib/supabase'
import { getFollowUpStatus, STATUS_COLORS, STATUS_LABELS } from '../utils/followUpStatus'
import { formatDate, formatRelative } from '../utils/dateFormat'

const AVATAR_COLORS = [
  '#1a237e', '#0d47a1', '#1565c0', '#0277bd', '#00838f',
  '#2e7d32', '#558b2f', '#e65100', '#bf360c', '#4a148c',
]

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/[\s.]+/).filter(Boolean)
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

const STATUS_ORDER = { overdue: 0, today: 1, upcoming: 2, future: 3, none: 4 }

function ClientRow({ client, onClick }) {
  const m = client.lastMeeting
  const followUpDate = m?.next_followup_date ?? null
  const status = getFollowUpStatus(followUpDate)
  const statusColor = STATUS_COLORS[status]
  const statusLabel = STATUS_LABELS[status]

  const daysSince = m?.meeting_date
    ? Math.round((Date.now() - new Date(m.meeting_date).getTime()) / 86400000)
    : null

  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: 'var(--c-card)',
        borderRadius: '16px',
        p: 2,
        mb: 1.25,
        cursor: 'pointer',
        border: '1px solid var(--c-divider)',
        boxShadow: 'var(--shadow-card)',
        transition: 'all 0.12s',
        '&:active': { opacity: 0.82, transform: 'scale(0.98)' },
      }}
    >
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Avatar sx={{
          width: 40, height: 40, bgcolor: getAvatarColor(client.name),
          fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>
          {getInitials(client.name)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.2 }}>
            <Typography fontWeight={700} fontSize={14} letterSpacing="-0.2px" noWrap sx={{ flex: 1, mr: 1 }}>
              {client.name}
            </Typography>
            {statusLabel && (
              <Chip
                label={statusLabel}
                size="small"
                sx={{
                  bgcolor: `${statusColor}18`, color: statusColor,
                  fontWeight: 700, fontSize: 10, height: 20, flexShrink: 0,
                  border: `1px solid ${statusColor}30`,
                }}
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {client.title}
            {client.assignee?.username ? ` · ${client.assignee.username}` : ''}
          </Typography>
        </Box>
      </Box>

      {/* Meeting info */}
      <Box sx={{ mt: 1.5, pl: '52px' }}>
        {m ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.4 }}>
              <Typography variant="caption" color="text.secondary">
                Last met:{' '}
                <Box component="span" sx={{ fontWeight: 600, color: 'var(--c-text)' }}>
                  {formatRelative(m.meeting_date)}
                </Box>
                {daysSince > 0 ? ` (${daysSince}d ago)` : ''}
              </Typography>
              {followUpDate && (
                <Typography variant="caption" sx={{ color: statusColor, fontWeight: 700, flexShrink: 0, ml: 1 }}>
                  Next: {formatDate(followUpDate)}
                </Typography>
              )}
            </Box>
            {m.discussion_summary && (
              <Typography variant="caption" color="text.secondary" sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.55,
                fontStyle: 'italic',
              }}>
                "{m.discussion_summary}"
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="caption" sx={{ color: 'var(--c-text-3)', fontStyle: 'italic' }}>
            No meetings logged yet
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default function AccountDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [account, setAccount] = useState(null)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: acc }, { data: cls }] = await Promise.all([
        supabase.from('accounts')
          .select('id, name, industry, owner:users!owner_id(username)')
          .eq('id', id)
          .single(),
        supabase.from('clients')
          .select(`
            id, name, title,
            assignee:users!assigned_to(username),
            meetings(id, meeting_date, discussion_summary, next_followup_date)
          `)
          .eq('account_id', id)
          .eq('is_active', true)
          .order('name'),
      ])

      setAccount(acc)

      const enriched = (cls ?? []).map(c => {
        const sorted = (c.meetings ?? [])
          .filter(m => m.meeting_date)
          .sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date))
        return { ...c, lastMeeting: sorted[0] ?? null }
      })

      enriched.sort((a, b) => {
        const sa = STATUS_ORDER[getFollowUpStatus(a.lastMeeting?.next_followup_date)] ?? 4
        const sb = STATUS_ORDER[getFollowUpStatus(b.lastMeeting?.next_followup_date)] ?? 4
        return sa - sb
      })

      setClients(enriched)
      setLoading(false)
    }
    load()
  }, [id])

  const overdue  = clients.filter(c => getFollowUpStatus(c.lastMeeting?.next_followup_date) === 'overdue').length
  const dueSoon  = clients.filter(c => ['today','upcoming'].includes(getFollowUpStatus(c.lastMeeting?.next_followup_date))).length
  const onTrack  = clients.filter(c => getFollowUpStatus(c.lastMeeting?.next_followup_date) === 'future').length
  const noMeeting = clients.filter(c => !c.lastMeeting).length

  return (
    <AppShell title={account?.name ?? 'Account'}>
      <Box sx={{ pb: 12 }}>

        {/* Account header */}
        {account && (
          <Box sx={{
            px: 2.5, pt: 2, pb: 2.5,
            borderBottom: '1px solid var(--c-divider)',
            bgcolor: 'var(--c-card)',
          }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              {account.industry && (
                <Chip
                  label={account.industry}
                  size="small"
                  sx={{ bgcolor: 'var(--c-surface)', color: 'var(--c-text-2)', fontWeight: 600, fontSize: 11 }}
                />
              )}
              {account.owner?.username && (
                <Chip
                  label={`Owner: ${account.owner.username}`}
                  size="small"
                  sx={{ bgcolor: 'var(--c-surface)', color: 'var(--c-text-2)', fontWeight: 600, fontSize: 11 }}
                />
              )}
            </Box>

            {/* Stats row */}
            {!loading && (
              <Box sx={{ display: 'flex', gap: 3, mt: 1.5 }}>
                <Box>
                  <Typography fontWeight={800} fontSize={22} color="primary.main" lineHeight={1}>{clients.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Total</Typography>
                </Box>
                {overdue > 0 && (
                  <Box>
                    <Typography fontWeight={800} fontSize={22} sx={{ color: STATUS_COLORS.overdue, lineHeight: 1 }}>{overdue}</Typography>
                    <Typography variant="caption" color="text.secondary">Overdue</Typography>
                  </Box>
                )}
                {dueSoon > 0 && (
                  <Box>
                    <Typography fontWeight={800} fontSize={22} sx={{ color: STATUS_COLORS.upcoming, lineHeight: 1 }}>{dueSoon}</Typography>
                    <Typography variant="caption" color="text.secondary">Due soon</Typography>
                  </Box>
                )}
                {onTrack > 0 && (
                  <Box>
                    <Typography fontWeight={800} fontSize={22} sx={{ color: STATUS_COLORS.future, lineHeight: 1 }}>{onTrack}</Typography>
                    <Typography variant="caption" color="text.secondary">On track</Typography>
                  </Box>
                )}
                {noMeeting > 0 && (
                  <Box>
                    <Typography fontWeight={800} fontSize={22} sx={{ color: 'var(--c-text-3)', lineHeight: 1 }}>{noMeeting}</Typography>
                    <Typography variant="caption" color="text.secondary">No meetings</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Client list */}
        <Box sx={{ px: 2.5, pt: 2.5 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', pt: 6 }}><CircularProgress /></Box>
          ) : clients.length === 0 ? (
            <Box sx={{ textAlign: 'center', pt: 6 }}>
              <Typography color="text.secondary" fontWeight={600}>No clients in this account</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Add a client and assign them to this account
              </Typography>
            </Box>
          ) : (
            <>
              <Typography sx={{
                fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
                textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.75,
              }}>
                Clients — sorted by urgency
              </Typography>
              {clients.map(c => (
                <ClientRow
                  key={c.id}
                  client={c}
                  onClick={() => navigate(`/clients/${c.id}`)}
                />
              ))}
            </>
          )}
        </Box>
      </Box>

      <SpeedDial
        ariaLabel="Account actions"
        sx={{
          position: 'fixed', bottom: 'calc(var(--safe-bottom) + 24px)', right: 24,
          '& .MuiSpeedDial-fab': { bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)', '&:hover': { bgcolor: 'var(--c-hero-raised)' } },
        }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<PersonAddIcon />}
          tooltipTitle="Add Client"
          tooltipOpen
          onClick={() => navigate(`/clients/new?accountId=${id}`)}
          sx={{ '& .MuiSpeedDialAction-fab': { bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)' } }}
        />
        <SpeedDialAction
          icon={<EditNoteIcon />}
          tooltipTitle="Log Meeting"
          tooltipOpen
          onClick={() => navigate('/log-meeting')}
          sx={{ '& .MuiSpeedDialAction-fab': { bgcolor: 'var(--c-hero)', color: 'var(--c-hero-text)' } }}
        />
      </SpeedDial>
    </AppShell>
  )
}
