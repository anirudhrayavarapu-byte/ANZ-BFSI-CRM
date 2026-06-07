import { useState } from 'react'
import {
  Box, Typography, Chip, Collapse, List, ListItem,
  ListItemText, Divider
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import PersonIcon from '@mui/icons-material/Person'
import { useNavigate } from 'react-router-dom'
import { getFollowUpStatus, STATUS_COLORS, STATUS_LABELS } from '../../utils/followUpStatus'
import { formatRelative } from '../../utils/dateFormat'

export default function TeamMemberCard({ member }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: 2, mb: 1.5, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, cursor: 'pointer' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '50%', bgcolor: 'primary.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <PersonIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography fontWeight={700} variant="body2">{member.username}</Typography>
            <Typography variant="caption" color="text.secondary">{member.clients.length} client{member.clients.length !== 1 ? 's' : ''}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
          {member.overdue > 0 && (
            <Chip label={`${member.overdue} overdue`} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', fontWeight: 700, fontSize: 10, height: 22 }} />
          )}
          {member.dueSoon > 0 && (
            <Chip label={`${member.dueSoon} due soon`} size="small" sx={{ bgcolor: '#f9a82520', color: '#f9a825', fontWeight: 700, fontSize: 10, height: 22 }} />
          )}
          {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </Box>
      </Box>

      <Collapse in={open}>
        <Divider />
        <List disablePadding>
          {member.clients.map((client, i) => {
            const latest = client.meetings?.sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date))[0]
            const status = getFollowUpStatus(latest?.next_followup_date)
            return (
              <ListItem
                key={client.id}
                button
                divider={i < member.clients.length - 1}
                onClick={() => navigate(`/clients/${client.id}`)}
                sx={{ px: 2, py: 1 }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight={600}>{client.name}</Typography>
                      <Chip
                        label={STATUS_LABELS[status] || 'No meetings'}
                        size="small"
                        sx={{ bgcolor: STATUS_COLORS[status] + '20', color: STATUS_COLORS[status], fontWeight: 700, fontSize: 10, height: 20 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {client.title} · {client.accounts?.name}
                      {latest?.meeting_date ? ` · Last met ${formatRelative(latest.meeting_date)}` : ''}
                    </Typography>
                  }
                />
              </ListItem>
            )
          })}
          {member.clients.length === 0 && (
            <ListItem sx={{ px: 2 }}>
              <ListItemText primary={<Typography variant="body2" color="text.secondary">No clients assigned</Typography>} />
            </ListItem>
          )}
        </List>
      </Collapse>
    </Box>
  )
}
