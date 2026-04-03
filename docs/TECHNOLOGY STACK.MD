# Technology Stack

| Layer              | Technology                  | Rationale                                                      |
|--------------------|-----------------------------|----------------------------------------------------------------|
| Frontend Framework | React 18 + TypeScript       | Type safety, component reuse, industry standard                |
| Styling            | Tailwind CSS                | Utility-first, fast iteration, consistent design tokens        |
| State Management   | Zustand                     | Lightweight, no boilerplate, perfect for notification state    |
| Real-Time          | Socket.io (client)          | Handles reconnection, fallbacks, rooms — cleaner than raw WS   |
| HTTP Client        | Axios                       | Interceptors for auth headers, consistent error handling       |
| Frontend Hosting   | Vercel                      | Free tier, instant deploys from GitHub                         |
| Backend Runtime    | Node.js + Express           | Custom control, WebSocket-friendly                             |
| Real-Time Server   | Socket.io (server)          | Pairs with client, handles namespaces and rooms                |
| Database           | PostgreSQL                  | Relational, ACID compliant, production-grade                   |
| ORM                | Prisma                      | Type-safe queries, migrations, schema management               |
| Auth               | JWT (access + refresh)      | Stateless, standard — no third-party dependency                |
| Backend Hosting    | Google Cloud Run            | Scales to zero, no hour cap, Docker-based                      |
| CI/CD              | GitHub Actions              | Auto-deploy to Cloud Run on push to main                       |