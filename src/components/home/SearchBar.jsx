import { InputBase, Box } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export default function SearchBar({ value, onChange, onFocus }) {
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        bgcolor: 'rgba(255,255,255,0.15)',
        borderRadius: 3, px: 1.5, py: 0.75,
        mt: 1.5, cursor: 'text',
      }}
      onClick={onFocus}
    >
      <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }} />
      <InputBase
        placeholder="Find a client..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        sx={{
          color: '#fff', flex: 1, fontSize: 15,
          '& input::placeholder': { color: 'rgba(255,255,255,0.6)', opacity: 1 },
        }}
        inputProps={{ 'aria-label': 'Search clients' }}
      />
    </Box>
  )
}
