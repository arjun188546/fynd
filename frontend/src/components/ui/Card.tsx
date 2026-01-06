import { motion, MotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface CardProps extends Omit<MotionProps, 'children'> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const Card = ({ 
  children, 
  className, 
  hover = true,
  glow = false,
  onClick,
  ...motionProps 
}: CardProps) => {
  const variants = {
    rest: { 
      scale: 1, 
      y: 0,
      boxShadow: glow 
        ? '0 10px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.2)' 
        : '0 10px 25px rgba(0, 0, 0, 0.08)'
    },
    hover: hover ? { 
      scale: 1.02, 
      y: -6,
      boxShadow: glow
        ? '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 0, 0, 0.3)'
        : '0 20px 35px rgba(0, 0, 0, 0.12)',
      transition: { duration: 0.3, ease: 'easeOut' }
    } : {},
  };

  return (
    <motion.div
      className={clsx(
        'bg-white rounded-2xl p-6 border border-gray-100',
        onClick && 'cursor-pointer',
        className
      )}
      variants={variants}
      initial="rest"
      whileHover="hover"
      whileTap={hover ? { scale: 0.98 } : {}}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};
