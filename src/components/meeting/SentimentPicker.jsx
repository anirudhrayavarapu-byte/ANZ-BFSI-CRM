import { Box, Typography } from '@mui/material'

const OPTIONS = [
  { value: 'very_negative', emoji: '😞', label: 'Very bad' },
  { value: 'negative', emoji: '🙁', label: 'Bad' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'positive', emoji: '😊', label: 'Good' },
  { value: 'very_positive', emoji: '🤩', label: 'Great' },
]

export default function SentimentPicker({ value, onChange }) {
  return (
    <Box>
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
        Client Sentiment
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, mt: 1, justifyContent: 'space-between' }}>
        {OPTIONS.map(o => (
          <Box
            key={o.value}
            onClick={() => onChange(o.value)}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              py: 1,
              borderRadius: 2,
              border: '2px solid',
              borderColor: value === o.value ? 'primary.main' : 'transparent',
              bgcolor: value === o.value ? 'primary.50' : '#f5f5f5',
              transition: 'all 0.15s',
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <Typography sx={{ fontSize: 24, lineHeight: 1 }}>{o.emoji}</Typography>
            <Typography variant="caption" sx={{ fontSize: 9, mt: 0.5, color: 'text.secondary', textAlign: 'center', lineHeight: 1.2 }}>
              {o.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
