import { Box, Typography, TextField } from '@mui/material'
import { useState } from 'react'

const PRESET_TOPICS = ['Strategy', 'Pricing', 'Product', 'Relationship', 'Risk', 'Operations', 'Custom']

export default function TopicChips({ value, onChange }) {
  const [showCustom, setShowCustom] = useState(false)
  const [customText, setCustomText] = useState('')

  function toggle(topic) {
    if (topic === 'Custom') { setShowCustom(s => !s); return }
    onChange(value.includes(topic) ? value.filter(t => t !== topic) : [...value, topic])
  }

  function addCustom() {
    const t = customText.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setCustomText('')
  }

  const customActive = showCustom || value.some(t => !PRESET_TOPICS.includes(t))

  return (
    <Box>
      <Typography sx={{
        fontSize: 11, fontWeight: 700, letterSpacing: '1px',
        textTransform: 'uppercase', color: 'var(--c-text-2)', mb: 1.5,
      }}>
        Topics discussed
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {PRESET_TOPICS.map(t => {
          const active = value.includes(t) || (t === 'Custom' && customActive)
          return (
            <Box
              key={t}
              onClick={() => toggle(t)}
              sx={{
                px: 1.75, py: 0.75,
                borderRadius: '10px',
                cursor: 'pointer',
                bgcolor: active ? 'var(--c-hero)' : 'var(--c-surface)',
                border: '1px solid',
                borderColor: active ? 'var(--c-hero)' : 'var(--c-border)',
                transition: 'all 0.12s',
                '&:active': { transform: 'scale(0.95)' },
              }}
            >
              <Typography sx={{
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--c-hero-text)' : 'var(--c-text)',
                letterSpacing: '-0.1px',
              }}>
                {t}
              </Typography>
            </Box>
          )
        })}
      </Box>

      {showCustom && (
        <TextField
          size="small" fullWidth autoFocus
          placeholder="Type topic, press Enter"
          value={customText}
          onChange={e => setCustomText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
          onBlur={addCustom}
          sx={{ mt: 1.5 }}
        />
      )}

      {value.filter(t => !PRESET_TOPICS.includes(t)).map(t => (
        <Box
          key={t}
          onClick={() => onChange(value.filter(x => x !== t))}
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            px: 1.5, py: 0.5, mt: 1, mr: 1,
            borderRadius: '8px',
            bgcolor: 'var(--c-hero)',
            cursor: 'pointer',
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'var(--c-hero-text)' }}>{t}</Typography>
          <Typography sx={{ fontSize: 11, color: 'var(--c-hero-muted)' }}>×</Typography>
        </Box>
      ))}
    </Box>
  )
}
