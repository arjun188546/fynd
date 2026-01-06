import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  MessageSquare,
  Shield,
  Star
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { icon: MessageSquare, label: 'User Feedback', path: '/', badge: null },
  { icon: Shield, label: 'Admin Panel', path: '/admin', badge: 'AI' },
];

export const Sidebar = () => {
  return (
    <motion.aside
      className="w-64 h-screen bg-white border-r border-gray-200 p-6 flex flex-col shadow-sm"
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Logo */}
      <div className="mb-8">
        <img
          src="/fynd_logo.svg"
          alt="Fynd Logo"
          className="h-8 w-auto mb-2"
        />
        <p className="text-xs text-gray-500 font-medium">AI Feedback System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item, i) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center justify-between px-4 py-3 rounded-xl transition-all group font-medium',
                isActive
                  ? 'bg-black text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              )
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </motion.div>
                {item.badge && (
                  <span className={clsx(
                    "px-2 py-1 text-xs rounded-full font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-black"
                  )}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Info Section */}
      <motion.div
        className="w-full bg-gray-100 rounded-xl p-4 text-center border border-gray-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="mb-2">
          <img src="/fynd_icon.svg" alt="Fynd" className="h-8 w-8 mx-auto opacity-60" />
        </div>
        <p className="text-gray-500 text-xs mb-1 font-medium">Powered by Fynd AI</p>
        <p className="text-black text-sm font-bold">Real-time Feedback Analysis</p>
      </motion.div>
    </motion.aside>
  );
};
