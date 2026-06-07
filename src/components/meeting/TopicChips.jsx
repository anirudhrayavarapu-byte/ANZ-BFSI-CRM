import { Box, Chip, Typography, TextField } from '@mui/material'
import { useState } from 'react'

const PRESET_TOPICS = ['Strategy', 'Pricing', 'Product', 'Relationship', 'Risk', 'Operations', 'Custom']

export default function TopicChips({ value, onChange }) {
  const [showCustom, setShowCustom] = useState(false)
  const [customText, setCustomText] = useState('')

  function toggle(topic) {
    if (topic === 'Custom') {
      setShowCustom(s => !s)
      return
    }
    const next = value.includes(topic) ? value.filter(t => t !== topic) : [...value, topic]
    onChange(next)
  }

  function addCustom() {
    const trimmed = customText.trim()
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed])
    setCustomText('')
  }

  return (
    <Box>
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
        Topics Discussed
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {PRESET_TOPICS.map(t => (
          <Chip
            key={t}
            label={t}
            onClick={() => toggle(t)}
            variant={value.includes(t) || (t === 'Custom' && showCustom) ? 'filled' : 'outlined'}
            color={value.includes(t) || (t === 'Custom' && showCustom) ? 'primary' : 'default'}
            size="medium"
            sx={{ fontWeight: 500 }}
          />
        ))}
      </Box>
      {showCustom && (
        <TextField
          size="small"
          fullWidth
          autoFocus
          placeholder="Type custom topic and press Enter"
          value={customText}
          onChange={e => setCustomText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
          onBlur={addCustom}
          sx={{ mt: 1.5 }}
        />
      )}
      {value.filter(t => !PRESET_TOPICS.includes(t)).map(t => (
        <Chip key={t} label={t} onDelete={() => onChange(value.filter(x => x !== t))} size="small" sx={{ mt: 1, mr: 0.5 }} />
      ))}
    </Box>
  )
}
