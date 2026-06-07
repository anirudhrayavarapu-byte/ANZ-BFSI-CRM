import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import { useNavigate, useLocation } from 'react-router-dom'

export default function AppShell({ title, children, hideBack = false, action }) {
  const navigate = useNavigate()
  const location = useLocation()
  const canGoBack = location.key !== 'default' && !hideBack

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 100%)',
          pt: 'var(--safe-top)',
          boxShadow: '0 2px 12px rgba(26,35,126,0.25)',
        }}
      >
        <Toolbar sx={{ minHeight: 56, gap: 1 }}>
          {canGoBack && (
            <IconButton
              edge="start" color="inherit"
              onClick={() => navigate(-1)}
              sx={{ mr: 0.5, touchAction: 'manipulation', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '10px', width: 36, height: 36 }}
              aria-label="Go back"
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={700} fontSize={17} noWrap sx={{ flex: 1, letterSpacing: '-0.3px' }}>
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
