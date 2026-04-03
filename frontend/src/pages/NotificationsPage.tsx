import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationType, NOTIFICATION_TYPE_CONFIG } from '@/types/notification.types';
import { groupNotificationsByDate } from '@/utils/groupNotifications';
import NotificationGroup from '@/components/notifications/NotificationGroup';
import PreferencesPanel from '@/components/notifications/PreferencesPanel';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';

// ─────────────────────────────────────────
// FILTER TABS
// ─────────────────────────────────────────

type FilterTab = 'all' | 'unread' | NotificationType;

interface Tab {
  id:    FilterTab;
  label: string;
}

const TABS: Tab[] = [
  { id: 'all',           label: 'All'      },
  { id: 'unread',        label: 'Unread'   },
  { id: 'MENTION',       label: 'Mentions' },
  { id: 'COMMENT',       label: 'Comments' },
  { id: 'TEAM_ACTIVITY', label: 'Team'     },
  { id: 'SYSTEM_ALERT',  label: 'System'   },
  { id: 'ASSIGNMENT',    label: 'Assigned' },
];

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const NotificationsPage = () => {
  const [activeTab, setActiveTab]       = useState<FilterTab>('all');
  const [showPreferences, setShowPrefs] = useState(false);

  const {
    notifications,
    unreadCount,
    hasMore,
    isLoading,
    isLoadingMore,
    markAsRead,
    markAllAsRead,
    deleteAll,
    loadMore,
    applyFilters,
  } = useNotifications();

  // ── Tab Change ──
  const handleTabChange = async (tab: FilterTab) => {
    setActiveTab(tab);
    if (tab === 'all') {
      await applyFilters({});
    } else if (tab === 'unread') {
      await applyFilters({ read: false });
    } else {
      await applyFilters({ type: tab as NotificationType });
    }
  };

  const groups = groupNotificationsByDate(notifications);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">

      {/* ── Page Actions ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={deleteAll}>
              Clear all
            </Button>
          )}
        </div>

        <Button
          variant={showPreferences ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setShowPrefs((p) => !p)}
          leftIcon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
            </svg>
          }
        >
          <span className="hidden sm:inline">Preferences</span>
          <span className="sm:hidden">Prefs</span>
        </Button>
      </div>

      {/* ── Preferences Panel ── */}
      {showPreferences && (
        <div className="animate-slide-in-top">
          <PreferencesPanel />
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
        {TABS.map((tab) => {
          const isActive   = activeTab === tab.id;
          const isTypeTab  = !['all', 'unread'].includes(tab.id);
          const config     = isTypeTab
            ? NOTIFICATION_TYPE_CONFIG[tab.id as NotificationType]
            : null;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                'text-xs font-medium whitespace-nowrap flex-shrink-0',
                'transition-colors duration-150',
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50',
              ].join(' ')}
            >
              {/* Color dot for type tabs */}
              {config && (
                <span className={[
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  isActive ? 'bg-white/70' : config.color.replace('text-', 'bg-'),
                ].join(' ')} />
              )}

              {tab.label}

              {/* Unread badge */}
              {tab.id === 'unread' && unreadCount > 0 && (
                <span className={[
                  'min-w-[16px] h-4 px-1 rounded-full',
                  'text-2xs font-semibold flex items-center justify-center',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-brand-50 text-brand-700',
                ].join(' ')}>
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={
            activeTab === 'unread'
              ? "You're all caught up — no unread notifications."
              : activeTab === 'all'
              ? "You don't have any notifications yet."
              : `No ${activeTab.toLowerCase().replace('_', ' ')} notifications.`
          }
          size="lg"
        />
      ) : (
        <div className="space-y-2 -mx-4 sm:-mx-5">
          {groups.map((group) => (
            <NotificationGroup
              key={group.label}
              group={group}
              onMarkRead={markAsRead}
              variant="page"
            />
          ))}

          {/* ── Load More ── */}
          {hasMore && (
            <div className="flex justify-center pt-4 pb-2 mx-4 sm:mx-5">
              <Button
                variant="secondary"
                size="sm"
                loading={isLoadingMore}
                onClick={loadMore}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;