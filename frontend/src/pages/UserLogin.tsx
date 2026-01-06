import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('\n🔐 [FRONTEND] User login attempt');
    console.log('📧 Email:', email);

    try {
      console.log('📤 [FRONTEND] Sending login request to /api/auth/login');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📥 [FRONTEND] Response status:', response.status, response.statusText);

      const data = await response.json();
      console.log('📦 [FRONTEND] Response data:', {
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user
      });

      if (response.ok) {
        console.log('✅ [FRONTEND] Login successful!');
        console.log('💾 [FRONTEND] Storing token in localStorage');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('🧭 [FRONTEND] Navigating to /');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        toast.success('Login successful!');
        navigate('/');
      } else {
        console.warn('⚠️  [FRONTEND] Login failed:', data.error);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Login error:', error);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      toast.error('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <LogIn className="text-white" size={40} />
          </motion.div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/fynd_icon.svg" alt="Fynd" className="h-8 w-8" />
            <h1 className="text-3xl font-bold text-black">Welcome Back</h1>
          </div>
          <p className="text-gray-600">Sign in to share your feedback</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 bg-white shadow-fynd border-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-black font-bold mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-black font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-black font-bold hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </Card>

        {/* Admin Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/admin/login')}
            className="text-gray-600 hover:text-black transition-colors font-medium"
          >
            → Admin Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};
