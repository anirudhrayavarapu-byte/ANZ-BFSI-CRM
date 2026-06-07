import { useState } from 'react'
import { Box, Typography, TextField, Button } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

export default function InlineEditField({ label, value, onSave, placeholder = 'Tap to add...' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')

  function handleSave() {
    onSave(draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {label}
        </Typography>
        <TextField
          multiline fullWidth autoFocus minRows={2}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          sx={{ mt: 0.5 }}
          size="small"
        />
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button size="small" variant="contained" onClick={handleSave} sx={{ minHeight: 36 }}>Save</Button>
          <Button size="small" onClick={() => { setDraft(value ?? ''); setEditing(false) }} sx={{ minHeight: 36 }}>Cancel</Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      onClick={() => { setDraft(value ?? ''); setEditing(true) }}
      sx={{ mb: 2.5, cursor: 'pointer', '&:active': { opacity: 0.7 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {label}
        </Typography>
        <EditIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
      </Box>
      <Typography variant="body2" sx={{ mt: 0.5, color: value ? 'text.primary' : 'text.disabled', lineHeight: 1.6 }}>
        {value || placeholder}
      </Typography>
    </Box>
  )
}
