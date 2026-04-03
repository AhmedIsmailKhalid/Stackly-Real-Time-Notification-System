// ─────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────

interface EmptyStateProps {
  title:        string;
  description?: string;
  action?:      React.ReactNode;
  size?:        'sm' | 'md' | 'lg';
  icon?:        React.ReactNode;
}

// ─────────────────────────────────────────
// DEFAULT ICON
// ─────────────────────────────────────────

const DefaultIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-surface-300"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// ─────────────────────────────────────────
// SIZE CONFIG
// ─────────────────────────────────────────

const SIZE_CLASSES = {
  sm: { wrapper: 'py-8',  title: 'text-sm', description: 'text-xs' },
  md: { wrapper: 'py-12', title: 'text-sm', description: 'text-sm' },
  lg: { wrapper: 'py-16', title: 'text-base', description: 'text-sm' },
} as const;

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const EmptyState = ({
  title,
  description,
  action,
  size = 'md',
  icon,
}: EmptyStateProps) => {
  const s = SIZE_CLASSES[size];

  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center px-6',
        s.wrapper,
      ].join(' ')}
    >
      <div className="mb-3">
        {icon ?? <DefaultIcon />}
      </div>

      <p className={['font-semibold text-surface-700', s.title].join(' ')}>
        {title}
      </p>

      {description && (
        <p className={['text-surface-500 mt-1 max-w-xs', s.description].join(' ')}>
          {description}
        </p>
      )}

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;