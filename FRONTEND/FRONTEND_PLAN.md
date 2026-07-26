# Frontend Plan — Win-O-Learn (Hackathon Management Platform)

Stack: **Vite (latest) + React + React Router DOM + Tailwind CSS v4 + Axios + TanStack Query**
Backend: Node/Express/MongoDB — already built. Every route, model field, and enum below is taken directly from your `BACKEND/` source and `TEST_CASES.md`, not assumed.

This single document is the source of truth for both **architecture** (Part 1) and **visual design** (Part 2), so a page can be built end-to-end from this file alone.

---

# PART 1 — Architecture & Build Plan

## 1. API Reference

Base URL: `/api` (set via `VITE_API_BASE_URL` in `.env`)

| Domain | Method | Endpoint | Roles |
|---|---|---|---|
| **Auth** | POST | `/auth/signup`, `/auth/login` | public |
| | POST | `/auth/logout` | auth |
| | GET | `/auth/me` | auth |
| | POST | `/auth/refresh-token` | public (cookie) |
| | PUT | `/auth/change-password` | auth |
| | POST | `/auth/forgot-password`, `/auth/reset-password/:token` | public |
| **Users** | GET/PUT | `/users/me`, `/users/me/avatar` | auth |
| | GET | `/users`, `/users/:id` | admin |
| | PUT/DELETE | `/users/:id` | admin |
| | PATCH | `/users/:id/block`, `/unblock`, `/role` | admin |
| **Hackathons** | GET | `/hackathons` (filters: search, theme, mode, registrationOpen, status, sort), `/hackathons/:id` | public |
| | POST/PUT/DELETE | `/hackathons`, `/hackathons/:id` | organizer / admin (delete) |
| | GET | `/hackathons/my` | organizer |
| | PATCH | `/hackathons/:id/open-registration`, `/close-registration`, `/publish-results` | organizer (owner) |
| | PUT | `/hackathons/:id/banner` (multipart, 5MB max) | organizer (owner) |
| **Judges** | POST/GET/DELETE | `/hackathons/:hackathonId/judges`, `/judges/:judgeId` | organizer (owner) / admin (GET) |
| | GET | `/judges/me/assigned-hackathons` | judge |
| **Leaderboard** | GET | `/hackathons/:hackathonId/leaderboard` | public (only once `resultsPublished`) |
| | GET | `/hackathons/:hackathonId/leaderboard/recalculate` | organizer (owner) / admin |
| **Teams** | GET | `/teams` (admin), `/teams/:id` (any auth) | — |
| | POST/PUT/DELETE | `/teams`, `/teams/:id` | participant (leader for PUT/DELETE) |
| | POST | `/teams/:id/invite`, `/invite/accept`, `/invite/reject` | participant |
| | PATCH | `/teams/:id/leader` | participant (leader) |
| | POST/DELETE | `/teams/:id/leave`, `/teams/:id/members/:userId` | participant |
| **Registrations** | POST/DELETE | `/hackathons/:hackathonId/register`, `/register/:teamId` | participant (leader) |
| | GET | `/hackathons/:hackathonId/register/status/:teamId` | participant (team member) |
| | GET | `/hackathons/:hackathonId/registrations` | organizer (owner) |
| | PATCH | `/registrations/:registrationId/approve`, `/reject` | organizer (owner) |
| **Submissions** | POST | `/hackathons/:hackathonId/submissions` | participant (leader) |
| | GET | `/hackathons/:hackathonId/submissions/mine` | participant (team member) |
| | GET | `/hackathons/:hackathonId/submissions` | organizer (owner) |
| | GET | `/submissions` (admin), `/submissions/:id` (admin/organizer/team member/assigned judge) | — |
| | PUT | `/submissions/:id`, `/submissions/:id/files` | participant (leader), before deadline |
| | PATCH | `/submissions/:id/status` | organizer (owner) |
| **Reviews** | POST | `/submissions/:submissionId/reviews` | judge (assigned) |
| | PUT/GET | `/reviews/:id` | judge (own review to edit) / admin / organizer / assigned judge (view) |
| | GET | `/judges/me/reviews` | judge |
| | GET | `/submissions/:submissionId/reviews`, `/hackathons/:hackathonId/reviews` | admin / organizer (owner) / assigned judge |
| **Dashboard** | GET | `/dashboard/admin`, `/organizer`, `/participant`, `/judge` | role-specific |
| **Health** | GET | `/health` | public |

### Model fields (for forms & validation)

- **User**: `name` (2–50), `email`, `password` (8+, upper+digit+special), `role` (admin/organizer/participant/judge), `avatar`, `bio` (≤300), `skills[]`, `socials{github,linkedin,portfolio}`, `isBlocked`
- **Hackathon**: `title` (5–150), `description` (20–5000), `theme` (2–100), `mode` (online/offline), `venue` (required if offline), `registrationStartDate`, `registrationDeadline`, `startDate`, `endDate`, `submissionDeadline` (chronological order enforced by backend), `banner`, `prizePool` (≥0), `maxTeamSize` (1–10), `rules[]` (≤20 items, ≤200 chars each), `judgingCriteria[{criterion, maxMarks (1–100)}]`, `registrationOpen`, `resultsPublished`
- **Team**: `name` (3–50), `description` (≤500), `leader`, `members[]`, `pendingInvites[{user, invitedBy, invitedAt}]`
- **Registration**: `hackathon`, `team`, `status` (pending/approved/rejected), `respondedBy`, `respondedAt`
- **Submission**: `projectName` (3–100), `problemStatement` (≤5000), `solutionDescription` (≤10000), `githubRepo`, `liveDemoUrl`, `techStack[]`, `screenshots[]`, `presentation`, `demoVideo`, `status` (pending/under_review/approved/rejected), `averageScore`, `reviewCount` — score fields hidden from participants until `resultsPublished`
- **Review**: `scores[{criterion, score}]` (one per hackathon `judgingCriteria`, capped at `maxMarks`), `totalScore` (computed), `feedback` (≤5000)

---

## 2. Project Setup

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install react-router-dom axios @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install @heroicons/react recharts framer-motion react-hot-toast
npm install tailwindcss @tailwindcss/vite
```

`vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

Tailwind v4 needs no `tailwind.config.js` for this project — all tokens are defined in CSS (see Part 2, §3).

---

## 3. Folder Structure

```
frontend/
├── src/
│   ├── api/                   # axios instance + one file per resource
│   │   ├── axiosClient.js
│   │   ├── auth.api.js
│   │   ├── users.api.js
│   │   ├── hackathons.api.js
│   │   ├── teams.api.js
│   │   ├── registrations.api.js
│   │   ├── submissions.api.js
│   │   ├── judges.api.js
│   │   ├── reviews.api.js
│   │   ├── leaderboard.api.js
│   │   └── dashboard.api.js
│   ├── assets/
│   ├── components/
│   │   ├── ui/                 # Button, Input, Select, Textarea, Card, Modal, Badge,
│   │   │                        # Avatar, Table, Tabs, Tooltip, Dropdown, Checkbox,
│   │   │                        # Skeleton, Spinner, EmptyState, Pagination, Toast
│   │   ├── layout/              # Navbar, Sidebar, Footer, Container, PageHeader
│   │   ├── auth/                 # LoginForm, SignupForm, ProtectedRoute, RoleRoute
│   │   ├── hackathon/            # HackathonCard, HackathonForm, HackathonFilters,
│   │   │                          # JudgingCriteriaEditor, RulesEditor, RegistrationCTA, LifecycleBadge
│   │   ├── team/                  # TeamCard, InviteMemberModal, MemberList, TransferLeaderModal
│   │   ├── submission/            # SubmissionForm, SubmissionCard, StatusBadge
│   │   ├── review/                 # ScoreForm, ReviewCard
│   │   ├── leaderboard/            # LeaderboardTable, RankBadge
│   │   └── dashboard/               # StatCard, AnalyticsChart, ActivityList
│   ├── context/
│   │   ├── AuthContext.jsx        # user, role, login, logout, refresh
│   │   └── ThemeContext.jsx       # light/dark toggle, persisted
│   ├── hooks/                      # useAuth, useTheme, useDebounce, + React Query hooks
│   │   ├── useHackathons.js
│   │   ├── useTeams.js
│   │   ├── useSubmissions.js
│   │   └── ...
│   ├── layouts/
│   │   ├── MainLayout.jsx          # public: Navbar + Footer
│   │   ├── DashboardLayout.jsx      # sidebar + navbar, role-aware
│   │   └── AuthLayout.jsx
│   ├── pages/
│   │   ├── public/                  # Home, Listing, Details, Leaderboard, 404
│   │   ├── auth/                    # Login, Signup, ForgotPassword, ResetPassword
│   │   ├── shared/                  # Profile
│   │   ├── admin/                   # Dashboard, Users, Hackathons, Teams, Analytics
│   │   ├── organizer/               # Dashboard, MyHackathons, CreateEdit, Manage (tabs)
│   │   ├── participant/             # Dashboard, MyTeams, TeamDetails, Registrations, Submission
│   │   └── judge/                   # Dashboard, AssignedHackathons, SubmissionQueue, Review, MyReviews
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── utils/
│   │   ├── constants.js             # ROLES, STATUS enums — mirror backend exactly
│   │   ├── formatDate.js
│   │   ├── hackathonStatus.js       # derives upcoming/ongoing/completed from dates
│   │   └── theme.js                 # reads CSS vars for JS/chart consumption
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## 4. Core Infrastructure

### Axios client (`api/axiosClient.js`)
- `baseURL: import.meta.env.VITE_API_BASE_URL`, `withCredentials: true` (backend sets httpOnly `accessToken`/`refreshToken` cookies — no manual header needed).
- Response interceptor: on `401`, call `POST /auth/refresh-token` once, retry the original request; if that also fails, clear `AuthContext` and redirect to `/login`.

### AuthContext
- Holds `user`, `role`, `isLoading`.
- On app load, calls `GET /auth/me` to hydrate session (cookie survives refresh).
- Exposes `login()`, `signup()`, `logout()`, `changePassword()`.
- If `user.isBlocked` ever comes back true (e.g. from a 403 mid-session), force logout with a toast.

### Route Guards
- `<ProtectedRoute>` — redirects to `/login` if unauthenticated.
- `<RoleRoute allow={['admin']}>` — redirects to the user's own dashboard if role mismatch. Mirrors the backend's `AuthorizeRoles` middleware 1:1 so the UI never offers an action the API would reject.

### Constants (`utils/constants.js`)
```js
export const ROLES = { ADMIN: 'admin', ORGANIZER: 'organizer', PARTICIPANT: 'participant', JUDGE: 'judge' };
export const HACKATHON_MODE = ['online', 'offline'];
export const REGISTRATION_STATUS = ['pending', 'approved', 'rejected'];
export const SUBMISSION_STATUS = ['pending', 'under_review', 'approved', 'rejected'];
```

### Server state — TanStack Query
Every list/detail fetch goes through a React Query hook (`useHackathons`, `useTeam(id)`, etc.) with sane `staleTime` per resource (public listings can cache longer than live registration tables). Mutations (`useMutation`) invalidate the relevant query key on success — e.g. approving a registration invalidates both the registrations list and that hackathon's dashboard stats.

### Forms — React Hook Form + Zod
Each form (`HackathonForm`, `TeamForm`, `SubmissionForm`, `ScoreForm`, etc.) has a co-located Zod schema mirroring the backend validator exactly (same min/max lengths, same enum values, same date-order rules), so client errors match server errors and nothing gets rejected as a surprise on submit.

---

## 5. Full Page List & Features (30 pages, per capstone brief §8)

### A. Public Pages — `MainLayout`

**1. Home (`/`)** — Hero, Featured Hackathons (`GET /hackathons?sort=-prizePool&limit=6`), Upcoming Events (`?status=upcoming`), "Why Participate", Statistics strip, Previous Winners (hackathons with `resultsPublished: true`), Testimonials, Footer.

**2. Hackathon Listing (`/hackathons`)** — `HackathonCard` grid, `HackathonFilters` (mode, theme, registration open/closed, upcoming/ongoing/completed), debounced search, pagination, empty state.

**3. Hackathon Details (`/hackathons/:id`)** — banner, description, timeline (all 5 dates), prize pool, `maxTeamSize`, judging criteria table, rules list. `RegistrationCTA` changes by role/state: guest → "Login to Register"; participant w/o team → "Create a Team First"; leader, registration open → "Register My Team"; already registered → status badge; owning organizer → "Manage Hackathon". Public leaderboard preview if `resultsPublished`.

**4. Leaderboard (`/hackathons/:id/leaderboard`)** — full ranked table (rank, team, project, total score), "Recalculate" button for organizer/admin only.

**5. 404**

### B. Auth Pages — `AuthLayout`

**6. Signup** (name/email/password/role — participant/organizer/judge only, never admin) · **7. Login** (redirects to role dashboard) · **8. Forgot Password** · **9. Reset Password (`/reset-password/:token`)**

### C. Shared Authenticated

**10. Profile (`/profile`)** — edit name/bio/skills/socials (`PUT /users/me`), avatar upload (`PUT /users/me/avatar`), change password section, theme toggle (secondary location).

**11. Team Page (`/teams/:id`)** — name, description, leader badge, `MemberList` with avatars. Leader-only: edit, invite (by email), remove member, transfer leadership, delete team (blocked if the team has any registration). Member: leave (blocked for the leader unless leadership is transferred first). Pending invites shown both ways (outgoing to leader, incoming to invitee, with accept/reject).

**12. My Teams (`/teams`)** — teams the user belongs to; "Create Team" → modal → `POST /teams`.

### D. Participant Pages (`/dashboard/participant/*`)

**13. Dashboard** — `GET /dashboard/participant`: registered hackathon count, team(s), submission status, results summary.

**14. My Registrations** — status badge per hackathon; cancel → `DELETE /hackathons/:hackathonId/register/:teamId` (leader only).

**15. Submission Page (`/hackathons/:hackathonId/submit`)** — `SubmissionForm` (projectName, problemStatement, solutionDescription, githubRepo, liveDemoUrl, techStack tag input, screenshots, presentation, demoVideo). Leader-only, only if registration is `approved` and before `submissionDeadline`. Edit via `PUT /submissions/:id` and `PUT /submissions/:id/files`. Status shown via `StatusBadge`.

**16. My Submission** — `GET /hackathons/:hackathonId/submissions/mine`.

### E. Organizer Pages (`/dashboard/organizer/*`)

**17. Dashboard** — `GET /dashboard/organizer`: hackathon count, total registrations, submissions, results-published count.

**18. My Hackathons** — `GET /hackathons/my`, cards with edit/delete/manage.

**19. Create/Edit Hackathon** — multi-section form: basic info → dates (client-validated chronological, mirroring backend) → prize pool/team size → `RulesEditor` (dynamic string list) → `JudgingCriteriaEditor` (dynamic `{criterion, maxMarks}` list) → banner upload as a separate call (`PUT /hackathons/:id/banner`, after the hackathon exists).

**20. Manage Hackathon** — tabbed:
- **Registrations**: table, Approve/Reject → `PATCH /registrations/:id/approve|reject`
- **Judges**: assign by searching users with `role=judge`, remove → `POST/DELETE /hackathons/:id/judges(/:judgeId)`
- **Submissions**: view all, change status → `PATCH /submissions/:id/status`
- **Controls**: Open/Close Registration, Publish Results toggles
- **Leaderboard**: view + recalculate

### F. Judge Pages (`/dashboard/judge/*`)

**21. Dashboard** — `GET /dashboard/judge`: assigned projects, pending reviews, completed reviews.

**22. Assigned Hackathons** — `GET /judges/me/assigned-hackathons`.

**23. Submission Queue** — submissions for an assigned hackathon.

**24. Review Submission** — read-only submission detail + `ScoreForm` (one input per that hackathon's `judgingCriteria`, capped at `maxMarks`) + feedback textarea. Create → `POST /submissions/:id/reviews`; edit own review → `PUT /reviews/:id`.

**25. My Reviews** — `GET /judges/me/reviews`, filter pending vs. completed.

### G. Admin Pages (`/dashboard/admin/*`)

**26. Dashboard** — `GET /dashboard/admin`: total users, hackathons, teams, submissions + charts.

**27. Manage Users** — table (name, email, role, blocked status, joined date), search + role filter, view/edit (`PUT /users/:id`), block/unblock, change role, delete (self-delete blocked, mirroring backend).

**28. Manage Hackathons** — global oversight, delete any (`DELETE /hackathons/:id`, admin override allowed by backend ownership middleware).

**29. Manage Teams** — read-only oversight (`GET /teams`).

**30. Platform Analytics** — expanded charts.

---

## 6. Reusable Component Library

| Component | Used in |
|---|---|
| `Navbar` (role-aware links, theme toggle) | all layouts |
| `Sidebar` (role-aware menu) | `DashboardLayout` |
| `HackathonCard` | Home, Listing, My Hackathons |
| `TeamCard` / `MemberList` | Team pages |
| `SubmissionForm` / `SubmissionCard` / `StatusBadge` | Submission flows |
| `ScoreForm` / `ReviewCard` | Judge review |
| `LeaderboardTable` | Details, Leaderboard, Manage |
| `StatCard`, `AnalyticsChart` (Recharts) | all 4 dashboards |
| `Modal`, `ConfirmDialog` | delete / block / invite actions |
| `Toast` (react-hot-toast) | every mutation |
| `Spinner`, `Skeleton`, `EmptyState`, `ErrorState` | every data-fetching page |
| `Pagination` | listings/tables |
| `SearchInput` (debounced) | listings |
| `FileUpload` (drag-drop, image/PDF) | banner, avatar, screenshots, presentation |
| `TagInput` | techStack, skills |
| `ProtectedRoute`, `RoleRoute` | routing |

---

## 7. Route Map

```
/                                   Home
/hackathons                         Listing
/hackathons/:id                     Details
/hackathons/:id/leaderboard         Leaderboard
/login /signup /forgot-password /reset-password/:token

--- protected (any role) ---
/profile
/teams  /teams/:id

--- role: participant ---
/dashboard                          (role-resolved)
/dashboard/registrations
/hackathons/:hackathonId/submit
/dashboard/submissions/mine

--- role: organizer ---
/dashboard/hackathons
/dashboard/hackathons/new
/dashboard/hackathons/:id/edit
/dashboard/hackathons/:id/manage

--- role: judge ---
/dashboard/judge/hackathons
/dashboard/judge/hackathons/:hackathonId/submissions
/dashboard/judge/submissions/:submissionId/review
/dashboard/judge/reviews

--- role: admin ---
/dashboard/admin/users
/dashboard/admin/hackathons
/dashboard/admin/teams
/dashboard/admin/analytics

*                                   404
```

A single `/dashboard` route renders `AdminDashboard` / `OrganizerDashboard` / `ParticipantDashboard` / `JudgeDashboard` based on `user.role`.

---

## 8. Build Order

1. Scaffold Vite + Tailwind v4 + Axios client + `AuthContext` + `ThemeContext` + route guards
2. Auth pages end-to-end (signup/login/logout/me/refresh)
3. Public pages (Home, Listing, Details, Leaderboard) — read-only, no auth required
4. Profile page
5. Team module (create, invite, accept/reject, leave, transfer, delete)
6. Participant flow: register team → submit project → track status
7. Organizer flow: create hackathon → manage registrations → assign judges → manage submissions → publish results
8. Judge flow: view assigned → review → score
9. Admin flow: user management → analytics
10. Polish: loading/empty/error states, responsive pass, motion, final accessibility check

---

## 9. Bonus Features (optional, spec §25)

- Countdown timer on Hackathon Details (to registration deadline / event start)
- Bookmark hackathons (client-side per participant, or a small backend addition)
- Pagination + infinite scroll on listings
- Certificate generation (client-side PDF from a template, post-results)

---

# PART 2 — Design System

Direction: clean, minimal, professional — closer to Linear/Notion than a "gaming" hackathon aesthetic, but warmed up by an earthy, muted palette instead of a cold SaaS gray. No neon, no cyberpunk accents.

## 1. Design Principles

1. **Minimalism first** — warm neutral backgrounds, generous spacing, one primary color, soft shadows, restrained motion.
2. **One state, one color** — every status badge maps 1:1 to a real backend enum value; nothing invented.
3. **Role clarity** — Admin/Organizer/Participant/Judge share the same visual language, differing only in sidebar scope.
4. **Data-dense pages stay calm** — Manage Hackathon, Admin Users lean on whitespace and type hierarchy, not heavy borders or saturated color.

## 2. Palette Source

Your 5 base colors, used directly, one semantic role each:

| Name | Hex |
|---|---|
| Black | `#000000` |
| Muted Teal | `#839788` |
| Champagne Mist | `#eee0cb` |
| Khaki Beige | `#baa898` |
| Pale Sky | `#bfd7ea` |

Dark mode is each color's per-channel inversion (`255 − value`), computed once and fixed as its own token — not a runtime filter:

| Name | Light hex | Dark hex (inverted) |
|---|---|---|
| Black → White | `#000000` | `#ffffff` |
| Muted Teal → Muted Mauve | `#839788` | `#7c6877` |
| Champagne Mist → Deep Navy | `#eee0cb` | `#111f34` |
| Khaki Beige → Slate Blue-Gray | `#baa898` | `#455767` |
| Pale Sky → Dark Umber | `#bfd7ea` | `#402815` |

Status colors (approved/pending/rejected/under-review) need hue-distinct signals that a neutral/earthy palette doesn't supply on its own, so four small additions are introduced — kept muted/desaturated to match the rest of the system, never saturated stock red/green:

| Token | Light | Dark |
|---|---|---|
| `success` (approved/active) | `#7c9a7c` muted sage | `#93b48f` |
| `warning` (pending) | `#c2954f` muted ochre | `#d1a562` |
| `error` (rejected/blocked) | `#b56b5f` muted terracotta | `#c98177` |
| `info` (under review/ongoing) | `#6f93ab` dusty blue | `#8fb3cf` |

## 3. Tailwind v4 Setup — CSS-first, no config file

Tailwind v4 reads tokens straight from CSS via `@theme`; there's no `tailwind.config.js` to keep in sync.

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-bg: #eee0cb;
  --color-surface: #f7f1e6;
  --color-card: #f7f1e6;
  --color-border: #d9c9ae;
  --color-text: #000000;
  --color-muted: #4a4440;

  --color-primary: #839788;
  --color-primary-hover: #6f8378;
  --color-primary-light: #dbe3dc;
  --color-primary-text-on: #000000;

  --color-secondary: #baa898;
  --color-accent: #bfd7ea;

  --color-success: #7c9a7c;
  --color-warning: #c2954f;
  --color-error: #b56b5f;
  --color-info: #6f93ab;

  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  --shadow-card: 0 1px 2px rgba(0,0,0,.06);
  --shadow-raised: 0 6px 20px rgba(0,0,0,.10);
  --shadow-lg: 0 12px 32px rgba(0,0,0,.16);
}

.dark {
  --color-bg: #111f34;
  --color-surface: #1a2b45;
  --color-card: #1a2b45;
  --color-border: #2a3d5c;
  --color-text: #ffffff;
  --color-muted: #b7c2d0;

  --color-primary: #7c6877;
  --color-primary-hover: #927b87;
  --color-secondary: #455767;
  --color-accent: #402815;
  --color-primary-light: #2c2530;
  --color-primary-text-on: #ffffff;

  --color-success: #93b48f;
  --color-warning: #d1a562;
  --color-error: #c98177;
  --color-info: #8fb3cf;

  --shadow-card: 0 1px 2px rgba(0,0,0,.4);
  --shadow-raised: 0 6px 20px rgba(0,0,0,.5);
  --shadow-lg: 0 12px 32px rgba(0,0,0,.6);
}

@layer base {
  body {
    background-color: var(--color-bg);
    color: var(--color-text);
    transition: background-color .2s, color .2s;
  }
}
```

Component-level utility classes (bridge tokens ↔ JSX, written once):

```css
.bg-primary    { background-color: var(--color-primary); }
.text-on-primary { color: var(--color-primary-text-on); }
.bg-surface    { background-color: var(--color-surface); }
.bg-card       { background-color: var(--color-card); }
.text-body     { color: var(--color-text); }
.text-muted    { color: var(--color-muted); }
.border-base   { border-color: var(--color-border); }

.badge-success { background-color: color-mix(in srgb, var(--color-success) 15%, transparent); color: var(--color-success); }
.badge-warning { background-color: color-mix(in srgb, var(--color-warning) 15%, transparent); color: var(--color-warning); }
.badge-error   { background-color: color-mix(in srgb, var(--color-error) 15%, transparent); color: var(--color-error); }
.badge-info    { background-color: color-mix(in srgb, var(--color-info) 15%, transparent); color: var(--color-info); }

.card  { border-radius: var(--radius-lg); box-shadow: var(--shadow-card); }
.modal { border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); }
.btn, .input { border-radius: var(--radius-md); }
```

Everything else — spacing (`p-4`, `gap-6`), type sizes (`text-2xl`), `flex`/`grid`, breakpoints — uses Tailwind's stock scale. Never write a raw hex or a `dark:` variant pair in a component; always use a token class. Example:

```jsx
<div className="card bg-card border border-base p-6 flex flex-col gap-4">
  <h3 className="text-xl font-semibold text-body">Hackathon Title</h3>
  <span className="badge-success text-xs font-medium px-2.5 py-1 rounded-full">Approved</span>
</div>
```

## 4. Typography

Font: **Inter** (system sans fallback), via `@fontsource/inter`.

| Style | Size | Weight | Used for |
|---|---|---|---|
| Hero | 48 | 700 | Home hero headline only |
| H1 | 36 | 700 | Page titles |
| H2 | 30 | 600 | Section headers |
| H3 | 24 | 600 | Card group headers, modal titles |
| Title | 20 | 600 | Card titles |
| Subtitle | 18 | 500 | Sub-headers |
| Body | 16 | 400 | Default text |
| Small | 14 | 400 | Meta text, table cells, timestamps |
| Tiny | 12 | 500 | Badges, labels, helper text |

Weights: 400 / 500 / 600 / 700 only.

## 5. Spacing, Radius, Shadow

Spacing scale (px): `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96`. Card padding `24px`, section gap `40px`, form field gap `16px`.

| Element | Radius |
|---|---|
| Button / Input | 10px |
| Card | 16px |
| Modal | 20px |
| Badge / Avatar | 999px |

Shadows: `shadow-card` (resting), `shadow-raised` (hover/dropdowns), `shadow-lg` (modals/popovers) — soft only, never harsh.

## 6. Layout

| Region | Spec |
|---|---|
| Sidebar | 240px fixed, collapses to a drawer on tablet/mobile |
| Navbar | 72px height |
| Content max-width | 1440px, centered |
| Card grid gap | 24px |
| Grid | 12 columns desktop / 8 tablet / 4 mobile |

- `MainLayout` — Navbar + Footer (Home / Listing / Details / Leaderboard / Auth)
- `DashboardLayout` — Sidebar + Navbar, role-aware sidebar content (§10)

## 7. Status Badges — mapped to real backend enums

**Registration.status**: `pending` → warning · `approved` → success · `rejected` → error

**Submission.status**: `pending` → warning · `under_review` → info · `approved` → success · `rejected` → error

**Hackathon lifecycle** (derived client-side from dates/flags, not stored): Upcoming → muted · Registration Open → success · Registration Closed → warning · Ongoing → info · Completed → muted · Results Published → primary

**User account**: Active → success · Blocked → error

All badges: pill (radius 999px), Tiny weight 500, 4px/10px padding, no border, background = semantic color at 15% mix, text = full-strength semantic color.

## 8. Core Components

**Button** — Primary: `bg-primary`, text `text-on-primary`. Secondary: `bg-card` + 1px `border-base`. Ghost: transparent, primary text on hover bg. Danger: `bg-error`, white text (Delete Hackathon, Remove Member, Block User). Height 44px, padding `16px 20px`, radius 10px; disabled = 50% opacity; loading = spinner replaces label.

**Input / Select / Textarea** — height 44px (textarea auto-grows), padding `12px 16px`, radius 10px, `border-base`. Focus: 2px primary ring. Error: error-colored border + Tiny helper text below.

**Card** — radius 16px, padding 24px, 1px border, `shadow-card` resting → `shadow-raised` + `translateY(-2px)` on hover for clickable cards (`HackathonCard`, `TeamCard`).

**Table** — header bold on `bg-surface`, sticky on scroll; row height 56px, border-bottom only; row hover = subtle surface tint. Used in Manage Registrations/Submissions, Admin Users, My Reviews.

**Modal** — 600px (900px for wide forms like Create Hackathon), radius 20px, padding 32px, backdrop blur.

**Sidebar** — logo top, nav items below; active item = `primary-light` background + `primary-text-on` text + 3px left accent bar in full-strength `primary`.

**Navbar** — global hackathon search (public pages only), notifications icon (future), profile menu (avatar/name/role tag/logout), theme toggle.

## 9. Theme Toggle Implementation

```jsx
// context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme')
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

Prevent flash-of-wrong-theme by setting the class before React mounts, directly in `index.html`:

```html
<script>
  (function () {
    var t = localStorage.getItem('theme')
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', t === 'dark');
  })();
</script>
```

`ThemeToggle` (Navbar): ghost icon button, 36px — Heroicons `SunIcon` shown in dark mode (click → light), `MoonIcon` in light mode (click → dark), quick fade + 15° rotate (Framer Motion, 0.2s). `prefers-color-scheme` sets only the *default*; once toggled, `localStorage` always wins. Also exposed as a secondary control on the Profile page.

**Rules going forward:**
1. Never write a raw hex or a `dark:` pair in a component — use the token classes from §3.
2. Banners/avatars/screenshots are user content and stay as-is in both themes; only chrome re-themes.
3. Recharts read series colors from CSS vars at render time (`utils/theme.js`, §11) and remount via `key={theme}` on toggle so charts re-color live.

## 10. Role-Scoped Sidebars

Driven by `AuthContext.role` — never a shared static menu.

```
Admin        Dashboard · Users · Hackathons · Teams · Analytics
Organizer    Dashboard · My Hackathons → Registrations / Judges / Submissions / Leaderboard
Participant  Dashboard · Browse Hackathons · My Team · My Registrations · My Submission
Judge        Dashboard · Assigned Hackathons · Submission Queue · My Reviews
```

Every sidebar ends with a persistent bottom section: **Profile** / **Logout**.

## 11. Design Tokens for JS (Recharts etc.)

```js
// utils/theme.js
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export const getThemeColors = () => ({
  primary: cssVar('--color-primary'),
  success: cssVar('--color-success'),
  warning: cssVar('--color-warning'),
  error: cssVar('--color-error'),
  info: cssVar('--color-info'),
  background: cssVar('--color-bg'),
  surface: cssVar('--color-surface'),
  border: cssVar('--color-border'),
  text: cssVar('--color-text'),
  muted: cssVar('--color-muted'),
});

export const tokens = {
  radius: { md: 10, lg: 16, xl: 20, full: 999 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 40, '3xl': 48, '4xl': 64 },
  typography: { hero: 48, h1: 36, h2: 30, h3: 24, title: 20, body: 16, small: 14, tiny: 12 },
};
```

## 12. Dashboard Cards (StatCard) — mapped to real payloads

- **Admin** (`/dashboard/admin`): Total Users · Total Hackathons · Total Teams · Total Projects
- **Organizer** (`/dashboard/organizer`): My Hackathons · Registrations · Submissions · Winners Announced
- **Participant** (`/dashboard/participant`): Registered Hackathons · Team · Submission Status · Results
- **Judge** (`/dashboard/judge`): Assigned Projects · Pending Reviews · Completed Reviews

`StatCard`: Heroicon top-left (20px, `outline` style, stroke matches token), value in H2/700, label in Small/muted below. `AnalyticsChart` (Recharts) beneath: rounded bar tops, minimal dashed gridlines (`stroke: var(--color-border)`), tooltip styled like a Card (radius 10px, `shadow-raised`).

## 13. Key Composite Components

- **HackathonCard** — 16:9 banner (radius 16 top corners), title, lifecycle badge, theme + mode tags, deadline as relative time ("Closes in 3 days"), prize pool, footer: View (+ Edit/Manage if organizer-owned).
- **TeamCard** — overlapping avatar group (max 5 + "+N"), leader tag, member count, associated hackathon + submission status if applicable.
- **SubmissionCard** — project name, team name, tech-stack pills, GitHub/Demo icon links, average score (if reviewed), status badge.
- **ReviewCard / ScoreForm** — one row per `judgingCriteria` entry (`criterion` + `/ maxMarks` input), running total, feedback textarea, Submit/Update.
- **LeaderboardTable** — Rank column with a trophy/medal Heroicon for top 3 (not emoji), Team, Project, Total Score (bold), sortable.

## 14. Motion (Framer Motion)

Duration 0.2–0.3s only, easing `easeOut`.

| Interaction | Animation |
|---|---|
| Page transition | Fade + 8px slide-up |
| Modal open/close | Scale 0.96 → 1 + fade |
| List load | Stagger children, 40ms each |
| Card hover | translateY(-2px) + shadow increase |
| Toast | Slide in top-right, fade out |

## 15. Icons & Charts

- **Icons**: `@heroicons/react`, `outline` variant by default (24px), `solid` reserved for filled/active states (e.g. active sidebar item, filled star/bookmark). Consistent size: 20px inline, 24px standalone.
- **Charts**: Recharts, rounded bar tops, dashed border-colored gridlines, tooltip styled as a Card.

## 16. Component API Convention

```jsx
<Button variant="primary" size="md" loading={false} disabled={false} leftIcon={<PlusIcon className="h-4 w-4" />}>
  Create Hackathon
</Button>

<Card padding="lg" shadow="card" hover>...</Card>

<Badge variant="success" size="sm">Approved</Badge>

<StatusBadge status="under_review" /> {/* single source of truth: enum → label + color */}
```

`StatusBadge` is the only place enum→color mapping lives — no page hardcodes a status color inline.

## 17. Component Folder Structure (design layer)

```
components/
├── ui/         Button, Input, Select, Textarea, Card, Modal, Badge,
│               Avatar, Table, Tabs, Tooltip, Dropdown, Checkbox,
│               Skeleton, Spinner, EmptyState, Pagination, Toast
├── layout/     Sidebar, Navbar, Container, PageHeader, Footer
├── dashboard/  StatCard, AnalyticsChart, ActivityList
├── hackathon/  HackathonCard, JudgingCriteriaEditor, RulesEditor, RegistrationCTA, LifecycleBadge
├── team/       TeamCard, MemberList, InviteMemberModal
├── submission/ SubmissionCard, SubmissionForm, StatusBadge
├── review/     ReviewCard, ScoreForm
└── common/     SearchBar, Filters, ConfirmDialog
```

Every component here has a known consumer page from Part 1, §5 — nothing speculative.

---

## 18. Recommended Tech Additions

| Library | Purpose |
|---|---|
| TanStack Query | server-state caching/invalidation across every list/detail page |
| React Hook Form + Zod | forms, validated against schemas mirroring backend validators |
| Framer Motion | page/modal/list transitions (§14) |
| Heroicons | icon set (§15) |
| Recharts | dashboard charts |
| TanStack Table (optional) | Admin Users, Manage Registrations/Submissions — sort/filter/pagination on real tabular data |
| react-hot-toast | mutation feedback |
