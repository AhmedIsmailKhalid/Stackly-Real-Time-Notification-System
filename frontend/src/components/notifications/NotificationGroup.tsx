import { NotificationGroup as NotificationGroupType } from '@/utils/groupNotifications';
import NotificationItem from './NotificationItem';

// ─────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────

interface NotificationGroupProps {
  group:    NotificationGroupType;
  onMarkRead: (id: string) => Promise<void>;
  variant?: 'dropdown' | 'page';
}

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const NotificationGroup = ({
  group,
  onMarkRead,
  variant = 'page',
}: NotificationGroupProps) => {
  return (
    <div className="animate-fade-in">

      {/* ── Group Label ── */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-2.5 sticky top-0 bg-surface-50/95 backdrop-blur-sm z-10">
        <span className="text-xs font-bold text-surface-600 uppercase tracking-widest">
          {group.label}
        </span>
        <div className="flex-1 h-px bg-surface-200" />
        <span className="text-xs font-medium text-surface-400 tabular-nums flex-shrink-0">
          {group.notifications.length}{' '}
          {group.notifications.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* ── Notification Items ── */}
      <ul
        role="list"
        className={[
          'divide-y divide-surface-100 bg-white',
          'border-y border-surface-200',
          'sm:border sm:rounded-xl sm:overflow-hidden sm:shadow-card',
          'sm:mx-5',
          'mb-1',
        ].join(' ')}
      >
        {group.notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkRead={onMarkRead}
            variant={variant}
          />
        ))}
      </ul>
    </div>
  );
};

export default NotificationGroup;