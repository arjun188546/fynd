import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className 
}: BadgeProps) => {
  const variants = {
    default: 'bg-gray-200 text-black border border-gray-300',
    success: 'bg-black text-white border border-black',
    warning: 'bg-gray-300 text-black border border-gray-400',
    error: 'bg-gray-800 text-white border border-black',
    info: 'bg-gray-100 text-black border border-gray-200',
  };

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-semibold shadow-sm',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
