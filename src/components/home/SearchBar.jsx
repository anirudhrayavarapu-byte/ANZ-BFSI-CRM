import { InputBase, Box } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export default function SearchBar({ value, onChange, onFocus }) {
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.25,
        bgcolor: 'rgba(255,255,255,0.14)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '14px', px: 1.75, py: 1,
        cursor: 'text',
        transition: 'background 0.2s',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
      }}
      onClick={onFocus}
    >
      <SearchIcon sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 19 }} />
      <InputBase
        placeholder="Search clients..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        sx={{
          color: '#fff', flex: 1, fontSize: 15,
          '& input::placeholder': { color: 'rgba(255,255,255,0.55)', opacity: 1 },
        }}
        inputProps={{ 'aria-label': 'Search clients' }}
      />
    </Box>
  )
}
