# Mission Control — Specification

## Concept & Vision

A custom operator dashboard for Josh — built for real daily use, not a generic admin panel. The feel is **Linear-meets-space-mission**: dark, precise, information-dense but breathable. Every element earns its place. The kind of tool you open first thing in the morning and actually enjoy using.

The personality: calm authority. Like a well-designed cockpit — everything in its place, nothing wasted.

## Design Language

### Aesthetic Direction
**Reference:** Linear app (dark mode) + NASA mission control density + modern SaaS polish.

### Color Palette
```
--bg-base:       #0D0D0F   (near-black, base background)
--bg-surface:    #141416   (card/panel surfaces)
--bg-elevated:   #1C1C1F   (elevated elements, hover states)
--bg-overlay:    #242428   (modals, dropdowns)
--border-subtle: #2A2A2F   (subtle borders)
--border-default:#333338   (default borders)
--text-primary:  #EDEDEF   (primary text)
--text-secondary:#9898A0   (secondary/muted text)
--text-tertiary: #5C5C66   (disabled/placeholder)
--accent-blue:   #4F7CF7   (primary accent, links, active states)
--accent-violet: #8B5CF6   (secondary accent, badges)
--accent-green:  #22C55E   (success, online, positive)
--accent-amber:  #F59E0B   (warning, in-progress)
--accent-red:    #EF4444   (error, critical, danger)
--accent-cyan:   #06B6D4   (info, telemetry, data)
```

### Typography
- **Font:** `Inter` (Google Fonts) with `-apple-system, BlinkMacSystemFont, sans-serif` fallback
- **Monospace:** `JetBrains Mono` for data, numbers, code
- **Scale:** 11px (xs), 13px (sm/body), 14px (md), 16px (lg), 20px (xl), 28px (2xl), 36px (3xl)
- **Weight:** 400 (regular), 500 (medium), 600 (semibold)

### Spatial System
- Base unit: 4px
- Standard spacing: 8, 12, 16, 20, 24, 32, 48px
- Sidebar width: 240px
- Top nav height: 48px
- Content max-width: 1400px

### Motion Philosophy
- **Duration:** 150ms for micro (hover, click), 200ms for transitions, 300ms for page elements
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (expo out — snappy but smooth)
- **Entrance:** Fade + subtle translateY(-4px), staggered 50ms
- **Hover:** Scale 1.0 → 1.02 on cards, background color shifts
- **No bouncy physics** — this is a tool, not a toy

### Visual Assets
- Icons: **Lucide React** (consistent 16px/20px stroke icons)
- No images — data-driven UI
- Subtle glow effects on active states
- Monospace numbers for a "telemetry" feel

## Layout & Structure

### Shell
```
┌─────────────────────────────────────────────────────┐
│  TOP NAV (48px) — Logo | Search | Status | Avatar  │
├────────────┬────────────────────────────────────────┤
│            │                                        │
│  SIDEBAR   │           MAIN CONTENT               │
│  (240px)   │           (fluid)                     │
│            │                                        │
│  - Logo    │                                        │
│  - Nav     │                                        │
│  - Footer  │                                        │
└────────────┴────────────────────────────────────────┘
```

### Pages
1. **Overview** (`/`) — Hero stats, recent activity, quick actions, system status
2. **Tools** (`/tools`) — Tool library, create/manage custom tools
3. **Activity** (`/activity`) — Event log, timeline, telemetry
4. **Settings** (`/settings`) — Config, preferences

### Sidebar Navigation
- Overview (grid icon)
- Tools (wrench icon)
- Activity (zap icon)
- —divider—
- Settings (gear icon)

## Features & Interactions

### Overview Screen
- **Stats row:** 4 metric cards (Active Tools, Events Today, Uptime %, Response Time)
- **Recent Activity:** Timeline of last 10 events with timestamps, type badges, descriptions
- **Quick Actions:** 3-4 prominent buttons (New Tool, View Logs, System Check)
- **System Status:** Mini dashboard showing connected services, health indicators

### Top Nav
- Left: Logo mark + "Mission Control" wordmark
- Center: Search bar (cmd+K to focus)
- Right: Connection status dot, notification bell, user avatar

### Sidebar
- Smooth hover states with background reveal
- Active state: accent color left border + bg tint
- Icons + labels, 40px row height
- Collapsible to icon-only mode (future)

### Tool Cards (Tools page)
- Grid layout (auto-fill, min 300px)
- Each card: name, description, status badge, last run timestamp, quick-action buttons
- Hover: subtle lift + border glow
- Empty state: illustration + "Create your first tool" CTA

### Activity Feed
- Reverse-chronological timeline
- Each entry: timestamp (monospace), event type icon, message, metadata
- Filterable by type (tool run, system event, error)
- Infinite scroll with skeleton loading

### Interactions
- Hover: 150ms bg color transition, subtle scale
- Click: immediate feedback (no 200ms delays on actions)
- Navigation: 200ms fade transition between pages
- Modals: backdrop blur, slide-up entrance

## Component Inventory

### StatCard
- States: default, loading (skeleton pulse), error (red border)
- Visual: label (secondary text), value (large monospace), delta indicator (up/down arrow + %)

### NavItem
- States: default, hover (bg tint), active (accent border + tint), disabled
- Visual: icon (20px), label, optional count badge

### ToolCard
- States: default, hover (lift), running (pulse animation), error (red accent)
- Visual: name, description, status badge, actions (Run, Edit, Delete)

### ActivityItem
- States: default, highlighted (new/unread)
- Visual: time, icon, message, expandable metadata

### Button
- Variants: primary (accent blue), secondary (surface), ghost (transparent), danger (red)
- States: default, hover, active, disabled, loading (spinner)
- Sizes: sm (28px), md (36px), lg (44px)

### Badge
- Variants: status (green/amber/red), type (blue/violet/cyan), count (gray)
- Sizes: sm (20px height), md (24px)

### SearchBar
- States: default, focused (accent border + glow), with-results
- Visual: search icon, placeholder text, kbd shortcut hint

## Technical Approach

### Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** CSS Modules + CSS custom properties (no Tailwind)
- **Icons:** Lucide React
- **Fonts:** Inter + JetBrains Mono via next/font/google
- **Deployment:** Vercel (auto-deploy on push to main)

### Architecture
```
/app
  layout.tsx         — Root layout with nav shell
  page.tsx           — Overview (home)
  /tools
    page.tsx         — Tools library
  /activity
    page.tsx         — Activity feed
  /settings
    page.tsx         — Settings
  /api
    /tools           — Tools CRUD API
    /activity        — Activity log API

/components
  /layout
    Sidebar.tsx + Sidebar.module.css
    TopNav.tsx + TopNav.module.css
    Shell.tsx + Shell.module.css
  /ui
    Button.tsx + Button.module.css
    Badge.tsx + Badge.module.css
    Card.tsx + Card.module.css
    StatCard.tsx + StatCard.module.css
    ActivityItem.tsx + ActivityItem.module.css
    ToolCard.tsx + ToolCard.module.css
  /features
    SearchBar.tsx + SearchBar.module.css
    StatusIndicator.tsx + StatusIndicator.module.css

/styles
  globals.css        — CSS variables, reset, base styles

/lib
  types.ts           — TypeScript interfaces
  data.ts            — Mock data / state management

/public
  (static assets)
```

### GitHub + Vercel Workflow
1. Create GitHub repo via `gh` (once authenticated)
2. Push code to `main` branch
3. Vercel auto-deploys on every push
4. Domain: mission control subdomain (vercel.app or custom)

### API Design (Mock for now)
- `GET /api/tools` — List all tools
- `POST /api/tools` — Create tool
- `PUT /api/tools/[id]` — Update tool
- `DELETE /api/tools/[id]` — Delete tool
- `GET /api/activity` — List activity events

### State Management
- React hooks + Context for UI state
- Mock data with realistic feel
- localStorage for persistence (client-only, no DB needed for MVP)

