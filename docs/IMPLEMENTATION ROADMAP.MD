# Implementation Roadmap

### Phase 1 — Foundation & Backend Core
- PostgreSQL database setup on Render
- Prisma schema: `users`, `notifications`, `notification_preferences`
- Express server with TypeScript, env validation (zod)
- JWT auth: register, login, refresh token, logout
- REST endpoints: GET notifications, PATCH mark-read, PATCH mark-all-read, DELETE, GET preferences, PATCH preferences
- Global error handler, rate limiter middleware
- Database seed script with realistic demo data

### Phase 2 — Real-Time Layer
- Socket.io server setup with user rooms (one room per `userId`)
- JWT authentication for socket handshake
- `notificationHandlers.ts` — connect, disconnect, join room
- `socketService.ts` — typed emit helpers (`emitToUser`, `emitBroadcast`)
- Reconnection strategy and heartbeat handling

### Phase 3 — Frontend Foundation
- Vite + React + TypeScript scaffold
- Tailwind config with Stackly design tokens (colors, typography)
- Zustand stores: `notificationStore`, `authStore`
- Axios instance with JWT interceptors + refresh logic
- `useSocket.ts` hook — connection lifecycle, reconnect on auth change

### Phase 4 — Notification UI Components
- `NotificationBell.tsx` — animated bell icon, unread count badge
- `NotificationDropdown.tsx` — popover with scroll, grouped items
- `NotificationItem.tsx` — avatar, message, timestamp, read/unread state
- `NotificationGroup.tsx` — grouping by date (Today, Yesterday, Earlier)
- `EmptyState.tsx` — clean zero-state illustration
- Real-time item animation: new notifications slide/fade in

### Phase 5 — Full Notification Center Page
- `NotificationsPage.tsx` — full page view with filters (All, Unread, Mentions, System)
- Bulk actions: mark all read, clear all
- `PreferencesPanel.tsx` — per-category toggles (Mentions, Comments, System Alerts, Team Activity)
- Pagination or infinite scroll on notification list

### Phase 6 — SaaS Shell & Demo Experience
- Fake SaaS `Dashboard.tsx` — realistic app chrome (sidebar, top bar, content area)
- Notification simulator — button to fire demo events so reviewers see real-time in action
- Skeleton loaders for all async states
- Responsive layout (desktop-first, functional on mobile)

### Phase 7 — Polish & Deployment
- Loading, error, and empty states for every component
- `README.md` with architecture diagram, setup instructions, live links
- Deploy backend to Google Cloud Run, frontend to Vercel