import React from 'react';

interface KpiCardProps {
  label: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  trendType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  iconName: string;
  statusBorderColor?: string;
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  trend,
  trendDirection = 'up',
  trendType = 'positive',
  subtitle,
  iconName,
  statusBorderColor,
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-container-lowest border border-border-subtle shadow-[0px_4px_12px_rgba(0,0,0,0.05)] rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {statusBorderColor && (
        <div
          className="absolute top-0 left-0 bottom-0 w-1 rounded-l-xl"
          style={{ backgroundColor: statusBorderColor }}
        />
      )}

      <div className={`flex justify-between items-start ${statusBorderColor ? 'pl-2' : ''}`}>
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
        <span
          className="material-symbols-outlined"
          style={{ color: statusBorderColor || '#0e4269' }}
        >
          {iconName}
        </span>
      </div>

      <div className={`${statusBorderColor ? 'pl-2' : ''}`}>
        <div className="font-display-kpi text-display-kpi text-on-surface font-bold">
          {value}
        </div>

        {trend && (
          <div
            className={`font-label-sm text-label-sm flex items-center gap-1 mt-1 font-medium ${
              trendType === 'positive' ? 'text-status-green' : 'text-status-red'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {trendDirection === 'up' ? 'arrow_upward' : 'arrow_downward'}
            </span>
            {trend}
          </div>
        )}

        {subtitle && (
          <div className="font-label-sm text-label-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
            {statusBorderColor && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusBorderColor }}
              />
            )}
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
