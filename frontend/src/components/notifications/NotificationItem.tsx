import { useNavigate } from 'react-router-dom';
import { Notification, NOTIFICATION_TYPE_CONFIG } from '@/types/notification.types';
import { formatRelativeTime, formatTooltipTime } from '@/utils/timeFormat';

// ─────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  onMarkRead:   (id: string) => Promise<void>;
  onClose?:     () => void;
  variant?:     'dropdown' | 'page';
}

// ─────────────────────────────────────────
// TYPE ICON
// ─────────────────────────────────────────

const TypeIcon = ({ type }: { type: Notification['type'] }) => {
  const config = NOTIFICATION_TYPE_CONFIG[type];

  const icons: Record<Notification['type'], JSX.Element> = {
    MENTION: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
      </svg>
    ),
    COMMENT: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    TEAM_ACTIVITY: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    SYSTEM_ALERT: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    ASSIGNMENT: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  };

  return (
    <span className={[
      'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0',
      config.bgColor,
      config.color,
    ].join(' ')}>
      {icons[type]}
    </span>
  );
};

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const NotificationItem = ({
  notification,
  onMarkRead,
  onClose,
  variant = 'dropdown',
}: NotificationItemProps) => {
  const navigate   = useNavigate();
  const config     = NOTIFICATION_TYPE_CONFIG[notification.type];
  const isDropdown = variant === 'dropdown';

  const handleClick = async () => {
    if (!notification.read) {
      await onMarkRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose?.();
    }
  };

  const handleMarkRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read) {
      await onMarkRead(notification.id);
    }
  };

  return (
    <li
      role="listitem"
      onClick={handleClick}
      className={[
        'relative flex gap-3 group',
        'transition-colors duration-150',
        isDropdown ? 'px-4 py-3' : 'px-4 sm:px-5 py-3.5',
        !notification.read
          ? 'bg-brand-50/50 hover:bg-brand-50'
          : 'hover:bg-surface-50',
        notification.actionUrl ? 'cursor-pointer' : 'cursor-default',
        'animate-fade-in',
      ].join(' ')}
    >
      {/* ── Unread indicator ── */}
      {!notification.read && (
        <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
      )}

      {/* ── Avatar ── */}
      <div className="flex-shrink-0 mt-0.5">
        {notification.actorAvatarUrl ? (
          <div className="relative">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-100 flex-shrink-0">
              <img
                src={notification.actorAvatarUrl}
                alt={notification.actorName ?? ''}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            {/* Type badge — bottom right of avatar */}
            <span className={[
              'absolute -bottom-0.5 -right-0.5',
              'w-4 h-4 rounded-full flex items-center justify-center',
              'ring-1 ring-white',
              config.bgColor,
              config.color,
            ].join(' ')}>
              <TypeIcon type={notification.type} />
            </span>
          </div>
        ) : (
          <div className={[
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
            config.bgColor,
            config.color,
          ].join(' ')}>
            <TypeIcon type={notification.type} />
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        <p className={[
          'text-sm leading-snug',
          !notification.read
            ? 'text-surface-900 font-medium'
            : 'text-surface-600',
        ].join(' ')}>
          {notification.message}
        </p>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            title={formatTooltipTime(notification.createdAt)}
            className="text-xs text-surface-400"
          >
            {formatRelativeTime(notification.createdAt)}
          </span>

          <span className={[
            'text-2xs font-semibold px-1.5 py-0.5 rounded-full',
            config.bgColor,
            config.color,
          ].join(' ')}>
            {config.label}
          </span>
        </div>
      </div>

      {/* ── Mark read button ── */}
      {!notification.read && (
        <button
          onClick={handleMarkRead}
          title="Mark as read"
          className={[
            'flex-shrink-0 self-start mt-0.5',
            'w-6 h-6 rounded-md',
            'flex items-center justify-center',
            'text-surface-300 hover:text-brand-600 hover:bg-brand-50',
            'transition-colors duration-150',
            'opacity-0 group-hover:opacity-100',
          ].join(' ')}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      )}
    </li>
  );
};

export default NotificationItem;