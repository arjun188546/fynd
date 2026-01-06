import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className,
}: ButtonProps) => {
  const baseStyles = 'font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl';
  
  const variants = {
    primary: 'bg-black hover:bg-gray-800 text-white',
    secondary: 'bg-white text-black border-2 border-black hover:bg-gray-100',
    outline: 'border-2 border-black text-black hover:bg-gray-50',
    ghost: 'text-black hover:bg-gray-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={{ scale: disabled || loading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
    >
      {loading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </motion.button>
  );
};
