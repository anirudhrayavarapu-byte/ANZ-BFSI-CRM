import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import { useNavigate, useLocation } from 'react-router-dom'

export default function AppShell({ title, children, hideBack = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const canGoBack = location.key !== 'default' && !hideBack

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: '#1a237e', pt: 'var(--safe-top)' }}
      >
        <Toolbar sx={{ minHeight: 56 }}>
          {canGoBack && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate(-1)}
              sx={{ mr: 1, touchAction: 'manipulation' }}
              aria-label="Go back"
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={700} fontSize={17} noWrap>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, overflow: 'auto', pb: 'var(--safe-bottom)' }}>
        {children}
      </Box>
    </Box>
  )
}
