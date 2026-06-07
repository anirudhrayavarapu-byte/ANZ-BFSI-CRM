import { Box, Typography, Divider } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import BusinessIcon from '@mui/icons-material/Business'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import InlineEditField from './InlineEditField'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'

function InfoRow({ icon, label, value }) {
  if (!value) return null
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
      <Box sx={{ color: 'text.disabled', mt: 0.2 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</Typography>
        <Typography variant="body2" sx={{ mt: 0.25 }}>{value}</Typography>
      </Box>
    </Box>
  )
}

export default function ProfileTab({ client }) {
  const [email, setEmail] = useState(client?.email ?? '')
  const [phone, setPhone] = useState(client?.phone ?? '')

  async function saveField(field, value) {
    await supabase.from('clients').update({ [field]: value }).eq('id', client.id)
  }

  if (!client) return null

  return (
    <Box sx={{ px: 2, pt: 2 }}>
      <Typography variant="overline" color="text.secondary" fontWeight={700}>Contact</Typography>
      <Box sx={{ mt: 1, mb: 2 }}>
        <InlineEditField
          label="Email"
          value={email}
          placeholder="Add email..."
          onSave={val => { setEmail(val); saveField('email', val) }}
        />
        <InlineEditField
          label="Phone"
          value={phone}
          placeholder="Add phone..."
          onSave={val => { setPhone(val); saveField('phone', val) }}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="overline" color="text.secondary" fontWeight={700}>Account</Typography>
      <Box sx={{ mt: 1 }}>
        <InfoRow icon={<BusinessIcon fontSize="small" />} label="Company" value={client.accounts?.name} />
        <InfoRow icon={<PersonIcon fontSize="small" />} label="Industry" value={client.accounts?.industry} />
        <InfoRow icon={<PersonIcon fontSize="small" />} label="Assigned to" value={client.users?.username} />
      </Box>

      <Divider sx={{ mb: 2, mt: 1 }} />

      <Typography variant="overline" color="text.secondary" fontWeight={700}>Role</Typography>
      <Box sx={{ mt: 1 }}>
        <InfoRow icon={<PersonIcon fontSize="small" />} label="Title" value={client.title} />
      </Box>
    </Box>
  )
}
