import { motion } from 'framer-motion';
import { Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api';

export const Sidebar = () => {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState<string>('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  useEffect(() => {
    const fetchAdminInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(API_ENDPOINTS.ME, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const user = await response.json();
          setAdminEmail(user.email);
        }
      } catch (error) {
        console.error('Failed to fetch admin info:', error);
      }
    };

    fetchAdminInfo();
  }, []);

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

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Admin Info Section */}
      {adminEmail && (
        <motion.div
          className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">Admin Access</p>
              <p className="font-semibold text-black text-sm truncate">{adminEmail}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-sm"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </motion.div>
      )}

      {/* Info Section */}
      <motion.div
        className="w-full bg-gray-100 rounded-xl p-4 text-center border border-gray-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="mb-2">
          <img src="/fynd_icon.svg" alt="Fynd" className="h-8 w-8 mx-auto opacity-60" />
        </div>
        <p className="text-gray-500 text-xs mb-1 font-medium">Powered by Fynd AI</p>
        <p className="text-black text-sm font-bold">Real-time Analysis</p>
      </motion.div>
    </motion.aside>
  );
};
