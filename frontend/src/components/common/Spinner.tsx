// ─────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────

interface SpinnerProps {
  size?:  'sm' | 'md' | 'lg';
  color?: 'brand' | 'white' | 'surface';
  className?: string;
}

// ─────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────

const SIZE_CLASSES = {
  sm: 'w-4 h-4 border-[1.5px]',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
} as const;

const COLOR_CLASSES = {
  brand:   'border-brand-200 border-t-brand-600',
  white:   'border-white/30 border-t-white',
  surface: 'border-surface-200 border-t-surface-500',
} as const;

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const Spinner = ({
  size  = 'md',
  color = 'brand',
  className = '',
}: SpinnerProps) => {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={[
        'inline-block rounded-full animate-spin',
        SIZE_CLASSES[size],
        COLOR_CLASSES[color],
        className,
      ].join(' ')}
    />
  );
};

export default Spinner;