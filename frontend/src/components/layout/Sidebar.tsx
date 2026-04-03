import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import * as authService from '@/services/authService';

// ─────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const LogOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Dashboard',     path: '/dashboard',     icon: DashboardIcon },
  { label: 'Notifications', path: '/notifications', icon: BellIcon },
];

// ─────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────

interface SidebarProps {
  onClose?: () => void;
}

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const Sidebar = ({ onClose }: SidebarProps) => {
  const navigate    = useNavigate();
  const { user }    = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-full min-h-screen bg-white border-r border-surface-200 flex flex-col">

      {/* ── Logo + Mobile Close ── */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-surface-200 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <span className="text-base font-semibold text-surface-900 tracking-tight">
            Stackly
          </span>
        </div>

        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900',
              ].join(' ')
            }
          >
            <Icon />
            <span className="flex-1">{label}</span>
            {label === 'Notifications' && unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-600 text-white text-2xs font-semibold flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User Section ── */}
      <div className="flex-shrink-0 border-t border-surface-200 p-3 space-y-0.5">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if avatar fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-brand-700 text-xs font-semibold">
                {user?.displayName?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 truncate leading-tight">
              {user?.displayName}
            </p>
            <p className="text-xs text-surface-500 truncate leading-tight">
              @{user?.username}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors duration-150"
        >
          <LogOutIcon />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;