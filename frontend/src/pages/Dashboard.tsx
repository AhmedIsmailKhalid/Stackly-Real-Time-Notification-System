import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationType, NOTIFICATION_TYPE_CONFIG } from '@/types/notification.types';
import Badge from '@/components/common/Badge';
import Spinner from '@/components/common/Spinner';

// ─────────────────────────────────────────
// SIMULATION TYPES
// ─────────────────────────────────────────

const SIMULATION_TYPES: NotificationType[] = [
  'MENTION',
  'COMMENT',
  'TEAM_ACTIVITY',
  'SYSTEM_ALERT',
  'ASSIGNMENT',
];

// ─────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────

interface StatCardProps {
  label:   string;
  value:   string | number;
  variant?: 'default' | 'brand';
}

const StatCard = ({ label, value, variant = 'default' }: StatCardProps) => (
  <div className={[
    'rounded-xl border p-4 shadow-card',
    variant === 'brand'
      ? 'bg-brand-600 border-brand-700'
      : 'bg-white border-surface-200',
  ].join(' ')}>
    <p className={[
      'text-xs font-semibold uppercase tracking-wider',
      variant === 'brand' ? 'text-brand-200' : 'text-surface-500',
    ].join(' ')}>
      {label}
    </p>
    <p className={[
      'text-3xl font-bold mt-1.5 tabular-nums leading-none',
      variant === 'brand' ? 'text-white' : 'text-surface-900',
    ].join(' ')}>
      {value}
    </p>
  </div>
);

// ─────────────────────────────────────────
// SIMULATOR BUTTON
// ─────────────────────────────────────────

interface SimulatorButtonProps {
  type:      NotificationType;
  isLoading: boolean;
  disabled:  boolean;
  onClick:   () => void;
}

const SimulatorButton = ({ type, isLoading, disabled, onClick }: SimulatorButtonProps) => {
  const config = NOTIFICATION_TYPE_CONFIG[type];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex items-center gap-3 p-3.5 rounded-xl border text-left w-full',
        'transition-all duration-150 group',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        !disabled
          ? 'bg-white border-surface-200 hover:border-brand-300 hover:shadow-notification hover:-translate-y-0.5'
          : 'bg-white border-surface-200',
      ].join(' ')}
    >
      {/* Icon */}
      <span className={[
        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
        'text-sm font-bold transition-transform duration-150',
        'group-hover:scale-110',
        config.bgColor,
        config.color,
      ].join(' ')}>
        {isLoading ? <Spinner size="sm" color="brand" /> : config.label.charAt(0)}
      </span>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-surface-900 leading-tight">
          {config.label}
        </p>
        <p className="text-xs text-surface-500 leading-tight mt-0.5 truncate">
          Send a {config.label.toLowerCase()} notification
        </p>
      </div>

      {/* Arrow */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0 text-surface-400 group-hover:text-brand-500 transition-colors"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
};

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const Dashboard = () => {
  const { user }   = useAuthStore();
  const { notifications, unreadCount, total, simulate } = useNotifications();

  const [simulating, setSimulating]       = useState<NotificationType | null>(null);
  const [lastSimulated, setLastSimulated] = useState<NotificationType | null>(null);

  const readCount = total - unreadCount;

  const handleSimulate = async (type: NotificationType) => {
    setSimulating(type);
    try {
      await simulate(type);
      setLastSimulated(type);
    } finally {
      setSimulating(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">

      {/* ── Welcome Header ── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-surface-900">
          Hey, {user?.displayName?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-surface-500 mt-1">
          Here's what's happening in your workspace.
        </p>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total"        value={total}        />
        <StatCard label="Unread"       value={unreadCount}  variant="brand" />
        <StatCard label="Read"         value={readCount}    />
        <StatCard label="This Session" value={notifications.length} />
      </div>

      {/* ── Notification Simulator ── */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-5 py-4 border-b border-surface-200">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-surface-900">
                Notification Simulator
              </h3>
              <p className="text-xs text-surface-500 mt-0.5">
                Trigger real-time notifications to see the system in action
              </p>
            </div>
            {lastSimulated && (
              <Badge variant="success" dot size="sm" className="flex-shrink-0">
                {NOTIFICATION_TYPE_CONFIG[lastSimulated].label} sent
              </Badge>
            )}
          </div>
        </div>

        {/* Simulator Grid */}
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SIMULATION_TYPES.map((type) => (
            <SimulatorButton
              key={type}
              type={type}
              isLoading={simulating === type}
              disabled={simulating !== null}
              onClick={() => handleSimulate(type)}
            />
          ))}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-surface-200">
          <h3 className="text-sm font-semibold text-surface-900">
            Recent Activity
          </h3>
        </div>

        {notifications.length === 0 ? (
          <div className="py-10 text-center px-4">
            <p className="text-sm text-surface-500">
              No notifications yet — use the simulator above to trigger some.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-surface-100">
            {notifications.slice(0, 5).map((n) => {
              const config = NOTIFICATION_TYPE_CONFIG[n.type];
              return (
                <li
                  key={n.id}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 animate-fade-in"
                >
                  {/* Type icon */}
                  <span className={[
                    'w-7 h-7 rounded-lg flex items-center justify-center',
                    'text-xs font-bold flex-shrink-0',
                    config.bgColor,
                    config.color,
                  ].join(' ')}>
                    {config.label.charAt(0)}
                  </span>

                  {/* Message */}
                  <p className="flex-1 text-sm text-surface-700 truncate min-w-0">
                    {n.message}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!n.read && (
                      <span className="unread-dot" />
                    )}
                    <Badge variant="default" size="sm" className="hidden sm:inline-flex">
                      {config.label}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;