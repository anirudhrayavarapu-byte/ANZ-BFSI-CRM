# TM BFSI CRM Mobile App — Design Spec
Date: 2026-06-07

## Context

A PWA for a 15-person sales team at Tech Mahindra BFSI (APJ region). Replaces Excel-based client tracking. Will be installed as a downloadable app on mobile (Android/iOS via PWA install prompt).

The design was stress-tested against the persona of a busy, skeptical sales lead (Raj) who sees any new tool as a distraction unless it gives him clear personal value. Every design decision was filtered through that lens.

**Core user value (must be true or the app dies):**
- Pre-meeting: find a client in 2 taps and see what matters before walking into the room
- Post-meeting: log in under 30 seconds, full detail optional
- Managers: see team coverage without chasing people

---

## User Roles

| Role | Count | Key capability |
|------|-------|----------------|
| Team Member | 10-12 | Own clients only, own meetings |
| Manager | 5 | Team's clients and meetings, team health view |
| Super Manager (Vishy) | 1 | All data, all teams |

Access is enforced at the database layer (Supabase RLS), not just the frontend.

---

## Tech Stack

- **Frontend:** React 18, Vite, Material UI v5 (with impeccable skill polish on all screens)
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Hosting:** Railway (Docker + nginx)
- **State:** Zustand
- **PWA:** manifest.json, service worker, install-to-home-screen

---

## Navigation Structure

**Pattern:** Home card grid + back-button navigation. No persistent tab bar.

Users land on the home screen. Every section is reachable from there. Back navigation returns to the previous screen (not always home -- e.g., client card opened from search returns to search, from client list returns to client list). Home is the root of the stack. This mirrors how simple native apps work and keeps the mental model flat.

---

## Screens

### 1. Login
- Email + password
- Error messaging inline
- No self-serve registration (admin creates users via Supabase dashboard)

### 2. Home Screen
The entry point. Designed to answer two questions instantly: "Who do I need to follow up with?" and "Let me find a client before my next meeting."

**Layout:**
- Header: greeting (Good morning, Anirudh), date
- **Search bar in the header** — always visible, searches across all accessible clients by name or company. Primary interaction for pre-meeting prep.
- **Follow-ups section** — surfaces directly on home screen (not behind a card). Shows overdue first, then due today, then upcoming (next 7 days). Each row: client name, company, urgency label. Tap to go to client card. Hidden if no follow-ups are due.
- **2 action cards:** My Clients, Log Meeting
- Managers see an additional Team View card

**Why search is primary:** A busy salesperson opens the app to look someone up, not to navigate a menu. Search gets them to the right client card in under 2 taps.

### 3. Client List
- Full list of accessible clients (own clients for team members, team's clients for managers)
- Search/filter bar at top
- Each row: client name, title, company, last meeting date, follow-up status badge
- Default sort: follow-up urgency (overdue first)
- Tap row to open client card

### 4. Client Card
Tabbed layout. **Intel is the default tab** — this is the pre-meeting prep screen.

**Tab 1 — Intel (default)**
- Hot buttons (what keeps this person up at night)
- Key focus areas
- Likes (what they respond well to)
- Dislikes (what to avoid)
- General relationship notes
- All fields editable inline with a single tap

**Tab 2 — Meetings**
- Chronological list of all logged meetings
- Each row: date, sentiment icon, topics, follow-up date
- Tap to expand full meeting detail
- Floating action button: Log Meeting (pre-filled with this client)

**Tab 3 — Profile**
- Name, title, company (account)
- Email, phone (both editable inline by the assigned team member or manager)
- Assigned to (team member, editable by manager only)
- Account tier, industry (read-only, set at account level)

**Why Intel is the default tab:** Profile data (name, title) is rarely what you need before a meeting. Intel (hot buttons, what they care about) is exactly what you need. Defaulting to Intel means Raj opens the card and immediately sees what matters.

### 5. Log Meeting
Quick entry by default. Optional detail always available, never required.

**Required fields (30-second log):**
- Client (searchable dropdown, pre-filled if coming from client card)
- Sentiment (emoji scale: very negative / negative / neutral / positive / very positive)
- Follow-up in (1 week / 1 month / 1 quarter / custom date)

**Optional expandable section ("Add detail"):**
- Meeting date (defaults to today)
- Attendees (multi-select from team)
- Topics covered (chip multi-select: Strategy, Pricing, Risk, Regulatory, Relationship, Competitive + custom free text)
- Discussion summary (free text)
- Outcomes / next steps (free text)

One Save button regardless of how much was filled. The record is created either way.

**Why this matters:** Making 8 fields required kills adoption. If Raj skips logging once because it felt like work, he'll skip it forever. 3 required fields means there's no excuse not to log.

### 6. Manager — Team View
Accessible via home card (managers only).

- List of team members with: client count, meetings this month, overdue follow-up count
- Tap a team member to see their client list
- Overdue follow-ups highlighted in amber/red
- No access to other managers' teams

---

## Client Intel — Edit Behaviour

Intel fields (hot buttons, likes, dislikes, etc.) are editable inline on the Intel tab. Tap a field to activate an edit mode, tap Save or blur to persist. No separate "edit mode" toggle needed — the friction of a separate edit screen discourages updating.

---

## PWA Configuration

- `manifest.json`: app name, icons, theme colour (navy #1a237e), display: standalone
- Service worker: cache login page and last-viewed client cards for offline access
- Install prompt: shown once after first successful login
- Safe area insets: handled for iPhone notch and Android home bar

---

## Design Principles (for implementation)

1. **Every screen must pass the 5-second rule** — the user gets what they came for in 5 seconds or less
2. **Touch targets minimum 44px** — nothing smaller on mobile
3. **No hover states** — this is a touch app
4. **Impeccable skill** must be invoked for every screen — no plain MUI defaults
5. **Optimistic UI** — show changes immediately, sync in background. Don't make Raj wait for a spinner after tapping Save.

---

## Out of Scope (Phase 1)

- Push notifications (follow-up reminders)
- Calendar integration
- File attachments on meetings
- Bulk import from Excel
- Offline write (offline read only for now)

These are Phase 2 features. Build them after the team is actually using Phase 1.
