type IconProps = { className?: string };

const base = "h-3.5 w-3.5";

export function CalendarIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={`${base} ${className}`}>
      <rect x="3" y="4.5" width="14" height="12" rx="1.5" />
      <path d="M3 8.5h14M7 2.5v3M13 2.5v3" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={`${base} ${className}`}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TagIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={`${base} ${className}`}>
      <path d="M10.5 3H4a1 1 0 0 0-1 1v6.5a1 1 0 0 0 .3.7l7 7a1 1 0 0 0 1.4 0l6.5-6.5a1 1 0 0 0 0-1.4l-7-7a1 1 0 0 0-.7-.3Z" />
      <circle cx="6.75" cy="6.75" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlusIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`}>
      <path d="M10 4v12M4 10h12" strokeLinecap="round" />
    </svg>
  );
}

export function FilterIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={`${base} ${className}`}>
      <path d="M3 5h14M6 10h8M9 15h2" strokeLinecap="round" />
    </svg>
  );
}
