import { useLocation } from 'react-router-dom';
import NotificationBell from '@/components/notifications/NotificationBell';

// ─────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────

const MenuIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// ─────────────────────────────────────────
// PAGE TITLES
// ─────────────────────────────────────────

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  '/dashboard':     { title: 'Dashboard',     description: 'Welcome back to Stackly'      },
  '/notifications': { title: 'Notifications', description: 'Manage your notifications'    },
};

// ─────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────

interface TopBarProps {
  onMenuClick: () => void;
}

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const TopBar = ({ onMenuClick }: TopBarProps) => {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] ?? { title: 'Stackly', description: '' };

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center px-4 sm:px-6 gap-3 flex-shrink-0 sticky top-0 z-10">

      {/* ── Hamburger — mobile only ── */}
      <button
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors flex-shrink-0"
      >
        <MenuIcon />
      </button>

      {/* ── Logo — mobile only (sidebar hidden) ── */}
      <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
        <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-surface-900">Stackly</span>
      </div>

      {/* ── Page Title — desktop only ── */}
      <div className="hidden lg:block flex-1 min-w-0">
        <h1 className="text-base font-semibold text-surface-900 leading-tight">
          {page.title}
        </h1>
        {page.description && (
          <p className="text-xs text-surface-500 leading-tight mt-0.5">
            {page.description}
          </p>
        )}
      </div>

      {/* ── Page Title — mobile (centered) ── */}
      <div className="lg:hidden flex-1 min-w-0 text-center">
        <h1 className="text-sm font-semibold text-surface-900 truncate">
          {page.title}
        </h1>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <NotificationBell />
      </div>
    </header>
  );
};

export default TopBar;