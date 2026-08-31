import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'gray';
  size?: 'sm' | 'md';
  icon?: string;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'sm',
  icon,
  pulse = false
}) => {
  const colorStyles = {
    green: 'bg-status-green/10 text-status-green border-status-green/20',
    amber: 'bg-status-amber/15 text-status-amber border-status-amber/30',
    red: 'bg-error-container/30 text-status-red border-status-red/30',
    blue: 'bg-primary-container/10 text-primary border-primary/20',
    gray: 'bg-surface-container-high text-on-surface-variant border-border-subtle'
  }[variant];

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-label-caps font-semibold uppercase tracking-wider rounded border ${colorStyles} ${sizeStyles}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              variant === 'red' ? 'bg-status-red' : variant === 'amber' ? 'bg-status-amber' : 'bg-status-green'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              variant === 'red' ? 'bg-status-red' : variant === 'amber' ? 'bg-status-amber' : 'bg-status-green'
            }`}
          />
        </span>
      )}
      {icon && <span className="material-symbols-outlined text-[13px]">{icon}</span>}
      {children}
    </span>
  );
};
