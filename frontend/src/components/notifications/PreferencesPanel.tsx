import { useEffect, useState } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationType, NOTIFICATION_TYPE_CONFIG } from '@/types/notification.types';
import * as notificationService from '@/services/notificationService';
import Spinner from '@/components/common/Spinner';

// ─────────────────────────────────────────
// TOGGLE
// ─────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}

const Toggle = ({ checked, onChange, disabled, label }: ToggleProps) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={[
      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200',
      'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      checked ? 'bg-brand-600' : 'bg-surface-300',
    ].join(' ')}
  >
    <span
      className={[
        'inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm',
        'transform transition-transform duration-200',
        checked ? 'translate-x-[18px]' : 'translate-x-[3px]',
      ].join(' ')}
    />
  </button>
);

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const PreferencesPanel = () => {
  const { preferences, isLoading } = useNotificationStore((s) => ({
    preferences: s.preferences,
    isLoading:   s.isLoading,
  }));

  const [updating, setUpdating] = useState<string | null>(null);

  // ── Load preferences on mount ──
  useEffect(() => {
    notificationService.fetchPreferences();
  }, []);

  const handleToggle = async (
    prefId: string,
    type: NotificationType,
    field: 'inApp' | 'email',
    currentValue: boolean
  ) => {
    const key = `${prefId}-${field}`;
    setUpdating(key);

    try {
      await notificationService.updatePreference(type, { [field]: !currentValue });
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading && preferences.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-card overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-surface-200">
        <h3 className="text-sm font-semibold text-surface-900">
          Notification Preferences
        </h3>
        <p className="text-xs text-surface-500 mt-0.5">
          Control which notifications you receive
        </p>
      </div>

      {/* ── Column Headers ── */}
      <div className="grid grid-cols-[1fr_80px_80px] items-center px-5 py-2.5 bg-surface-50 border-b border-surface-200">
        <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
          Type
        </span>
        <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider text-center">
          In-App
        </span>
        <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider text-center">
          Email
        </span>
      </div>

      {/* ── Preference Rows ── */}
      <ul role="list" className="divide-y divide-surface-100">
        {preferences.map((pref) => {
          const config = NOTIFICATION_TYPE_CONFIG[pref.type];
          const inAppKey = `${pref.id}-inApp`;
          const emailKey = `${pref.id}-email`;

          return (
            <li
              key={pref.id}
              className="grid grid-cols-[1fr_80px_80px] items-center px-5 py-3.5"
            >
              {/* ── Type Info ── */}
              <div className="flex items-center gap-3">
                <span className={[
                  'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold',
                  config.bgColor,
                  config.color,
                ].join(' ')}>
                  {config.label.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-medium text-surface-900">
                    {config.label}
                  </p>
                  <p className="text-xs text-surface-500">
                    {getTypeDescription(pref.type)}
                  </p>
                </div>
              </div>

              {/* ── In-App Toggle ── */}
              <div className="flex justify-center">
                <Toggle
                  checked={pref.inApp}
                  disabled={updating === inAppKey}
                  label={`${config.label} in-app notifications`}
                  onChange={() =>
                    handleToggle(pref.id, pref.type, 'inApp', pref.inApp)
                  }
                />
              </div>

              {/* ── Email Toggle ── */}
              <div className="flex justify-center">
                <Toggle
                  checked={pref.email}
                  disabled={updating === emailKey}
                  label={`${config.label} email notifications`}
                  onChange={() =>
                    handleToggle(pref.id, pref.type, 'email', pref.email)
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const getTypeDescription = (type: NotificationType): string => {
  const descriptions: Record<NotificationType, string> = {
    MENTION:       'When someone mentions you',
    COMMENT:       'New comments on your content',
    TEAM_ACTIVITY: 'Team joins, leaves, role changes',
    SYSTEM_ALERT:  'Deployments, builds, system events',
    ASSIGNMENT:    'Tasks and tickets assigned to you',
  };
  return descriptions[type];
};

export default PreferencesPanel;