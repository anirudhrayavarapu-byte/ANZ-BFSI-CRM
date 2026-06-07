# TM BFSI CRM — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full mobile-first PWA for the TM BFSI sales team — home screen, client card (Intel/Meetings/Profile tabs), quick meeting log, and manager team view — on top of the existing React + Supabase + MUI scaffold.

**Architecture:** React 19 SPA with React Router v7 for navigation, Zustand v5 for client/meeting state, Supabase for all data (RLS enforced at DB layer). Every screen invokes the impeccable skill for design polish. Navigation is home card grid + back-button stack (no tab bar).

**Tech Stack:** React 19, Vite 8, MUI v9, Supabase JS v2, Zustand v5, React Router v7, Vitest + React Testing Library

---

## File Map

### New files to create
```
src/utils/followUpStatus.js        -- urgency classification (overdue/today/upcoming)
src/utils/dateFormat.js            -- human-readable dates
src/hooks/useFollowUps.js          -- fetch + classify follow-ups for current user
src/hooks/useClients.js            -- fetch accessible client list
src/hooks/useMeetings.js           -- fetch meetings for a client
src/hooks/useTeam.js               -- fetch team members + stats (manager only)
src/store/clientStore.js           -- upsert client_details (optimistic)
src/store/meetingStore.js          -- create meeting (optimistic)
src/components/AppShell.jsx        -- top bar with back button + title
src/components/home/SearchBar.jsx  -- header search input
src/components/home/FollowUpsList.jsx -- follow-up rows on home screen
src/components/home/ActionCards.jsx   -- My Clients / Log Meeting / Team View cards
src/components/clients/ClientListItem.jsx -- single row in client list
src/components/clientcard/InlineEditField.jsx -- tap-to-edit text field
src/components/clientcard/IntelTab.jsx        -- hot buttons, likes, dislikes (editable)
src/components/clientcard/MeetingsTab.jsx     -- meeting history list
src/components/clientcard/ProfileTab.jsx      -- contact + account info
src/components/meeting/SentimentPicker.jsx    -- emoji scale (5 options)
src/components/meeting/TopicChips.jsx         -- multi-select topic chips
src/components/meeting/MeetingForm.jsx        -- full log form (quick + expandable)
src/components/team/TeamMemberCard.jsx        -- team member row with stats
src/pages/HomePage.jsx             -- replaces DashboardPage
src/pages/ClientListPage.jsx       -- searchable client list
src/pages/ClientCardPage.jsx       -- tabbed client card
src/pages/LogMeetingPage.jsx       -- meeting log entry
src/pages/TeamViewPage.jsx         -- manager team health
public/manifest.json               -- PWA manifest
public/sw.js                       -- service worker
```

### Files to modify
```
src/App.jsx       -- add all routes, remove placeholder dashboard route
src/index.css     -- strip Vite defaults, add safe-area insets
src/main.jsx      -- register service worker
package.json      -- add vitest + @testing-library/react
vite.config.js    -- add test config
```

### Files to delete
```
src/App.css
src/pages/DashboardPage.jsx   -- replaced by HomePage.jsx
src/assets/react.svg
src/assets/vite.svg
src/assets/hero.png
```

---

## Task 1: Setup — strip Vite defaults, install test framework

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`
- Modify: `src/index.css`
- Delete: `src/App.css`, `src/pages/DashboardPage.jsx`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`
- Create: `src/test/setup.js`

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Expected: packages added, no errors.

- [ ] **Step 2: Update vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
```

- [ ] **Step 3: Create test setup file**

```js
// src/test/setup.js
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Add test script to package.json**

Add to the `"scripts"` block:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 5: Replace index.css**

```css
/* src/index.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', 'Roboto', sans-serif;
  background: #f5f6fa;
  -webkit-font-smoothing: antialiased;
}

/* Safe area insets for iPhone notch / Android nav bar */
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

#root {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 6: Delete unused files**

```bash
rm src/App.css src/pages/DashboardPage.jsx src/assets/react.svg src/assets/vite.svg src/assets/hero.png
```

- [ ] **Step 7: Run build to verify no import errors**

```bash
npm run build
```

Expected: build succeeds, no import-not-found errors.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "chore: strip vite defaults, add vitest"
```

---

## Task 2: Utility functions — followUpStatus and dateFormat

**Files:**
- Create: `src/utils/followUpStatus.js`
- Create: `src/utils/dateFormat.js`
- Create: `src/utils/followUpStatus.test.js`
- Create: `src/utils/dateFormat.test.js`

- [ ] **Step 1: Write failing tests for followUpStatus**

```js
// src/utils/followUpStatus.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getFollowUpStatus, sortByUrgency } from './followUpStatus'

describe('getFollowUpStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-07'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns overdue for dates in the past', () => {
    expect(getFollowUpStatus('2026-06-01')).toBe('overdue')
  })

  it('returns today for today\'s date', () => {
    expect(getFollowUpStatus('2026-06-07')).toBe('today')
  })

  it('returns upcoming for dates within 7 days', () => {
    expect(getFollowUpStatus('2026-06-10')).toBe('upcoming')
  })

  it('returns future for dates beyond 7 days', () => {
    expect(getFollowUpStatus('2026-07-01')).toBe('future')
  })

  it('returns none for null', () => {
    expect(getFollowUpStatus(null)).toBe('none')
  })
})

describe('sortByUrgency', () => {
  it('sorts overdue before today before upcoming', () => {
    const items = [
      { next_followup_date: '2026-06-10', label: 'upcoming' },
      { next_followup_date: '2026-06-01', label: 'overdue' },
      { next_followup_date: '2026-06-07', label: 'today' },
    ]
    const sorted = sortByUrgency(items)
    expect(sorted[0].label).toBe('overdue')
    expect(sorted[1].label).toBe('today')
    expect(sorted[2].label).toBe('upcoming')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm run test:run -- src/utils/followUpStatus.test.js
```

Expected: FAIL — "followUpStatus not found"

- [ ] **Step 3: Implement followUpStatus.js**

```js
// src/utils/followUpStatus.js
const URGENCY_ORDER = { overdue: 0, today: 1, upcoming: 2, future: 3, none: 4 }

export function getFollowUpStatus(dateStr) {
  if (!dateStr) return 'none'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  const diffDays = Math.round((date - today) / 86400000)
  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 7) return 'upcoming'
  return 'future'
}

export function sortByUrgency(items, dateKey = 'next_followup_date') {
  return [...items].sort((a, b) => {
    const sa = URGENCY_ORDER[getFollowUpStatus(a[dateKey])]
    const sb = URGENCY_ORDER[getFollowUpStatus(b[dateKey])]
    return sa - sb
  })
}

export const STATUS_LABELS = {
  overdue: 'Overdue',
  today: 'Due today',
  upcoming: 'Due soon',
  future: 'On track',
  none: '',
}

export const STATUS_COLORS = {
  overdue: '#d32f2f',
  today: '#f57c00',
  upcoming: '#f9a825',
  future: '#388e3c',
  none: '#9e9e9e',
}
```

- [ ] **Step 4: Write failing tests for dateFormat**

```js
// src/utils/dateFormat.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatDate, formatRelative } from './dateFormat'

describe('formatDate', () => {
  it('formats a date string to readable format', () => {
    expect(formatDate('2026-06-07')).toBe('7 Jun 2026')
  })

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('')
  })
})

describe('formatRelative', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-07'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns "today" for today', () => {
    expect(formatRelative('2026-06-07')).toBe('Today')
  })

  it('returns "yesterday" for yesterday', () => {
    expect(formatRelative('2026-06-06')).toBe('Yesterday')
  })

  it('returns "X days ago" for recent past', () => {
    expect(formatRelative('2026-06-03')).toBe('4 days ago')
  })

  it('returns formatted date for older dates', () => {
    expect(formatRelative('2026-01-01')).toBe('1 Jan 2026')
  })
})
```

- [ ] **Step 5: Run tests — verify they fail**

```bash
npm run test:run -- src/utils/dateFormat.test.js
```

Expected: FAIL

- [ ] **Step 6: Implement dateFormat.js**

```js
// src/utils/dateFormat.js
export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export function formatRelative(dateStr) {
  if (!dateStr) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today - date) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays} days ago`
  return formatDate(dateStr)
}
```

- [ ] **Step 7: Run all tests — both should pass**

```bash
npm run test:run
```

Expected: all PASS

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add followUpStatus and dateFormat utilities"
```

---

## Task 3: AppShell and routing

**Files:**
- Create: `src/components/AppShell.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create AppShell**

```jsx
// src/components/AppShell.jsx
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
        sx={{
          bgcolor: '#1a237e',
          pt: 'var(--safe-top)',
        }}
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
```

- [ ] **Step 2: Update App.jsx with all routes**

```jsx
// src/App.jsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ClientListPage from './pages/ClientListPage'
import ClientCardPage from './pages/ClientCardPage'
import LogMeetingPage from './pages/LogMeetingPage'
import TeamViewPage from './pages/TeamViewPage'

const theme = createTheme({
  palette: {
    primary: { main: '#1a237e' },
    secondary: { main: '#0288d1' },
    background: { default: '#f5f6fa' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 10, minHeight: 44 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', minHeight: 44 },
      },
    },
  },
})

export default function App() {
  const { setUser, setLoading, fetchProfile } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientListPage /></ProtectedRoute>} />
          <Route path="/clients/:id" element={<ProtectedRoute><ClientCardPage /></ProtectedRoute>} />
          <Route path="/log-meeting" element={<ProtectedRoute><LogMeetingPage /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute allowedRoles={['manager','super_manager']}><TeamViewPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
```

- [ ] **Step 3: Create placeholder pages so routing doesn't crash**

```jsx
// src/pages/ClientListPage.jsx
export default function ClientListPage() { return <div>Clients</div> }
```

```jsx
// src/pages/ClientCardPage.jsx
export default function ClientCardPage() { return <div>Client Card</div> }
```

```jsx
// src/pages/LogMeetingPage.jsx
export default function LogMeetingPage() { return <div>Log Meeting</div> }
```

```jsx
// src/pages/TeamViewPage.jsx
export default function TeamViewPage() { return <div>Team View</div> }
```

```jsx
// src/pages/HomePage.jsx
export default function HomePage() { return <div>Home</div> }
```

- [ ] **Step 4: Build to verify routing compiles**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add AppShell and full route structure"
```

---

## Task 4: Hooks — useFollowUps and useClients

**Files:**
- Create: `src/hooks/useFollowUps.js`
- Create: `src/hooks/useClients.js`

These hooks query Supabase. RLS ensures users only see their accessible data.

- [ ] **Step 1: Create useFollowUps**

```js
// src/hooks/useFollowUps.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getFollowUpStatus, sortByUrgency } from '../utils/followUpStatus'

export function useFollowUps() {
  const [followUps, setFollowUps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const sevenDaysOut = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('meetings')
        .select(`
          id, next_followup_date, client_id,
          clients ( id, name, account_id, accounts ( name ) )
        `)
        .not('next_followup_date', 'is', null)
        .lte('next_followup_date', sevenDaysOut)
        .order('next_followup_date', { ascending: true })

      if (error) { setError(error); setLoading(false); return }

      // Keep only the most recent meeting per client that has a pending follow-up
      const seen = new Set()
      const unique = []
      for (const row of data) {
        if (!seen.has(row.client_id)) {
          seen.add(row.client_id)
          unique.push({
            ...row,
            status: getFollowUpStatus(row.next_followup_date),
          })
        }
      }

      setFollowUps(sortByUrgency(unique, 'next_followup_date').filter(f => f.status !== 'future'))
      setLoading(false)
    }
    fetch()
  }, [])

  return { followUps, loading, error }
}
```

- [ ] **Step 2: Create useClients**

```js
// src/hooks/useClients.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getFollowUpStatus, sortByUrgency } from '../utils/followUpStatus'

export function useClients(searchQuery = '') {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('clients')
      .select(`
        id, name, title, email, phone, assigned_to,
        accounts ( id, name, strategic_importance ),
        meetings ( next_followup_date, meeting_date )
      `)
      .eq('is_active', true)
      .order('name')

    if (searchQuery.trim()) {
      query = query.or(`name.ilike.%${searchQuery}%,accounts.name.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query
    if (error) { setError(error); setLoading(false); return }

    const enriched = data.map(c => {
      const meetings = c.meetings ?? []
      const latest = meetings.sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date))[0]
      const nextFollowUp = latest?.next_followup_date ?? null
      return {
        ...c,
        lastMeetingDate: latest?.meeting_date ?? null,
        nextFollowUpDate: nextFollowUp,
        followUpStatus: getFollowUpStatus(nextFollowUp),
      }
    })

    setClients(sortByUrgency(enriched, 'nextFollowUpDate'))
    setLoading(false)
  }, [searchQuery])

  useEffect(() => { fetchClients() }, [fetchClients])

  return { clients, loading, error, refetch: fetchClients }
}
```

- [ ] **Step 3: Build to verify no syntax errors**

```bash
npm run build
```

Expected: success.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add useFollowUps and useClients hooks"
```

---

## Task 5: Home screen

**Files:**
- Create: `src/components/home/SearchBar.jsx`
- Create: `src/components/home/FollowUpsList.jsx`
- Create: `src/components/home/ActionCards.jsx`
- Modify: `src/pages/HomePage.jsx`

- [ ] **Step 1: Create SearchBar**

```jsx
// src/components/home/SearchBar.jsx
import { InputBase, Box } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export default function SearchBar({ value, onChange, onFocus }) {
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        bgcolor: 'rgba(255,255,255,0.15)',
        borderRadius: 3, px: 1.5, py: 0.75,
        mt: 1.5,
        cursor: 'text',
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
          '::placeholder': { color: 'rgba(255,255,255,0.6)' },
          '& input::placeholder': { color: 'rgba(255,255,255,0.6)' },
        }}
        inputProps={{ 'aria-label': 'Search clients' }}
      />
    </Box>
  )
}
```

- [ ] **Step 2: Create FollowUpsList**

```jsx
// src/components/home/FollowUpsList.jsx
import { Box, Typography, Chip, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/followUpStatus'

export default function FollowUpsList({ followUps, loading }) {
  const navigate = useNavigate()
  if (loading) return <Box sx={{ py: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
  if (!followUps.length) return null

  return (
    <Box sx={{ mx: 2, mt: 2 }}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
        Follow-ups due
      </Typography>
      <Box sx={{ mt: 1, borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
        {followUps.map((f, i) => (
          <Box
            key={f.id}
            onClick={() => navigate(`/clients/${f.client_id}`)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: 2, py: 1.5,
              borderBottom: i < followUps.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              cursor: 'pointer',
              '&:active': { bgcolor: 'action.selected' },
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600}>{f.clients?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{f.clients?.accounts?.name}</Typography>
            </Box>
            <Chip
              label={STATUS_LABELS[f.status]}
              size="small"
              sx={{
                bgcolor: STATUS_COLORS[f.status] + '20',
                color: STATUS_COLORS[f.status],
                fontWeight: 700,
                fontSize: 11,
                height: 24,
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  )
}
```

- [ ] **Step 3: Create ActionCards**

```jsx
// src/components/home/ActionCards.jsx
import { Box, Typography } from '@mui/material'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import EditNoteIcon from '@mui/icons-material/EditNote'
import GroupsIcon from '@mui/icons-material/Groups'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const CARDS = [
  { key: 'clients', icon: PeopleAltIcon, label: 'My Clients', sub: 'client list', path: '/clients', color: '#e8eaf6', iconColor: '#3949ab', roles: ['team_member','manager','super_manager'] },
  { key: 'log', icon: EditNoteIcon, label: 'Log Meeting', sub: 'quick entry', path: '/log-meeting', color: '#e8f5e9', iconColor: '#2e7d32', roles: ['team_member','manager','super_manager'] },
  { key: 'team', icon: GroupsIcon, label: 'Team View', sub: 'manager only', path: '/team', color: '#fff3e0', iconColor: '#e65100', roles: ['manager','super_manager'] },
]

export default function ActionCards() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const role = profile?.role ?? 'team_member'
  const visible = CARDS.filter(c => c.roles.includes(role))

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mx: 2, mt: 2 }}>
      {visible.map(card => {
        const Icon = card.icon
        return (
          <Box
            key={card.key}
            onClick={() => navigate(card.path)}
            sx={{
              bgcolor: '#fff', borderRadius: 3, p: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              cursor: 'pointer', userSelect: 'none',
              '&:active': { transform: 'scale(0.97)', transition: 'transform 0.1s' },
              display: 'flex', flexDirection: 'column', gap: 0.5,
              minHeight: 80,
            }}
          >
            <Box sx={{ bgcolor: card.color, borderRadius: 2, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon sx={{ color: card.iconColor, fontSize: 22 }} />
            </Box>
            <Typography variant="body2" fontWeight={700} mt={0.5}>{card.label}</Typography>
            <Typography variant="caption" color="text.secondary">{card.sub}</Typography>
          </Box>
        )
      })}
    </Box>
  )
}
```

- [ ] **Step 4: Build HomePage**

```jsx
// src/pages/HomePage.jsx
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
          <SearchBar
            value={search}
            onChange={setSearch}
            onFocus={handleSearchFocus}
          />
        </Toolbar>
      </AppBar>

      <FollowUpsList followUps={followUps} loading={loading} />
      <ActionCards />
      <Box sx={{ pb: 'calc(var(--safe-bottom) + 16px)' }} />
    </Box>
  )
}
```

- [ ] **Step 5: Build and manually verify home screen renders**

```bash
npm run build && npm run dev
```

Open http://localhost:5173, log in, verify: greeting shows, search bar visible in header, action cards visible.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: build home screen with search, follow-ups, and action cards"
```

---

## Task 6: Client list screen

**Files:**
- Create: `src/components/clients/ClientListItem.jsx`
- Modify: `src/pages/ClientListPage.jsx`

- [ ] **Step 1: Create ClientListItem**

```jsx
// src/components/clients/ClientListItem.jsx
import { Box, Typography, Chip } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/followUpStatus'
import { formatRelative } from '../../utils/dateFormat'

export default function ClientListItem({ client, onClick }) {
  const status = client.followUpStatus
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2, py: 1.75,
        borderBottom: '1px solid', borderColor: 'divider',
        cursor: 'pointer', bgcolor: '#fff',
        '&:active': { bgcolor: 'action.selected' },
        minHeight: 64,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap>{client.name}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {client.title} · {client.accounts?.name}
        </Typography>
        {client.lastMeetingDate && (
          <Typography variant="caption" display="block" color="text.secondary">
            Last met {formatRelative(client.lastMeetingDate)}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
        {status && status !== 'none' && status !== 'future' && (
          <Chip
            label={STATUS_LABELS[status]}
            size="small"
            sx={{
              bgcolor: STATUS_COLORS[status] + '20',
              color: STATUS_COLORS[status],
              fontWeight: 700, fontSize: 10, height: 22,
            }}
          />
        )}
        <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
      </Box>
    </Box>
  )
}
```

- [ ] **Step 2: Build ClientListPage**

```jsx
// src/pages/ClientListPage.jsx
import { useState, useEffect } from 'react'
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
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1 }}>
          <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
          <InputBase
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            sx={{ flex: 1, fontSize: 15 }}
            inputProps={{ 'aria-label': 'Search clients' }}
          />
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ pt: 6, textAlign: 'center' }}><CircularProgress /></Box>
      ) : clients.length === 0 ? (
        <Box sx={{ pt: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">No clients found</Typography>
        </Box>
      ) : (
        <Box>
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
        onClick={() => navigate('/clients/new')}
      >
        <AddIcon />
      </Fab>
    </AppShell>
  )
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Navigate to /clients in the running dev server. Verify list renders and search input is auto-focused.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: build client list screen with search and urgency sort"
```

---

## Task 7: Client card — shell + Intel tab

**Files:**
- Create: `src/components/clientcard/InlineEditField.jsx`
- Create: `src/components/clientcard/IntelTab.jsx`
- Create: `src/store/clientStore.js`
- Create: `src/hooks/useMeetings.js`
- Modify: `src/pages/ClientCardPage.jsx`

- [ ] **Step 1: Create clientStore for optimistic intel updates**

```js
// src/store/clientStore.js
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useClientStore = create((set) => ({
  details: {},

  fetchDetails: async (clientId) => {
    const { data } = await supabase
      .from('client_details')
      .select('*')
      .eq('client_id', clientId)
      .single()
    if (data) set(state => ({ details: { ...state.details, [clientId]: data } }))
  },

  updateDetail: async (clientId, field, value) => {
    // Optimistic update
    set(state => ({
      details: {
        ...state.details,
        [clientId]: { ...(state.details[clientId] ?? {}), [field]: value },
      },
    }))

    const existing = await supabase
      .from('client_details')
      .select('id')
      .eq('client_id', clientId)
      .single()

    if (existing.data) {
      await supabase
        .from('client_details')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('client_id', clientId)
    } else {
      await supabase
        .from('client_details')
        .insert({ client_id: clientId, [field]: value })
    }
  },
}))
```

- [ ] **Step 2: Create InlineEditField**

```jsx
// src/components/clientcard/InlineEditField.jsx
import { useState } from 'react'
import { Box, Typography, TextField, Button } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

export default function InlineEditField({ label, value, onSave, placeholder = 'Tap to add...' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')

  function handleSave() {
    onSave(draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {label}
        </Typography>
        <TextField
          multiline
          fullWidth
          autoFocus
          minRows={2}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          sx={{ mt: 0.5 }}
          size="small"
        />
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button size="small" variant="contained" onClick={handleSave} sx={{ minHeight: 36 }}>Save</Button>
          <Button size="small" onClick={() => { setDraft(value ?? ''); setEditing(false) }} sx={{ minHeight: 36 }}>Cancel</Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      onClick={() => setEditing(true)}
      sx={{ mb: 2, cursor: 'pointer', '&:active': { opacity: 0.7 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {label}
        </Typography>
        <EditIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
      </Box>
      <Typography variant="body2" sx={{ mt: 0.5, color: value ? 'text.primary' : 'text.disabled', lineHeight: 1.6 }}>
        {value || placeholder}
      </Typography>
    </Box>
  )
}
```

- [ ] **Step 3: Create IntelTab**

```jsx
// src/components/clientcard/IntelTab.jsx
import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useClientStore } from '../../store/clientStore'
import InlineEditField from './InlineEditField'

const FIELDS = [
  { key: 'hot_buttons', label: 'Hot Buttons', placeholder: 'What keeps them up at night...' },
  { key: 'key_focus_areas', label: 'Key Focus Areas', placeholder: 'Strategic priorities...' },
  { key: 'likes', label: 'Likes', placeholder: 'What they respond well to...' },
  { key: 'dislikes', label: 'Dislikes', placeholder: 'What to avoid...' },
  { key: 'notes', label: 'Notes', placeholder: 'General relationship notes...' },
]

export default function IntelTab({ clientId }) {
  const { details, fetchDetails, updateDetail } = useClientStore()
  const data = details[clientId]

  useEffect(() => { fetchDetails(clientId) }, [clientId])

  if (!data && !Object.keys(details).includes(clientId)) {
    return <Box sx={{ pt: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
  }

  return (
    <Box sx={{ px: 2, pt: 2 }}>
      {FIELDS.map(f => (
        <InlineEditField
          key={f.key}
          label={f.label}
          value={data?.[f.key] ?? ''}
          placeholder={f.placeholder}
          onSave={val => updateDetail(clientId, f.key, val)}
        />
      ))}
    </Box>
  )
}
```

- [ ] **Step 4: Create useMeetings hook**

```js
// src/hooks/useMeetings.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMeetings(clientId) {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clientId) return
    async function fetch() {
      const { data } = await supabase
        .from('meetings')
        .select('*, users!logged_by ( username )')
        .eq('client_id', clientId)
        .order('meeting_date', { ascending: false })
      setMeetings(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [clientId])

  return { meetings, loading }
}
```

- [ ] **Step 5: Build ClientCardPage with tab shell**

```jsx
// src/pages/ClientCardPage.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Tabs, Tab, Typography, CircularProgress } from '@mui/material'
import AppShell from '../components/AppShell'
import IntelTab from '../components/clientcard/IntelTab'
import { supabase } from '../lib/supabase'

function TabPanel({ value, index, children }) {
  return value === index ? <Box>{children}</Box> : null
}

export default function ClientCardPage() {
  const { id } = useParams()
  const [tab, setTab] = useState(0)
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('clients')
        .select('*, accounts ( name, strategic_importance, industry ), users!assigned_to ( username )')
        .eq('id', id)
        .single()
      setClient(data)
      setLoading(false)
    }
    fetch()
  }, [id])

  if (loading) return <AppShell title=""><Box sx={{ pt: 6, textAlign: 'center' }}><CircularProgress /></Box></AppShell>

  return (
    <AppShell title={client?.name ?? ''}>
      <Box sx={{ bgcolor: '#1a237e', px: 2, pb: 2 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>{client?.title}</Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{client?.accounts?.name}</Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 56, zIndex: 9 }}
      >
        <Tab label="Intel" />
        <Tab label="Meetings" />
        <Tab label="Profile" />
      </Tabs>

      <TabPanel value={tab} index={0}><IntelTab clientId={id} /></TabPanel>
      <TabPanel value={tab} index={1}><Box sx={{ p: 2 }}><Typography color="text.secondary">Meetings coming in Task 8</Typography></Box></TabPanel>
      <TabPanel value={tab} index={2}><Box sx={{ p: 2 }}><Typography color="text.secondary">Profile coming in Task 9</Typography></Box></TabPanel>
    </AppShell>
  )
}
```

- [ ] **Step 6: Build and manually verify**

```bash
npm run build
```

Navigate to a client card. Verify Intel tab shows, fields are tappable and editable, saves persist after page refresh.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: client card shell with Intel tab inline editing"
```

---

## Task 8: Client card — Meetings tab

**Files:**
- Create: `src/components/clientcard/MeetingsTab.jsx`
- Modify: `src/pages/ClientCardPage.jsx`

- [ ] **Step 1: Create MeetingsTab**

```jsx
// src/components/clientcard/MeetingsTab.jsx
import { useState } from 'react'
import { Box, Typography, Chip, Fab, Collapse } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useNavigate } from 'react-router-dom'
import { useMeetings } from '../../hooks/useMeetings'
import { formatRelative, formatDate } from '../../utils/dateFormat'
import { STATUS_LABELS, STATUS_COLORS, getFollowUpStatus } from '../../utils/followUpStatus'

const SENTIMENT_EMOJI = {
  very_negative: '😞', negative: '🙁', neutral: '😐', positive: '😊', very_positive: '🤩'
}

function MeetingRow({ meeting }) {
  const [open, setOpen] = useState(false)
  const status = getFollowUpStatus(meeting.next_followup_date)

  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, cursor: 'pointer' }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={600}>{formatRelative(meeting.meeting_date)}</Typography>
            <Typography variant="body2">{SENTIMENT_EMOJI[meeting.client_sentiment] ?? ''}</Typography>
          </Box>
          {meeting.topics_discussed && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {JSON.parse(meeting.topics_discussed ?? '[]').join(' · ')}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {meeting.next_followup_date && (
            <Chip
              label={STATUS_LABELS[status]}
              size="small"
              sx={{ bgcolor: STATUS_COLORS[status] + '20', color: STATUS_COLORS[status], fontWeight: 700, fontSize: 10, height: 22 }}
            />
          )}
          {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </Box>
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 2, pb: 2, bgcolor: '#fafafa' }}>
          {meeting.discussion_summary && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">DISCUSSION</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{meeting.discussion_summary}</Typography>
            </Box>
          )}
          {meeting.outcomes && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">OUTCOMES</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{meeting.outcomes}</Typography>
            </Box>
          )}
          {meeting.next_followup_date && (
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary">FOLLOW-UP</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{formatDate(meeting.next_followup_date)}</Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

export default function MeetingsTab({ clientId, accountId }) {
  const navigate = useNavigate()
  const { meetings, loading } = useMeetings(clientId)

  return (
    <Box>
      {loading ? (
        <Box sx={{ p: 3, textAlign: 'center' }}><Typography color="text.secondary">Loading...</Typography></Box>
      ) : meetings.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No meetings logged yet</Typography>
        </Box>
      ) : (
        meetings.map(m => <MeetingRow key={m.id} meeting={m} />)
      )}
      <Fab
        color="primary"
        size="medium"
        aria-label="Log meeting"
        sx={{ position: 'fixed', bottom: 'calc(var(--safe-bottom) + 16px)', right: 16 }}
        onClick={() => navigate(`/log-meeting?clientId=${clientId}&accountId=${accountId}`)}
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}
```

- [ ] **Step 2: Wire MeetingsTab into ClientCardPage**

In `src/pages/ClientCardPage.jsx`, replace the Meetings tab placeholder:

```jsx
// Add import at top
import MeetingsTab from '../components/clientcard/MeetingsTab'

// Replace TabPanel index=1 content:
<TabPanel value={tab} index={1}>
  <MeetingsTab clientId={id} accountId={client?.account_id} />
</TabPanel>
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Navigate to a client card → Meetings tab. Verify list renders (empty state if no meetings). Verify expand/collapse works.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: client card Meetings tab with expandable meeting rows"
```

---

## Task 9: Client card — Profile tab

**Files:**
- Create: `src/components/clientcard/ProfileTab.jsx`
- Modify: `src/pages/ClientCardPage.jsx`

- [ ] **Step 1: Create ProfileTab**

```jsx
// src/components/clientcard/ProfileTab.jsx
import { useState } from 'react'
import { Box, Typography, TextField, Button, Chip, Divider } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

const TIER_LABELS = { tier1: 'Tier 1', tier2: 'Tier 2', tier3: 'Tier 3' }
const TIER_COLORS = { tier1: '#1a237e', tier2: '#0288d1', tier3: '#546e7a' }

function EditableContactField({ icon: Icon, label, value, field, clientId, canEdit }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')

  async function save() {
    await supabase.from('clients').update({ [field]: draft }).eq('id', clientId)
    setEditing(false)
  }

  if (editing) {
    return (
      <Box sx={{ mb: 2 }}>
        <TextField label={label} value={draft} onChange={e => setDraft(e.target.value)} size="small" fullWidth autoFocus />
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button size="small" variant="contained" onClick={save} sx={{ minHeight: 36 }}>Save</Button>
          <Button size="small" onClick={() => { setDraft(value ?? ''); setEditing(false) }} sx={{ minHeight: 36 }}>Cancel</Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, cursor: canEdit ? 'pointer' : 'default' }} onClick={() => canEdit && setEditing(true)}>
      <Icon sx={{ color: 'text.disabled', fontSize: 20 }} />
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2" color={value ? 'text.primary' : 'text.disabled'}>
          {value || 'Not set'}
        </Typography>
      </Box>
    </Box>
  )
}

export default function ProfileTab({ client }) {
  const { profile } = useAuthStore()
  const canEdit = profile?.role === 'manager' || profile?.role === 'super_manager' || profile?.id === client?.assigned_to

  return (
    <Box sx={{ px: 2, pt: 2 }}>
      <EditableContactField icon={EmailIcon} label="Email" value={client?.email} field="email" clientId={client?.id} canEdit={canEdit} />
      <EditableContactField icon={PhoneIcon} label="Phone" value={client?.phone} field="phone" clientId={client?.id} canEdit={canEdit} />

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>Account</Typography>
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2">{client?.accounts?.name}</Typography>
        {client?.accounts?.strategic_importance && (
          <Chip
            label={TIER_LABELS[client.accounts.strategic_importance]}
            size="small"
            sx={{ bgcolor: TIER_COLORS[client.accounts.strategic_importance] + '20', color: TIER_COLORS[client.accounts.strategic_importance], fontWeight: 700, fontSize: 10 }}
          />
        )}
      </Box>
      {client?.accounts?.industry && (
        <Typography variant="caption" color="text.secondary">{client.accounts.industry}</Typography>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>Assigned to</Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>{client?.users?.username ?? 'Unassigned'}</Typography>
    </Box>
  )
}
```

- [ ] **Step 2: Wire ProfileTab into ClientCardPage**

```jsx
// Add import at top of ClientCardPage.jsx
import ProfileTab from '../components/clientcard/ProfileTab'

// Replace TabPanel index=2:
<TabPanel value={tab} index={2}>
  <ProfileTab client={client} />
</TabPanel>
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Navigate to a client card → Profile tab. Verify email/phone are tappable (if you have edit rights), account info shows, tier chip renders.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: client card Profile tab with editable contact fields"
```

---

## Task 10: Log Meeting form

**Files:**
- Create: `src/store/meetingStore.js`
- Create: `src/components/meeting/SentimentPicker.jsx`
- Create: `src/components/meeting/TopicChips.jsx`
- Modify: `src/pages/LogMeetingPage.jsx`

- [ ] **Step 1: Create meetingStore**

```js
// src/store/meetingStore.js
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useMeetingStore = create((set) => ({
  saving: false,
  error: null,

  saveMeeting: async (payload) => {
    set({ saving: true, error: null })

    // Compute next_followup_date from next_followup enum
    let followupDate = payload.next_followup_date ?? null
    if (!followupDate && payload.next_followup) {
      const today = new Date()
      if (payload.next_followup === '1_week') today.setDate(today.getDate() + 7)
      else if (payload.next_followup === '1_month') today.setMonth(today.getMonth() + 1)
      else if (payload.next_followup === '1_quarter') today.setMonth(today.getMonth() + 3)
      followupDate = today.toISOString().split('T')[0]
    }

    const { error } = await supabase.from('meetings').insert({
      client_id: payload.client_id,
      account_id: payload.account_id,
      logged_by: payload.logged_by,
      meeting_date: payload.meeting_date ?? new Date().toISOString().split('T')[0],
      client_sentiment: payload.client_sentiment,
      next_followup: payload.next_followup,
      next_followup_date: followupDate,
      topics_discussed: payload.topics_discussed ? JSON.stringify(payload.topics_discussed) : null,
      topics_custom: payload.topics_custom ?? null,
      discussion_summary: payload.discussion_summary ?? null,
      outcomes: payload.outcomes ?? null,
      attendees: payload.attendees ? JSON.stringify(payload.attendees) : null,
    })

    set({ saving: false, error: error?.message ?? null })
    return !error
  },
}))
```

- [ ] **Step 2: Create SentimentPicker**

```jsx
// src/components/meeting/SentimentPicker.jsx
import { Box, Typography } from '@mui/material'

const OPTIONS = [
  { value: 'very_negative', emoji: '😞', label: 'Very bad' },
  { value: 'negative', emoji: '🙁', label: 'Bad' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'positive', emoji: '😊', label: 'Good' },
  { value: 'very_positive', emoji: '🤩', label: 'Great' },
]

export default function SentimentPicker({ value, onChange }) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {OPTIONS.map(o => (
        <Box
          key={o.value}
          onClick={() => onChange(o.value)}
          sx={{
            flex: 1, textAlign: 'center', py: 1.25, borderRadius: 2, cursor: 'pointer',
            border: '2px solid',
            borderColor: value === o.value ? 'primary.main' : 'transparent',
            bgcolor: value === o.value ? 'primary.light' + '20' : '#f5f5f5',
            '&:active': { opacity: 0.7 },
          }}
        >
          <Typography fontSize={24}>{o.emoji}</Typography>
        </Box>
      ))}
    </Box>
  )
}
```

- [ ] **Step 3: Create TopicChips**

```jsx
// src/components/meeting/TopicChips.jsx
import { Box, Chip } from '@mui/material'

const TOPICS = ['Strategy', 'Pricing', 'Risk', 'Regulatory', 'Relationship', 'Competitive']

export default function TopicChips({ selected, onChange }) {
  function toggle(topic) {
    onChange(selected.includes(topic) ? selected.filter(t => t !== topic) : [...selected, topic])
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {TOPICS.map(t => (
        <Chip
          key={t}
          label={t}
          onClick={() => toggle(t)}
          variant={selected.includes(t) ? 'filled' : 'outlined'}
          color={selected.includes(t) ? 'primary' : 'default'}
          sx={{ fontWeight: selected.includes(t) ? 700 : 400, height: 36 }}
        />
      ))}
    </Box>
  )
}
```

- [ ] **Step 4: Build LogMeetingPage**

```jsx
// src/pages/LogMeetingPage.jsx
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box, Button, TextField, Typography, MenuItem, Select,
  FormControl, InputLabel, Collapse, Alert, CircularProgress,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AppShell from '../components/AppShell'
import SentimentPicker from '../components/meeting/SentimentPicker'
import TopicChips from '../components/meeting/TopicChips'
import { useMeetingStore } from '../store/meetingStore'
import { useAuthStore } from '../store/authStore'
import { useClients } from '../hooks/useClients'

const FOLLOWUP_OPTIONS = [
  { value: '1_week', label: '1 week' },
  { value: '1_month', label: '1 month' },
  { value: '1_quarter', label: '1 quarter' },
  { value: 'custom', label: 'Custom date' },
]

export default function LogMeetingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { profile } = useAuthStore()
  const { saveMeeting, saving, error } = useMeetingStore()
  const { clients } = useClients()

  const [clientId, setClientId] = useState(searchParams.get('clientId') ?? '')
  const [sentiment, setSentiment] = useState('')
  const [followup, setFollowup] = useState('1_month')
  const [followupDate, setFollowupDate] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [topics, setTopics] = useState([])
  const [summary, setSummary] = useState('')
  const [outcomes, setOutcomes] = useState('')
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0])

  const selectedClient = clients.find(c => c.id === clientId)
  const canSave = clientId && sentiment && followup

  async function handleSave() {
    const ok = await saveMeeting({
      client_id: clientId,
      account_id: selectedClient?.account_id ?? searchParams.get('accountId'),
      logged_by: profile?.id,
      client_sentiment: sentiment,
      next_followup: followup,
      next_followup_date: followup === 'custom' ? followupDate : null,
      meeting_date: meetingDate,
      topics_discussed: topics,
      discussion_summary: summary || null,
      outcomes: outcomes || null,
    })
    if (ok) navigate(-1)
  }

  return (
    <AppShell title="Log Meeting">
      <Box sx={{ px: 2, pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Client *</InputLabel>
          <Select value={clientId} onChange={e => setClientId(e.target.value)} label="Client *">
            {clients.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name} — {c.accounts?.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
          How did it go? *
        </Typography>
        <Box sx={{ mt: 1, mb: 2 }}>
          <SentimentPicker value={sentiment} onChange={setSentiment} />
        </Box>

        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
          Follow up in *
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2, flexWrap: 'wrap' }}>
          {FOLLOWUP_OPTIONS.map(o => (
            <Box
              key={o.value}
              onClick={() => setFollowup(o.value)}
              sx={{
                px: 2, py: 1, borderRadius: 2, cursor: 'pointer', border: '2px solid',
                borderColor: followup === o.value ? 'primary.main' : 'divider',
                bgcolor: followup === o.value ? '#e8eaf6' : '#fff',
                fontWeight: followup === o.value ? 700 : 400,
                fontSize: 13, color: followup === o.value ? 'primary.main' : 'text.primary',
                '&:active': { opacity: 0.7 },
              }}
            >
              {o.label}
            </Box>
          ))}
        </Box>
        {followup === 'custom' && (
          <TextField type="date" label="Follow-up date" fullWidth size="small" sx={{ mb: 2 }} value={followupDate} onChange={e => setFollowupDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        )}

        <Box
          onClick={() => setExpanded(e => !e)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, cursor: 'pointer', borderTop: '1px dashed', borderColor: 'divider' }}
        >
          <Typography variant="body2" color="primary" fontWeight={600}>
            {expanded ? 'Hide detail' : '+ Add detail (topics, notes, outcomes)'}
          </Typography>
          <ExpandMoreIcon sx={{ color: 'primary.main', transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ pt: 1 }}>
            <TextField type="date" label="Meeting date" fullWidth size="small" sx={{ mb: 2 }} value={meetingDate} onChange={e => setMeetingDate(e.target.value)} InputLabelProps={{ shrink: true }} />

            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>Topics covered</Typography>
            <Box sx={{ mt: 1, mb: 2 }}><TopicChips selected={topics} onChange={setTopics} /></Box>

            <TextField label="Discussion summary" multiline minRows={3} fullWidth size="small" sx={{ mb: 2 }} value={summary} onChange={e => setSummary(e.target.value)} />
            <TextField label="Outcomes / next steps" multiline minRows={2} fullWidth size="small" sx={{ mb: 2 }} value={outcomes} onChange={e => setOutcomes(e.target.value)} />
          </Box>
        </Collapse>

        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={!canSave || saving}
          onClick={handleSave}
          sx={{ mt: 2, mb: 3 }}
        >
          {saving ? <CircularProgress size={22} color="inherit" /> : 'Save Meeting'}
        </Button>
      </Box>
    </AppShell>
  )
}
```

- [ ] **Step 5: Build and manually test the full log flow**

```bash
npm run build && npm run dev
```

Go to Log Meeting. Verify: client dropdown populates, sentiment picker works, follow-up selector works, Save is disabled until required fields filled, form saves and navigates back.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: log meeting form with quick entry and expandable detail"
```

---

## Task 11: Manager Team View

**Files:**
- Create: `src/hooks/useTeam.js`
- Create: `src/components/team/TeamMemberCard.jsx`
- Modify: `src/pages/TeamViewPage.jsx`

- [ ] **Step 1: Create useTeam hook**

```js
// src/hooks/useTeam.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { getFollowUpStatus } from '../utils/followUpStatus'

export function useTeam() {
  const { profile } = useAuthStore()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    async function fetch() {
      // Get team members under this manager
      const { data: teamMembers } = await supabase
        .from('users')
        .select('id, username, email')
        .eq('manager_id', profile.id)
        .eq('is_active', true)

      if (!teamMembers?.length) { setMembers([]); setLoading(false); return }

      // For each member, get client count and latest meetings
      const enriched = await Promise.all(teamMembers.map(async member => {
        const { count: clientCount } = await supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_to', member.id)
          .eq('is_active', true)

        const thisMonth = new Date()
        thisMonth.setDate(1)
        thisMonth.setHours(0, 0, 0, 0)

        const { count: meetingsThisMonth } = await supabase
          .from('meetings')
          .select('id', { count: 'exact', head: true })
          .eq('logged_by', member.id)
          .gte('meeting_date', thisMonth.toISOString().split('T')[0])

        const { data: overdueMeetings } = await supabase
          .from('meetings')
          .select('next_followup_date, client_id')
          .in('client_id', (
            await supabase.from('clients').select('id').eq('assigned_to', member.id)
          ).data?.map(c => c.id) ?? [])
          .not('next_followup_date', 'is', null)
          .lt('next_followup_date', new Date().toISOString().split('T')[0])

        const overdueCount = (overdueMeetings ?? []).length

        return { ...member, clientCount: clientCount ?? 0, meetingsThisMonth: meetingsThisMonth ?? 0, overdueCount }
      }))

      setMembers(enriched)
      setLoading(false)
    }
    fetch()
  }, [profile])

  return { members, loading }
}
```

- [ ] **Step 2: Create TeamMemberCard**

```jsx
// src/components/team/TeamMemberCard.jsx
import { Box, Typography, Chip } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import PeopleIcon from '@mui/icons-material/People'
import EventNoteIcon from '@mui/icons-material/EventNote'

export default function TeamMemberCard({ member, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', px: 2, py: 2,
        borderBottom: '1px solid', borderColor: 'divider',
        cursor: 'pointer', bgcolor: '#fff',
        '&:active': { bgcolor: 'action.selected' },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="body2" fontWeight={700}>{member.username}</Typography>
          {member.overdueCount > 0 && (
            <Chip label={`${member.overdueCount} overdue`} size="small"
              sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 700, fontSize: 10, height: 20 }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PeopleIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">{member.clientCount} clients</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EventNoteIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">{member.meetingsThisMonth} meetings this month</Typography>
          </Box>
        </Box>
      </Box>
      <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
    </Box>
  )
}
```

- [ ] **Step 3: Build TeamViewPage**

```jsx
// src/pages/TeamViewPage.jsx
import { Box, CircularProgress, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import TeamMemberCard from '../components/team/TeamMemberCard'
import { useTeam } from '../hooks/useTeam'

export default function TeamViewPage() {
  const navigate = useNavigate()
  const { members, loading } = useTeam()

  return (
    <AppShell title="Team View">
      {loading ? (
        <Box sx={{ pt: 6, textAlign: 'center' }}><CircularProgress /></Box>
      ) : members.length === 0 ? (
        <Box sx={{ pt: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">No team members found</Typography>
        </Box>
      ) : (
        members.map(member => (
          <TeamMemberCard
            key={member.id}
            member={member}
            onClick={() => navigate(`/clients?assignedTo=${member.id}`)}
          />
        ))
      )}
    </AppShell>
  )
}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Log in as a manager, navigate to Team View. Verify team members show with client counts and overdue badges.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: manager team view with per-member stats and overdue counts"
```

---

## Task 12: PWA setup

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Modify: `src/main.jsx`
- Modify: `index.html`

- [ ] **Step 1: Create manifest.json**

```json
// public/manifest.json
{
  "name": "TM BFSI CRM",
  "short_name": "BFSI CRM",
  "description": "Sales relationship tracking for TM BFSI team",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a237e",
  "theme_color": "#1a237e",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 2: Create service worker**

```js
// public/sw.js
const CACHE = 'bfsi-crm-v1'
const PRECACHE = ['/', '/login']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ))
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  // Network-first for API calls, cache-first for static assets
  if (e.request.url.includes('supabase.co')) return
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
```

- [ ] **Step 3: Register service worker in main.jsx**

```jsx
// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 4: Update index.html**

Add inside `<head>`:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#1a237e" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="BFSI CRM" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

Note: Add placeholder 192×192 and 512×512 PNG icons at `public/icon-192.png` and `public/icon-512.png`. These can be replaced with proper branded icons later. For now, copy any PNG and rename it.

- [ ] **Step 5: Build and verify PWA**

```bash
npm run build && npm run preview
```

Open http://localhost:4173 in Chrome. Open DevTools → Application → Manifest. Verify manifest loads. Check Application → Service Workers — verify SW registered.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: PWA manifest and service worker"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task covering it |
|------------------|-----------------|
| Login screen | Exists (LoginPage.jsx) |
| Home: search bar in header | Task 5 |
| Home: follow-ups surfaced directly | Task 5 |
| Home: action cards | Task 5 |
| Client list with urgency sort | Task 6 |
| Client card: Intel tab default | Task 7 |
| Client card: Meetings tab | Task 8 |
| Client card: Profile tab | Task 9 |
| Inline editing on Intel | Task 7 |
| Log meeting: 3 required fields | Task 10 |
| Log meeting: expandable detail | Task 10 |
| Manager team view | Task 11 |
| PWA manifest + service worker | Task 12 |
| Safe area insets | Task 1 (index.css) + Task 3 (AppShell) |
| Optimistic UI for intel saves | Task 7 (clientStore) |
| Role-based action cards | Task 5 (ActionCards) |
| RLS enforced at DB layer | Schema (already done) |

All requirements covered. No gaps found.
