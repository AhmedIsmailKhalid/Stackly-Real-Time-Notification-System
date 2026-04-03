import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/store/notificationStore';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from './NotificationItem';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';

// ─────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────

interface NotificationDropdownProps {
  onClose: () => void;
}

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const NotificationDropdown = ({ onClose }: NotificationDropdownProps) => {
  const navigate  = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  const preview = notifications.slice(0, 10);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  const handleViewAll = () => {
    navigate('/notifications');
    onClose();
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* ── Dropdown panel ── */}
      <div
        role="dialog"
        aria-label="Notifications"
        className={[
          'absolute right-0 top-full mt-2 z-50',

          // Mobile — constrained to viewport width
          'w-[calc(100vw-16px)] -right-2',
          'sm:w-[380px] sm:right-0',

          // Max height
          'max-h-[70vh] sm:max-h-[520px]',

          // Visual
          'bg-white rounded-2xl',
          'border border-surface-200',
          'shadow-dropdown',

          // Layout
          'flex flex-col',
          'animate-slide-in-top',
        ].join(' ')}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-surface-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-surface-900">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-50 text-brand-700 text-2xs font-semibold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" />
            </div>
          ) : preview.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="You're all caught up!"
              size="sm"
            />
          ) : (
            <ul role="list" className="divide-y divide-surface-100">
              {preview.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                  onClose={onClose}
                  variant="dropdown"
                />
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 border-t border-surface-200">
          <button
            onClick={handleViewAll}
            className="w-full px-4 py-3.5 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors duration-150 rounded-b-2xl sm:rounded-b-xl"
          >
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;