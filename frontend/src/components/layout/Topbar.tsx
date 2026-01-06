import { motion } from 'framer-motion';
import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '../ui/Input';

export const Topbar = () => {
  return (
    <motion.header
      className="h-16 bg-bg-secondary border-b border-fg-muted px-6 flex items-center justify-between"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <Input
          placeholder="Search assets, transactions..."
          icon={<Search size={18} />}
          className="bg-bg-tertiary border-transparent"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <motion.button
          className="relative p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell size={20} className="text-fg-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-error rounded-full" />
        </motion.button>

        {/* Settings */}
        <motion.button
          className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings size={20} className="text-fg-secondary" />
        </motion.button>
      </div>
    </motion.header>
  );
};
