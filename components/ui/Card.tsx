'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

export default function Card({
  children,
  className,
  onClick,
  variant = 'default',
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl bg-white transition-all',
        {
          'card-shadow': variant === 'default',
          'card-shadow-medium': variant === 'elevated',
          'border border-gray-200': variant === 'outlined',
          'cursor-pointer active:scale-[0.98]': onClick,
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

