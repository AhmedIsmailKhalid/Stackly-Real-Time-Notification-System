// ─────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────

type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize    = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

// ─────────────────────────────────────────
// VARIANT CONFIG
// ─────────────────────────────────────────

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-surface-100 text-surface-700',
  brand:   'bg-brand-50 text-brand-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  error:   'bg-red-50 text-red-700',
  info:    'bg-sky-50 text-sky-700',
};

const DOT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-surface-400',
  brand:   'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error:   'bg-red-500',
  info:    'bg-sky-500',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'text-2xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
};

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
}: BadgeProps) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full font-medium',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={[
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            DOT_CLASSES[variant],
          ].join(' ')}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;