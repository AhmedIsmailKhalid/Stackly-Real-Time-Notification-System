// ─────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

// ─────────────────────────────────────────
// SIZE CONFIG
// ─────────────────────────────────────────

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-2xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
} as const;

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const Avatar = ({ src, name, size = 'sm', className = '' }: AvatarProps) => {
  const initials = name
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const sizeClass = SIZE_CLASSES[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={[
          'rounded-full object-cover bg-surface-100 flex-shrink-0',
          sizeClass,
          className,
        ].join(' ')}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={[
        'rounded-full flex items-center justify-center flex-shrink-0',
        'bg-brand-100 text-brand-700 font-semibold',
        sizeClass,
        className,
      ].join(' ')}
    >
      {initials}
    </div>
  );
};

export default Avatar;