# Success Criteria

| Criteria | Definition of Done |
|---|---|
| Real-time delivery | New notification appears in UI within 500ms of server emit, without page refresh |
| Connection resilience | Socket auto-reconnects after network drop, no manual refresh needed |
| Auth security | All socket connections and REST endpoints reject requests without valid JWT |
| Read state accuracy | Mark-read updates persist across page refresh and new sessions |
| Preferences respected | Notifications filtered by user preference on both send and display |
| Performance | Notification list renders 100+ items without jank; Zustand updates are non-blocking |
| Empty & error states | Every async operation has a loading, error, and empty state — no blank screens |
| Demo-ready | Reviewer can trigger live notifications via the simulator without any setup |
| Mobile functional | Core flow (bell, dropdown, notification page) works on 375px viewport |
| Deployment | Both frontend (Vercel) and backend (Google Cloud Run) are live with public URLs |