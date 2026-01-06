import { clsx } from 'clsx';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = ({ 
  label, 
  error, 
  icon, 
  className,
  ...props 
}: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-fg-secondary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary">
            {icon}
          </div>
        )}
        <input
          className={clsx(
            'w-full px-4 py-2.5 rounded-lg',
            'bg-bg-secondary border border-fg-muted',
            'text-fg-primary placeholder:text-fg-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary',
            'transition-all duration-200',
            icon && 'pl-10',
            error && 'border-accent-error focus:ring-accent-error/50',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-accent-error mt-1">{error}</p>
      )}
    </div>
  );
};
