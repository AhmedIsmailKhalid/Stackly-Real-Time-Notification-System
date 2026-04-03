import { useState, useRef, useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import NotificationDropdown from './NotificationDropdown';

// ─────────────────────────────────────────
// BELL ICON
// ─────────────────────────────────────────

const BellIcon = ({ hasUnread }: { hasUnread: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={hasUnread ? 'animate-[wiggle_0.5s_ease-in-out]' : ''}
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const NotificationBell = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);
  const unreadCount             = useNotificationStore((s) => s.unreadCount);
  const displayCount            = unreadCount > 99 ? '99+' : unreadCount;

  // ── Close on outside click ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // ── Close on Escape ──
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {/* ── Bell Button ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={[
          'relative w-9 h-9 rounded-lg flex items-center justify-center',
          'transition-colors duration-150',
          isOpen
            ? 'bg-brand-50 text-brand-600'
            : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700',
        ].join(' ')}
      >
        <BellIcon hasUnread={unreadCount > 0} />

        {/* ── Unread Badge ── */}
        {unreadCount > 0 && (
          <span
            className={[
              'absolute -top-1 -right-1',
              'min-w-[18px] h-[18px] px-1',
              'rounded-full bg-brand-600 text-white',
              'text-2xs font-semibold',
              'flex items-center justify-center',
              'animate-badge-pop',
              'pointer-events-none',
            ].join(' ')}
          >
            {displayCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <NotificationDropdown onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;