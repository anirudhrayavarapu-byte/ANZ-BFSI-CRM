import { Box, Typography } from '@mui/material'

const OPTIONS = [
  { value: 'very_negative', emoji: '😞', label: 'Very bad' },
  { value: 'negative',      emoji: '🙁', label: 'Bad'      },
  { value: 'neutral',       emoji: '😐', label: 'Neutral'  },
  { value: 'positive',      emoji: '😊', label: 'Good'     },
  { value: 'very_positive', emoji: '🤩', label: 'Great'    },
]

export default function SentimentPicker({ value, onChange }) {
  return (
    <Box>
      <Typography sx={{
        fontSize: 11, fontWeight: 700, letterSpacing: '1px',
        textTransform: 'uppercase', color: 'var(--c-text-2)',
        mb: 1.5,
      }}>
        How did it go?
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        {OPTIONS.map(o => {
          const selected = value === o.value
          return (
            <Box
              key={o.value}
              onClick={() => onChange(o.value)}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.75,
                py: 1.25,
                borderRadius: '14px',
                cursor: 'pointer',
                bgcolor: selected ? 'var(--c-hero)' : 'var(--c-surface)',
                transition: 'background 0.15s, transform 0.1s',
                '&:active': { transform: 'scale(0.93)' },
              }}
            >
              <Typography sx={{ fontSize: 26, lineHeight: 1 }}>{o.emoji}</Typography>
              <Typography sx={{
                fontSize: 9.5,
                fontWeight: selected ? 700 : 500,
                color: selected ? 'var(--c-hero-text)' : 'var(--c-text-3)',
                letterSpacing: '0.2px',
                textTransform: 'uppercase',
              }}>
                {o.label}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
