import { ButtonHTMLAttributes, forwardRef } from 'react';
import Spinner from './Spinner';

// ─────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  fullWidth?: boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ─────────────────────────────────────────
// VARIANT CONFIG
// ─────────────────────────────────────────

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
  secondary:
    'bg-white text-surface-700 border border-surface-300 hover:bg-surface-50 active:bg-surface-100 disabled:text-surface-400',
  ghost:
    'bg-transparent text-surface-600 hover:bg-surface-100 active:bg-surface-200 disabled:text-surface-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant   = 'primary',
      size      = 'md',
      loading   = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {loading ? (
          <Spinner
            size="sm"
            color={variant === 'primary' || variant === 'danger' ? 'white' : 'brand'}
          />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;