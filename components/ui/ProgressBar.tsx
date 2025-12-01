'use client';

import clsx from 'clsx';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  color = 'primary',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {Math.round(percentage)}%
          </span>
          <span className="text-xs text-gray-500">
            {value} / {max}
          </span>
        </div>
      )}
      <div
        className={clsx(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          {
            'h-1': size === 'sm',
            'h-2': size === 'md',
            'h-3': size === 'lg',
          }
        )}
      >
        <div
          className={clsx(
            'h-full transition-all duration-300 ease-out rounded-full',
            {
              'bg-primary-600': color === 'primary',
              'bg-success-500': color === 'success',
              'bg-warning-500': color === 'warning',
              'bg-danger-500': color === 'danger',
            }
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

