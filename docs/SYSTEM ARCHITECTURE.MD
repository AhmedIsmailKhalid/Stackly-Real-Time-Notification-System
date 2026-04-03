# System Architecture

### Architecture Diagram
```
┌────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                    │
│                                                            │
│   React + TypeScript + Tailwind                            │
│   ┌─────────────┐   ┌──────────────┐   ┌────────────────┐  │
│   │  Zustand    │   │  Axios HTTP  │   │  Socket.io     │  │
│   │  Store      │   │  Client      │   │  Client        │  │
│   └──────┬──────┘   └──────┬───────┘   └───────┬────────┘  │
└──────────┼────────────────┼───────────────────┼────────────┘
           │                │ REST              │ WebSocket
           │                ▼                   ▼
┌────────────────────────────────────────────────────────────┐
│              BACKEND (Google Cloud Run)                    │
│                                                            │
│   Node.js + Express + Socket.io Server                     │
│   ┌─────────────┐   ┌──────────────┐   ┌────────────────┐  │
│   │  Auth       │   │  Notification│   │  Socket        │  │
│   │  Routes     │   │  Routes      │   │  Handlers      │  │
│   └──────┬──────┘   └──────┬───────┘   └───────┬────────┘  │
│          │                 │                    │          │
│          └─────────────────┴────────────────────┘          │
│                            │                               │
│                   ┌────────▼────────┐                      │
│                   │  Notification   │                      │
│                   │  Service Layer  │                      │
│                   └────────┬────────┘                      │
│                            │ Prisma ORM                    │
└────────────────────────────┼───────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────┐
│                    PostgreSQL (Cloud Run)                  │
│                                                            │
│   Tables: users, notifications,                            │
│           notification_preferences                         │
└────────────────────────────────────────────────────────────┘

CI/CD Pipeline:
┌──────────┐     push to main     ┌─────────────────┐     deploy     ┌────────────────┐
│  GitHub  │ ──────────────────▶ │  GitHub Actions  │ ────────────▶ │ Google Cloud   │
│   Repo   │                      │  deploy-backend │                │      Run       │
└──────────┘                      └─────────────────┘                └────────────────┘
```

---

### Real-Time Flow
```
Trigger Event (e.g. teammate mentions you)
        │
        ▼
Backend Service creates DB record (Prisma → PostgreSQL)
        │
        ▼
socketService.emitToUser(userId, notification)
        │
        ▼  (WebSocket — Socket.io room per userId)
Client receives event
        │
        ▼
Zustand store updates → notificationStore.addNotification()
        │
        ▼
NotificationBell badge increments + item animates in feed
```

---

### Key Architectural Decisions

**WebSockets over SSE or polling**
Socket.io provides bidirectional communication, built-in reconnection, and room-based user targeting. Each authenticated user joins a private room keyed by their userId on socket connect, ensuring notifications are delivered only to the correct client.

**JWT for socket authentication**
The Socket.io handshake passes the JWT as an auth token. The server verifies it before allowing the client to join their room — the same middleware used for REST routes is reused for socket auth, keeping security consistent across both transports.

**Zustand over Redux**
Notification state is self-contained — no cross-slice dependencies, no complex derived state. Zustand handles it in ~40 lines without reducers, actions, or providers. The store is directly accessible in hooks and services without wrapping the component tree.

**Prisma over raw SQL**
Type-safe query builder eliminates a class of runtime errors at the ORM layer. Schema migrations are version-controlled in `/prisma` and run as part of the Cloud Run startup sequence, keeping the DB schema in sync with deployments automatically.

**Google Cloud Run over always-on hosting**
Scales to zero between demo traffic bursts — zero cost at rest. Shares the same GCP project (`portfolio-projects-491501`) and Artifact Registry as other portfolio backends, keeping infrastructure consolidated under the $5/month billing kill switch.