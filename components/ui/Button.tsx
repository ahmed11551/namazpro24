'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'font-medium rounded-xl transition-all active:scale-95',
        {
          // Variants
          'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800':
            variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300':
            variant === 'secondary',
          'border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100':
            variant === 'outline',
          'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200':
            variant === 'ghost',
          'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700':
            variant === 'danger',
          // Sizes
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2.5 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          // Full width
          'w-full': fullWidth,
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

