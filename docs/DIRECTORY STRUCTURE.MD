# Directory Structure

```
stackly/
├── frontend/                          # React + TypeScript app
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                    # Static assets (logos, icons)
│   │   ├── components/
│   │   │   ├── common/                # Reusable primitives
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx       # Main layout wrapper
│   │   │   │   ├── Sidebar.tsx        # Nav sidebar
│   │   │   │   └── TopBar.tsx         # Top bar with notification bell
│   │   │   └── notifications/
│   │   │       ├── NotificationBell.tsx       # Bell + unread badge
│   │   │       ├── NotificationDropdown.tsx   # Popover feed
│   │   │       ├── NotificationItem.tsx       # Single notification row
│   │   │       ├── NotificationGroup.tsx      # Grouped by type/date
│   │   │       ├── NotificationPage.tsx       # Full-page notification center
│   │   │       └── PreferencesPanel.tsx       # Per-type toggle settings
│   │   ├── hooks/
│   │   │   ├── useNotifications.ts    # Core notification logic
│   │   │   ├── useSocket.ts           # Socket.io connection lifecycle
│   │   │   └── useAuth.ts             # Auth state + token refresh
│   │   ├── services/
│   │   │   ├── api.ts                 # Axios instance + interceptors
│   │   │   ├── notificationService.ts # REST calls for notifications
│   │   │   └── authService.ts         # Login, logout, refresh
│   │   ├── store/
│   │   │   ├── notificationStore.ts   # Zustand - notification state
│   │   │   └── authStore.ts           # Zustand - user/auth state
│   │   ├── types/
│   │   │   ├── notification.types.ts
│   │   │   └── user.types.ts
│   │   ├── utils/
│   │   │   ├── timeFormat.ts          # "2 minutes ago" helpers
│   │   │   └── groupNotifications.ts  # Grouping logic
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Main app page (fake SaaS shell)
│   │   │   ├── NotificationsPage.tsx  # Full notification center view
│   │   │   └── Login.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .env.example
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                           # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                  # Prisma client singleton
│   │   │   └── env.ts                 # Validated env vars (zod)
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   └── notificationController.ts
│   │   ├── middleware/
│   │   │   ├── authenticate.ts        # JWT verification middleware
│   │   │   ├── errorHandler.ts        # Global error handler
│   │   │   └── rateLimiter.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── notification.routes.ts
│   │   ├── services/
│   │   │   ├── notificationService.ts # Business logic layer
│   │   │   └── socketService.ts       # Socket.io emit helpers
│   │   ├── socket/
│   │   │   ├── index.ts               # Socket.io server setup
│   │   │   └── handlers/
│   │   │       └── notificationHandlers.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── server.ts                  # Express app entry point
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts                    # Demo data seeder
│   ├── Dockerfile                     # Cloud Run container definition
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── .github/
│   └── workflows/
│       └── deploy-backend.yml         # GitHub Actions → Cloud Run CD pipeline
│
└── README.md
```