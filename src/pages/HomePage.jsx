import { useState } from 'react'
import { Box, AppBar, Toolbar, Typography, Avatar } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useFollowUps } from '../hooks/useFollowUps'
import SearchBar from '../components/home/SearchBar'
import FollowUpsList from '../components/home/FollowUpsList'
import ActionCards from '../components/home/ActionCards'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFirstName(username) {
  if (!username) return ''
  return username.split(/[.\s_]/)[0].charAt(0).toUpperCase() + username.split(/[.\s_]/)[0].slice(1)
}

function getInitials(username) {
  if (!username) return '?'
  const parts = username.split(/[.\s_]/)
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : username.slice(0, 2).toUpperCase()
}

export default function HomePage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { followUps, loading } = useFollowUps()
  const [search, setSearch] = useState('')

  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })

  function handleSearchFocus() {
    if (search.trim()) navigate(`/clients?q=${encodeURIComponent(search)}`)
    else navigate('/clients')
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{
        background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 100%)',
        pt: 'var(--safe-top)',
        boxShadow: '0 4px 20px rgba(26,35,126,0.3)',
      }}>
        <Toolbar sx={{ flexDirection: 'column', alignItems: 'stretch', pb: 2, pt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, mb: 0.25 }}>
                {today}
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', fontSize: 20, letterSpacing: '-0.4px' }}>
                {getGreeting()},
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 20, letterSpacing: '-0.4px' }}>
                {getFirstName(profile?.username)} 👋
              </Typography>
            </Box>
            <Avatar sx={{
              width: 42, height: 42, mt: 0.5,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              fontWeight: 700, fontSize: 14, color: '#fff',
              backdropFilter: 'blur(8px)',
            }}>
              {getInitials(profile?.username)}
            </Avatar>
          </Box>
          <SearchBar value={search} onChange={setSearch} onFocus={handleSearchFocus} />
        </Toolbar>
      </AppBar>

      <FollowUpsList followUps={followUps} loading={loading} />
      <ActionCards />
      <Box sx={{ pb: 'calc(var(--safe-bottom) + 24px)' }} />
    </Box>
  )
}
