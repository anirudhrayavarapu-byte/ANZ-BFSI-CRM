import { InputBase, Box } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export default function SearchBar({ value, onChange, onFocus }) {
  return (
    <Box
      onClick={onFocus}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.25,
        bgcolor: 'oklch(100% 0 0 / 0.09)',
        border: '1px solid oklch(100% 0 0 / 0.12)',
        borderRadius: '12px',
        px: 1.75, py: 1.1,
        cursor: 'text',
        transition: 'background 0.15s',
        '&:hover': { bgcolor: 'oklch(100% 0 0 / 0.12)' },
        '&:active': { bgcolor: 'oklch(100% 0 0 / 0.15)' },
      }}
    >
      <SearchIcon sx={{ color: 'var(--c-hero-muted)', fontSize: 18, flexShrink: 0 }} />
      <InputBase
        placeholder="Search clients..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        sx={{
          flex: 1,
          fontSize: 14,
          color: 'var(--c-hero-text)',
          fontFamily: "'Figtree', system-ui, sans-serif",
          '& input::placeholder': { color: 'var(--c-hero-muted)', opacity: 1 },
        }}
        inputProps={{ 'aria-label': 'Search clients' }}
      />
    </Box>
  )
}
