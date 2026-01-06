import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const UserRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        console.log('\n📝 [FRONTEND] User registration attempt');
        console.log('👤 Name:', name);
        console.log('📧 Email:', email);

        try {
            console.log('📤 [FRONTEND] Sending registration request to /api/auth/register');

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            console.log('📥 [FRONTEND] Response status:', response.status, response.statusText);

            const data = await response.json();
            console.log('📦 [FRONTEND] Response data:', {
                success: data.success,
                hasToken: !!data.token,
                hasUser: !!data.user
            });

            if (response.ok) {
                console.log('✅ [FRONTEND] Registration successful!');
                console.log('💾 [FRONTEND] Storing token in localStorage');
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                console.log('🧭 [FRONTEND] Navigating to /');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                toast.success('Account created successfully!');
                navigate('/');
            } else {
                console.warn('⚠️  [FRONTEND] Registration failed:', data.error);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                toast.error(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('❌ [FRONTEND] Registration error:', error);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            toast.error('Failed to create account. Please try again.');
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
                        <UserPlus className="text-white" size={40} />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-black mb-2">Create Account</h1>
                    <p className="text-gray-600">Join us to share your feedback</p>
                </div>

                {/* Registration Card */}
                <Card className="p-8 bg-white shadow-fynd border-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label className="block text-black font-bold mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                    <User size={20} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                    placeholder="John Doe"
                                    required
                                    minLength={2}
                                />
                            </div>
                        </div>

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
                                    placeholder="At least 6 characters"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Must be at least 6 characters long
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl"
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-black font-bold hover:underline"
                            >
                                Log in
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
