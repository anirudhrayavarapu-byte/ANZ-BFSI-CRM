# Sales CRM PWA - Project Brief for Claude Code

## Project Overview

Build a Progressive Web App (PWA) for a 15-person sales team at Tech Mahindra BFSI to replace Excel-based client relationship tracking. The app captures client relationship intelligence (meetings, personal details, follow-up scheduling) with role-based access control.

**Core Value:** Speed adoption. Team members get personal benefit (meeting prep), managers get visibility (team coverage), institutional memory is preserved (client context survives staff turnover).

**Timeline:** Build in phases. Phase 1: MVP (core client card + meeting log). Publish later as PWA.

---

## User Roles & Permissions

**Team Member (10-12 users)**
- Own clients only (create, read, edit)
- Own meeting logs only
- Can see: Client card, meeting history, upcoming follow-ups
- Cannot see: Other team members' data, manager notes

**Manager (5 users)**
- View all team members' clients (read-only on client details, full edit rights)
- Edit team members' client cards and meeting logs
- Cannot see: Other managers' team data
- Can view: Team health dashboard (follow-up cadence, overdue meetings)

**Super Manager (1 user, You)**
- View all clients across all 5 managers and teams
- Full edit rights everywhere
- Can view: Aggregated team health, coverage maps

---

## Tech Stack

**Frontend:** React 18+, Material-UI (MUI) v5+
**Backend:** Supabase (PostgreSQL + Auth)
**Hosting:** Railway (Docker, Git-based deploy)
**Authentication:** Supabase Auth (username/password, self-serve password reset)
**Styling:** Material Design, Responsive (mobile-first)
**Database:** PostgreSQL (Supabase managed)
**State Management:** React Context or Zustand (keep it simple)

---

## Architecture

### Frontend (React PWA)
- Single-page application (SPA)
- Service worker for offline caching
- Responsive Material Design UI (mobile, tablet, desktop)
- Real-time updates via Supabase subscriptions
- Client-side role-based access control

### Backend (Supabase)
- PostgreSQL database (schema below)
- Row-level security (RLS) policies for role-based access
- Supabase Auth for user management
- RESTful API (auto-generated from tables)
- Realtime subscriptions for live updates

### Deployment
- Frontend: Build React app, push to Railway as Docker container
- Backend: Supabase hosted (no deployment needed)
- Database: Supabase PostgreSQL (managed)
- PWA: Add manifest.json, service worker, install-to-home-screen capability

---

## Database Schema (PostgreSQL / Supabase)

### 1. users
```
id (UUID, primary key)
username (TEXT, unique, not null)
email (TEXT, unique, not null)
role (ENUM: 'team_member', 'manager', 'super_manager')
manager_id (UUID, foreign key to users.id, nullable)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
is_active (BOOLEAN, default true)
```

### 2. accounts
```
id (UUID, primary key)
name (TEXT, not null) -- Company name (e.g., "Westpac", "CBA", "ANZ")
owner_id (UUID, foreign key to users.id, not null) -- Sales lead who owns this account
industry (TEXT, nullable) -- e.g., "Banking", "Insurance", "Wealth"
account_size (TEXT, nullable) -- e.g., "Enterprise", "Large", "Medium"
annual_revenue (TEXT, nullable) -- Optional strategic info
strategic_importance (ENUM: 'tier1', 'tier2', 'tier3', nullable) -- Account classification
notes (TEXT, nullable) -- Account-level notes
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
is_active (BOOLEAN, default true)
```

### 3. clients
```
id (UUID, primary key)
account_id (UUID, foreign key to accounts.id, not null) -- Which account this executive belongs to
name (TEXT, not null) -- Executive name
title (TEXT, not null) -- Job title (e.g., "CFO", "Head of Risk")
email (TEXT, nullable)
phone (TEXT, nullable)
assigned_to (UUID, foreign key to users.id, not null) -- Which team member manages this relationship
created_by (UUID, foreign key to users.id) -- Who created this record
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
is_active (BOOLEAN, default true)
```

### 4. client_details
```
id (UUID, primary key)
client_id (UUID, foreign key to clients.id, unique)
hot_buttons (TEXT, nullable) -- JSON or plain text, user-entered
key_focus_areas (TEXT, nullable)
likes (TEXT, nullable)
dislikes (TEXT, nullable)
notes (TEXT, nullable) -- General notes about the relationship
updated_at (TIMESTAMP)
```

### 5. meetings
```
id (UUID, primary key)
client_id (UUID, foreign key to clients.id, not null)
account_id (UUID, foreign key to accounts.id, not null) -- Denormalized for query efficiency (can be derived from client_id)
logged_by (UUID, foreign key to users.id)
meeting_date (DATE)
attendees (TEXT) -- JSON: [user_id1, user_id2] or comma-separated
topics_discussed (TEXT) -- JSON array or comma-separated: ["Strategy", "Pricing", "Custom"]
topics_custom (TEXT, nullable) -- Free-text additional topics
discussion_summary (TEXT, nullable) -- What was discussed (for cadence view)
outcomes (TEXT, nullable) -- Free-text outcomes
client_sentiment (ENUM: 'very_negative', 'negative', 'neutral', 'positive', 'very_positive')
next_followup (ENUM: '1_week', '1_month', '1_quarter', 'custom')
next_followup_date (DATE, nullable) -- If custom is selected
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### 6. meeting_attendees (Normalized, Optional)
```
id (UUID, primary key)
meeting_id (UUID, foreign key to meetings.id)
user_id (UUID, foreign key to users.id)
-- Allows querying "who attended this meeting?" easily
```

### Data Relationships
```
users (1) ----< (many) accounts (owner_id)
users (1) ----< (many) clients (assigned_to)
accounts (1) ----< (many) clients (account_id)
clients (1) ----< (many) meetings (client_id)
users (1) ----< (many) manager_id (hierarchy: manager --> team members)
```

---

## Security & Access Control

### Authentication
- Supabase Auth handles login/logout
- Username + password (no email required for login)
- Password reset: self-service via email link (Supabase built-in)
- Session tokens stored in HTTP-only cookies (Supabase default)

### Authorization (Row-Level Security in PostgreSQL)

**Team Member can:**
- Read clients assigned to them
- Read/create meetings for their own clients
- Update client details for their own clients
- Cannot see other team members' clients (unless their manager, or super manager)

**Manager can:**
- Read all clients assigned to their team members
- Read/edit all meetings for their team members' clients
- View Account Cadence (all clients in accounts where team has assigned clients)
- Cannot read other managers' team data

**Super Manager can:**
- Read/update all data across all teams and accounts

**Example RLS Policies:**

*Team member sees only their clients:*
```sql
CREATE POLICY team_member_policy ON clients
  FOR SELECT
  USING (
    auth.uid() = assigned_to 
    OR auth.uid() IN (
      SELECT id FROM users WHERE id = (
        SELECT manager_id FROM users WHERE id = auth.uid()
      )
    )
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'super_manager'
  );
```

*Manager sees team's clients:*
```sql
CREATE POLICY manager_view_team_clients ON clients
  FOR SELECT
  USING (
    (SELECT manager_id FROM users WHERE id = assigned_to) = auth.uid()
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'super_manager'
  );
```

*Meetings filtered by client access:*
```sql
CREATE POLICY meetings_visibility ON meetings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = meetings.client_id 
      AND (
        clients.assigned_to = auth.uid()
        OR (SELECT manager_id FROM users WHERE id = clients.assigned_to) = auth.uid()
        OR (SELECT role FROM users WHERE id = auth.uid()) = 'super_manager'
      )
    )
  );
```

### Data Privacy
- No sensitive data (SSN, passwords) stored in app
- Email and phone optional, used only for transition/contact
- All data encrypted in transit (HTTPS)
- Supabase encryption at rest (default)
- Access logs: Track who views which clients (optional, Phase 2)
- Deletion: Soft delete clients (is_archived flag) to preserve meeting history

---

## Development Standards

### Code Quality
- ESLint + Prettier for code formatting
- TypeScript recommended (but not mandatory for MVP)
- Component-based architecture (reusable, testable)
- Clear naming: `ClientCard.jsx`, `MeetingLogger.jsx`, `ManagerDashboard.jsx`

### Git Workflow
- Main branch: production-ready code
- Feature branches: feature/client-card, feature/meeting-logger, etc.
- Commit messages: "feat: add client card", "fix: attendee auto-fill", etc.

### Environment Variables
```
REACT_APP_SUPABASE_URL=<your-supabase-url>
REACT_APP_SUPABASE_ANON_KEY=<your-anon-key>
REACT_APP_API_BASE_URL=<railway-backend-url>
```

### Error Handling
- User-friendly error messages (avoid technical jargon)
- Log errors to console/Sentry (Phase 2)
- Graceful fallbacks for network failures
- Offline mode: Cache critical data locally (service worker)

---

## Testing Strategy

### Unit Tests (Component & Logic)
- Test user login flow
- Test client card CRUD operations
- Test meeting log submission
- Test role-based filtering (manager sees team data, member doesn't)
- Tool: Jest + React Testing Library

### Integration Tests
- Test end-to-end user flows (login → create client → log meeting → see on dashboard)
- Test Supabase connectivity and RLS policies
- Test data persistence across sessions
- Tool: Cypress or Playwright

### Manual Testing Checklist
- [ ] Login with different roles (team member, manager, super manager)
- [ ] Team member creates client, manager can see it
- [ ] Team member logs meeting, meeting appears in history
- [ ] Manager can edit team member's client card
- [ ] Follow-up reminder card shows correct clients
- [ ] Attendee auto-fill works (first time manual, next time auto-populated)
- [ ] Mobile responsiveness (test on phone, tablet, desktop)
- [ ] Offline mode (disable network, create client, sync when online)
- [ ] Password reset flow works
- [ ] Search/filter clients works

### Performance Testing
- App load time: < 3 seconds (PWA with caching)
- Meeting log submission: < 2 seconds
- Client search: instant (< 500ms)
- Monitor with Lighthouse or WebPageTest

---

## Design & UX Principles

### Adoption-First Philosophy
- Every feature must answer: "How does this help the user do their job faster or better?"
- Speed over features: 90-second meeting log, not 10-minute form
- Delight over complexity: Emoji sentiment, checkboxes for topics, not free-text essays

### Design System (Material Design)
- **Colors:** Use MUI default theme (primary blue, accent, success/warning/error)
- **Typography:** Roboto font, clear hierarchy (H1, H2, P, caption)
- **Spacing:** 8px grid system (8, 16, 24, 32px margins)
- **Icons:** MUI Icons library (consistent, recognizable)
- **Buttons:** Primary (solid blue), secondary (outlined), tertiary (text)

### Responsive Design
- **Mobile-first approach:** Design for 375px width first, then tablet (768px), then desktop (1200px+)
- **Breakpoints:** xs (0-600px), sm (600-960px), md (960-1264px), lg (1264px+)
- **Touch-friendly:** Buttons 48x48px minimum, spacing for fat fingers
- **Readable text:** Font size >= 16px on mobile, line-height 1.5

### Key Screens & UX Flows

**1. Login Screen**
- Username field, password field, login button
- "Forgot password?" link (self-serve reset)
- Clean, minimal, Material Design

**2. Dashboard (Team Member View)**
- Top section: "My Accounts" tabs or selector
  - Display accounts they own or have assigned clients in
  - Dropdown/tabs to switch between accounts
- For selected account, show: "Follow-ups Due This Week" card
  - Lists all your clients in this account with next follow-up dates
  - Red/warning if overdue
- Below: "Key Clients in [Account Name]" list
  - All assigned clients in this account
  - Last meeting date, next follow-up date, current cadence
  - Click to open client detail card
- Floating action button: "Add Client to Account"

**3. Account Cadence View (Manager View) - KEY VIEW**
- Account name (e.g., "Westpac")
- Account owner name
- Table showing all key clients in account:
  | Client Name | Title | Assigned To | Last Meeting | Discussion | Next Follow-up | Days Since | Status |
  | CFO | John Smith | Ani (You) | 2024-06-01 | Strategy review | 2024-07-01 | 3 days | On Track |
  | Head of Risk | Sarah Jane | Manager1 | 2024-05-15 | Risk framework | 2024-06-15 | 19 days | Overdue |
  | CTO | Mike Chen | Team Member 3 | 2024-06-10 | Tech roadmap | 2024-07-10 | Pending | On Track |
  
- Color coding: Green (on track), Orange (due soon), Red (overdue)
- Ability to filter by "Assigned To" (see team member's clients vs all)
- Manager can click into any client to see full details and edit

**4. Client Card**
- Header: Client name, title, account name
- Quick details: Email, phone (if filled)
- Tabs or sections:
  - Overview: Hot buttons, key focus areas, likes, dislikes (editable)
  - Meeting history: Timeline, most recent first (with discussion summary)
  - Next follow-up: Date and status (on-track, overdue)
- Button: "Log Meeting"

**5. Meeting Logger (Modal/Side Panel)**
- Pre-filled: Date (today), attendees (from memory), client (from context), account (auto-filled from client)
- Topics discussed: Checkboxes (Strategy, Pricing, Product, Relationship, Custom) + optional free text
- Discussion Summary: Text area (what was discussed, for cadence view) **NEW**
- Outcomes: Text area (free-text)
- Sentiment: Emoji scale (very sad to very happy, 5 options)
- Next follow-up: Dropdown (1 week, 1 month, 1 quarter)
- Submit button: "Log Meeting"

**6. Manager Dashboard (Updated)**
- Accounts selector/tabs showing accounts where team has assigned clients
- For each account:
  - Account name, owner
  - Quick health snapshot: "3 clients on track, 2 overdue, 0 due soon"
  - "View Cadence" button → opens Account Cadence View
- List of team members with assigned clients count

**7. Super Manager Dashboard**
- All managers with their teams
- All accounts with owner names
- Drill-down to manager view or account cadence

### Color & Emotion
- Success (green): Meeting on track, cadence healthy
- Warning (orange): Follow-up due in 3-7 days
- Error (red): Follow-up overdue by 7+ days
- Neutral (blue): Default, in-progress

---

## Feature Breakdown (Phase 1 MVP)

### Must Have
- [ ] User authentication (login, password reset, logout)
- [ ] Create/manage accounts (name, owner, strategic importance)
- [ ] Assign clients to accounts (map executives to companies)
- [ ] Assign clients to team members within accounts (multi-level stakeholder mapping)
- [ ] Create client card (name, title, email, phone)
- [ ] Edit client details (hot buttons, focus areas, likes, dislikes)
- [ ] Log meeting (date, attendees, topics, discussion summary, outcomes, sentiment, follow-up)
- [ ] View client card (full history, next follow-up, last discussion)
- [ ] Account Cadence View (manager sees all clients in account, last meeting, discussion, next follow-up)
- [ ] Search/filter clients by account and name
- [ ] Role-based access (team member, manager, super manager)
- [ ] Dashboard with follow-ups due this week (per account)
- [ ] Attendee auto-fill (first time manual, next time memory)
- [ ] PWA capabilities (install to home screen, offline caching)

### Should Have (Phase 2)
- [ ] Push notifications for overdue follow-ups
- [ ] Bulk client import (CSV upload)
- [ ] Export account cadence (PDF/CSV)
- [ ] Client transfer (when user leaves)
- [ ] Activity log (manager can see who edited what, when)
- [ ] Client health scoring (meeting frequency, sentiment trend)
- [ ] Account health dashboard (all accounts overview)

### Could Have (Phase 3+)
- [ ] Integration with Google Calendar (pull attendees from invite)
- [ ] Automated email reminders
- [ ] Analytics dashboard (team meeting metrics, cadence by account)
- [ ] Native iOS/Android apps (convert from PWA)
- [ ] Integration with Salesforce/Dynamics (sync accounts and opportunities)

---

## Deployment on Railway

### Step 1: Prepare Docker Container
Create `Dockerfile` at project root:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Create `.dockerignore`:
```
node_modules
.git
.gitignore
```

### Step 2: Push to GitHub
- Commit all code to GitHub repo
- Railway auto-detects Node.js app

### Step 3: Deploy on Railway
1. Go to railway.app
2. New project > Deploy from GitHub repo
3. Select repo, Railway auto-detects Node.js
4. Set environment variables (REACT_APP_SUPABASE_URL, etc.)
5. Railway builds and deploys automatically
6. Get public URL (e.g., app-prod-xyz.railway.app)

### Step 4: PWA Manifest & Service Worker
- Add `public/manifest.json` (app name, icons, colors)
- Add service worker for offline caching
- Update `index.html` to reference manifest and service worker

### Step 5: Custom Domain (Optional)
- Railway > Project Settings > Domains > Add custom domain
- Point DNS to Railway

---

## API Endpoints (Auto-Generated by Supabase)

Supabase auto-generates REST API from tables. Examples:

```
POST /rest/v1/clients              -- Create client
GET  /rest/v1/clients?assigned_to=eq.<user_id>  -- Get user's clients
PATCH /rest/v1/clients?id=eq.<id>  -- Update client
DELETE /rest/v1/clients?id=eq.<id> -- Delete client

POST /rest/v1/meetings             -- Log meeting
GET  /rest/v1/meetings?client_id=eq.<id>  -- Get meetings for client
```

Use Supabase JavaScript client library for clean API calls:
```javascript
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('assigned_to', userId);
```

---

## Deliverables Checklist

- [ ] React app with Material Design UI
- [ ] Supabase project with schema and RLS policies
- [ ] Authentication flow (login, password reset)
- [ ] Client CRUD (create, read, update, delete)
- [ ] Meeting logger with auto-fill
- [ ] Dashboard with follow-ups and client list
- [ ] Manager view (team health, drill-down)
- [ ] Super manager view (aggregate)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Service worker for offline caching
- [ ] PWA manifest
- [ ] Docker container
- [ ] Deployed on Railway (public URL)
- [ ] Unit tests (Jest)
- [ ] Integration tests (Cypress)
- [ ] Manual testing checklist completed
- [ ] Documentation (setup, deployment, user guide)

---

## Development Priorities

1. **Week 1:** Auth + Account setup + Client card basics (create, read, edit within account)
2. **Week 2:** Meeting logger + Dashboard (per account) + Attendee auto-fill
3. **Week 3:** Account Cadence View (manager view) + Role-based access control
4. **Week 4:** PWA setup, responsiveness, testing, Railway deployment

---

## Notes for Claude Code

- Start with frontend (React components), mock Supabase data locally
- Once components are solid, connect to real Supabase
- Build incrementally: auth → accounts → clients → meetings → cadence view
- Test frequently on mobile (use browser DevTools or real phone)
- Keep components small and testable (single responsibility)
- Use MUI theming for consistency (avoid inline styles)
- Handle loading and error states gracefully (show spinners, error messages)

**Critical UI: Account Cadence View**
- This is the manager's workhorse. It needs to load fast and be scannable.
- Table format is best (not cards)
- Color-coded status (green/orange/red) at a glance
- Sortable by "Days Since Last Meeting" or "Status"
- This view drives adoption because managers can coach in real-time ("Sarah, Client X is overdue 19 days")
- Make sure discussion summary is visible (they need context on what was discussed last)

---

## Success Metrics

- Adoption: 80%+ of team members active in app within 1 month
- Usage: Average 2+ meetings logged per team member per week
- Speed: Meeting log submission < 2 minutes
- Manager satisfaction: Can identify overdue follow-ups in < 30 seconds
- System reliability: 99.5% uptime, zero data loss