import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, InputBase, CircularProgress, Typography, Fab } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import AppShell from '../components/AppShell'
import ClientListItem from '../components/clients/ClientListItem'
import { useClients } from '../hooks/useClients'

export default function ClientListPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const { clients, loading } = useClients(search)

  return (
    <AppShell title="My Clients">
      <Box sx={{
        position: 'sticky', top: 56, zIndex: 10,
        bgcolor: '#fff',
        borderBottom: '1px solid #f0f2f8',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1.25 }}>
          <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
          <InputBase
            placeholder="Search by name, title, or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            sx={{ flex: 1, fontSize: 15 }}
            inputProps={{ 'aria-label': 'Search clients' }}
          />
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ pt: 8, textAlign: 'center' }}><CircularProgress /></Box>
      ) : clients.length === 0 ? (
        <Box sx={{ pt: 8, textAlign: 'center', px: 3 }}>
          <Typography sx={{ fontSize: 36, mb: 1 }}>🔍</Typography>
          <Typography fontWeight={700} color="text.secondary">No clients found</Typography>
          <Typography variant="caption" color="text.disabled">Try a different name or company</Typography>
        </Box>
      ) : (
        <Box sx={{ bgcolor: '#fff', mb: 10 }}>
          {clients.map(client => (
            <ClientListItem
              key={client.id}
              client={client}
              onClick={() => navigate(`/clients/${client.id}`)}
            />
          ))}
        </Box>
      )}

      <Fab
        color="primary"
        aria-label="Add client"
        sx={{ position: 'fixed', bottom: 'calc(var(--safe-bottom) + 16px)', right: 16 }}
        onClick={() => {}}
      >
        <AddIcon />
      </Fab>
    </AppShell>
  )
}
