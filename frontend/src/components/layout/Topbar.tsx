import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export const Topbar = () => {
  return (
    <motion.header
      className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Admin Panel Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-black rounded-lg">
          <Shield className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-black">Admin Panel</h1>
          <p className="text-xs text-gray-500">Feedback Management System</p>
        </div>
      </div>

      {/* Right side - can add actions later */}
      <div className="flex items-center gap-4">
        {/* Future: Add admin actions here */}
      </div>
    </motion.header>
  );
};
