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
  const part = username.split(/[.\s_@]/)[0]
  return part.charAt(0).toUpperCase() + part.slice(1)
}

function getInitials(username) {
  if (!username) return '?'
  const parts = username.split(/[.\s_@]/).filter(Boolean)
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

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'var(--c-surface)' }}>
      {/* Dark hero header */}
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: 'var(--c-hero)',
        pt: 'var(--safe-top)',
        borderBottom: '1px solid var(--c-hero-border)',
      }}>
        <Toolbar sx={{ flexDirection: 'column', alignItems: 'stretch', pt: 1.5, pb: 2, px: 2.5 }}>
          {/* Top row: date + avatar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{
              color: 'var(--c-hero-muted)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
            }}>
              {today}
            </Typography>
            <Avatar sx={{
              width: 34, height: 34,
              bgcolor: 'var(--c-hero-raised)',
              border: '1px solid var(--c-hero-border)',
              color: 'var(--c-hero-text)',
              fontSize: 12,
              fontWeight: 800,
            }}>
              {getInitials(profile?.username)}
            </Avatar>
          </Box>

          {/* Greeting */}
          <Typography sx={{
            color: 'var(--c-hero-muted)',
            fontSize: 15,
            fontWeight: 400,
            lineHeight: 1,
            mb: 0.25,
          }}>
            {getGreeting()},
          </Typography>
          <Typography sx={{
            color: 'var(--c-hero-text)',
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-1px',
            lineHeight: 1.1,
            mb: 2,
          }}>
            {getFirstName(profile?.username)}
          </Typography>

          <SearchBar value={search} onChange={setSearch} onFocus={() => {
            if (search.trim()) navigate(`/clients?q=${encodeURIComponent(search)}`)
            else navigate('/clients')
          }} />
        </Toolbar>
      </AppBar>

      {/* White content area */}
      <Box sx={{ bgcolor: 'var(--c-surface)', pb: 'calc(var(--safe-bottom) + 32px)' }}>
        <FollowUpsList followUps={followUps} loading={loading} />
        <ActionCards />
      </Box>
    </Box>
  )
}
