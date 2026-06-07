import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useClientStore } from '../../store/clientStore'
import InlineEditField from './InlineEditField'

const FIELDS = [
  { key: 'hot_buttons', label: 'Hot Buttons', placeholder: 'What keeps them up at night...' },
  { key: 'key_focus_areas', label: 'Key Focus Areas', placeholder: 'Strategic priorities...' },
  { key: 'likes', label: 'Likes', placeholder: 'What they respond well to...' },
  { key: 'dislikes', label: 'Dislikes', placeholder: 'What to avoid...' },
  { key: 'notes', label: 'Notes', placeholder: 'General relationship notes...' },
]

export default function IntelTab({ clientId }) {
  const { details, fetchDetails, updateDetail } = useClientStore()
  const data = details[clientId]
  const loaded = clientId in details

  useEffect(() => { if (clientId) fetchDetails(clientId) }, [clientId])

  if (!loaded) {
    return <Box sx={{ pt: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
  }

  return (
    <Box sx={{ px: 2, pt: 2 }}>
      {FIELDS.map(f => (
        <InlineEditField
          key={f.key}
          label={f.label}
          value={data?.[f.key] ?? ''}
          placeholder={f.placeholder}
          onSave={val => updateDetail(clientId, f.key, val)}
        />
      ))}
    </Box>
  )
}
