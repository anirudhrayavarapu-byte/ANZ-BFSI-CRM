import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import { useNavigate, useLocation } from 'react-router-dom'

export default function AppShell({ title, children, hideBack = false, action }) {
  const navigate = useNavigate()
  const location = useLocation()
  const canGoBack = location.key !== 'default' && !hideBack

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', bgcolor: 'var(--c-surface)' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'var(--c-hero)',
          pt: 'var(--safe-top)',
          borderBottom: '1px solid var(--c-hero-border)',
        }}
      >
        <Toolbar sx={{ minHeight: 56, gap: 1 }}>
          {canGoBack && (
            <IconButton
              edge="start"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              sx={{
                mr: 0.5, color: 'var(--c-hero-text)',
                width: 36, height: 36, borderRadius: '10px',
                bgcolor: 'oklch(100% 0 0 / 0.08)',
                '&:active': { bgcolor: 'oklch(100% 0 0 / 0.14)' },
                transition: 'background 0.12s',
                touchAction: 'manipulation',
              }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 15 }} />
            </IconButton>
          )}
          <Typography
            variant="h6"
            fontWeight={700}
            fontSize={17}
            noWrap
            sx={{ flex: 1, color: 'var(--c-hero-text)', letterSpacing: '-0.3px' }}
          >
            {title}
          </Typography>
          {action}
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, overflow: 'auto', pb: 'var(--safe-bottom)' }}>
        {children}
      </Box>
    </Box>
  )
}
