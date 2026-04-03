// ─────────────────────────────────────────
// RELATIVE TIME
// "just now", "2 minutes ago", "3 hours ago"
// ─────────────────────────────────────────

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR   = 60 * MINUTE;
const DAY    = 24 * HOUR;
const WEEK   = 7  * DAY;
const MONTH  = 30 * DAY;
const YEAR   = 365 * DAY;

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now  = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 30 * SECOND)  return 'just now';
  if (diff < MINUTE)       return `${Math.floor(diff / SECOND)}s ago`;
  if (diff < HOUR)         return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY)          return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 2 * DAY)      return 'yesterday';
  if (diff < WEEK)         return `${Math.floor(diff / DAY)}d ago`;
  if (diff < MONTH)        return `${Math.floor(diff / WEEK)}w ago`;
  if (diff < YEAR)         return `${Math.floor(diff / MONTH)}mo ago`;
  return `${Math.floor(diff / YEAR)}y ago`;
};

// ─────────────────────────────────────────
// ABSOLUTE TIME
// "Today at 2:30 PM", "Mon, Jan 6 at 9:00 AM"
// ─────────────────────────────────────────

export const formatAbsoluteTime = (dateString: string): string => {
  const date  = new Date(dateString);
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - DAY);

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateOnly.getTime() === today.getTime()) {
    return `Today at ${timeStr}`;
  }

  if (dateOnly.getTime() === yesterday.getTime()) {
    return `Yesterday at ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
  });

  return `${dateStr} at ${timeStr}`;
};

// ─────────────────────────────────────────
// GROUP LABEL
// Returns "Today", "Yesterday", "This Week",
// "This Month", or the month + year string
// ─────────────────────────────────────────

export const getGroupLabel = (dateString: string): string => {
  const date  = new Date(dateString);
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - DAY);
  const weekAgo   = new Date(today.getTime() - WEEK);
  const monthAgo  = new Date(today.getTime() - MONTH);

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateOnly.getTime() === today.getTime())     return 'Today';
  if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';
  if (dateOnly >= weekAgo)                        return 'This Week';
  if (dateOnly >= monthAgo)                       return 'This Month';

  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// ─────────────────────────────────────────
// TOOLTIP TIME
// Full human-readable for hover tooltips
// "Monday, January 6, 2025 at 2:30:45 PM"
// ─────────────────────────────────────────

export const formatTooltipTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
    hour:    'numeric',
    minute:  '2-digit',
    second:  '2-digit',
    hour12:  true,
  });
};