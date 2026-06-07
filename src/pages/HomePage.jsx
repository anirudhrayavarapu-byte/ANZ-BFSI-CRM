import { useState } from 'react'
import { Box, AppBar, Toolbar, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useFollowUps } from '../hooks/useFollowUps'
import SearchBar from '../components/home/SearchBar'
import FollowUpsList from '../components/home/FollowUpsList'
import ActionCards from '../components/home/ActionCards'
import { formatDate } from '../utils/dateFormat'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { followUps, loading } = useFollowUps()
  const [search, setSearch] = useState('')

  const today = formatDate(new Date().toISOString().split('T')[0])

  function handleSearchFocus() {
    if (search.trim()) navigate(`/clients?q=${encodeURIComponent(search)}`)
    else navigate('/clients')
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#1a237e', pt: 'var(--safe-top)' }}>
        <Toolbar sx={{ flexDirection: 'column', alignItems: 'stretch', pb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} fontSize={17} color="#fff">
                {getGreeting()}, {profile?.username ?? ''}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>{today}</Typography>
            </Box>
          </Box>
          <SearchBar value={search} onChange={setSearch} onFocus={handleSearchFocus} />
        </Toolbar>
      </AppBar>

      <FollowUpsList followUps={followUps} loading={loading} />
      <ActionCards />
      <Box sx={{ pb: 'calc(var(--safe-bottom) + 16px)' }} />
    </Box>
  )
}
