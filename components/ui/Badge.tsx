'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        {
          // Variants
          'bg-primary-100 text-primary-700': variant === 'default',
          'bg-success-100 text-success-700': variant === 'success',
          'bg-warning-100 text-warning-700': variant === 'warning',
          'bg-danger-100 text-danger-700': variant === 'danger',
          'bg-gray-100 text-gray-700': variant === 'info',
          // Sizes
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-sm': size === 'md',
        },
        className
      )}
    >
      {children}
    </span>
  );
}

