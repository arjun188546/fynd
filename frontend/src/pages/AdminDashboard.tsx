import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Star,
  Filter,
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../config/api';

interface FeedbackSubmission {
  id: string;
  name?: string;
  email?: string;
  rating: number;
  review: string;
  aiSummary: string;
  recommendedActions: string[];
  createdAt: string;
  userResponse: string;
}

export const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.GET_SUBMISSIONS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSubmissions();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredSubmissions = filterRating
    ? submissions.filter((s) => s.rating === filterRating)
    : submissions;

  const stats = {
    total: submissions.length,
    avgRating:
      submissions.length > 0
        ? (
          submissions.reduce((sum, s) => sum + s.rating, 0) / submissions.length
        ).toFixed(1)
        : '0.0',
    byRating: [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: submissions.filter((s) => s.rating === rating).length,
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <motion.div
                className="flex items-center gap-3 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <img src="/fynd_icon.svg" alt="Fynd" className="h-12 w-12" />
                <h1 className="text-4xl font-bold text-black">
                  Admin Dashboard
                </h1>
              </motion.div>
              <p className="text-gray-600 text-lg">
                Monitor and analyze customer feedback in real-time
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${autoRefresh
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-white text-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
              >
                <RefreshCw
                  size={18}
                  className={autoRefresh ? 'animate-spin' : ''}
                />
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
              <Button
                onClick={fetchSubmissions}
                className="flex items-center gap-2 px-5 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg"
              >
                <RefreshCw size={18} />
                Refresh Now
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-white border-0 shadow-fynd hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-2 font-medium">Total Reviews</p>
                  <p className="text-4xl font-bold text-black">{stats.total}</p>
                </div>
                <div className="p-4 bg-black rounded-xl">
                  <MessageSquare className="text-white" size={32} />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-white border-0 shadow-fynd hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-2 font-medium">Average Rating</p>
                  <p className="text-4xl font-bold text-black flex items-center gap-2">
                    {stats.avgRating}
                    <Star size={28} className="text-black fill-black" />
                  </p>
                </div>
                <div className="p-4 bg-gray-800 rounded-xl">
                  <TrendingUp className="text-white" size={32} />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-white border-0 shadow-fynd hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-2 font-medium">Active Users</p>
                  <p className="text-4xl font-bold text-black">{stats.total}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-xl">
                  <Users className="text-white" size={32} />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 mb-8 bg-white border-0 shadow-fynd">
            <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-black rounded-full"></div>
              Rating Distribution
            </h3>
            <div className="space-y-4">
              {stats.byRating.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-24">
                    {[...Array(rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className="text-black fill-black"
                      />
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-full h-8 overflow-hidden">
                      <motion.div
                        className="bg-black h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${stats.total > 0 ? (count / stats.total) * 100 : 0
                            }%`,
                        }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  <span className="text-black font-bold w-16 text-right text-lg">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-5 mb-6 bg-white border-0 shadow-fynd">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-black rounded-lg">
                  <Filter size={18} className="text-white" />
                </div>
                <span className="text-black font-bold text-lg">Filter by Rating:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterRating(null)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${filterRating === null
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                    }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${filterRating === rating
                      ? 'bg-black text-white shadow-lg'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                      }`}
                  >
                    {rating}
                    <Star
                      size={16}
                      className="text-black fill-black"
                    />
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Submissions List */}
        <div className="space-y-6">
          {isLoading ? (
            <Card className="p-12 text-center bg-white border-0 shadow-fynd">
              <div className="flex flex-col justify-center items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl animate-pulse">
                  <RefreshCw className="animate-spin text-white" size={32} />
                </div>
                <p className="text-gray-600 text-lg font-medium">Loading submissions...</p>
              </div>
            </Card>
          ) : filteredSubmissions.length === 0 ? (
            <Card className="p-12 text-center bg-white border-0 shadow-fynd">
              <div className="flex flex-col items-center">
                <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
                  <MessageSquare className="text-gray-400" size={56} />
                </div>
                <p className="text-gray-900 text-xl font-bold mb-2">No submissions yet</p>
                <p className="text-gray-500 text-base">
                  Submissions will appear here as users provide feedback
                </p>
              </div>
            </Card>
          ) : (
            filteredSubmissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-8 hover-lift bg-white border-0 shadow-fynd">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="px-4 py-2 bg-black rounded-xl flex items-center gap-2 text-white font-bold text-lg shadow-lg">
                        {submission.rating}
                        <Star
                          size={20}
                          className="text-white fill-white"
                        />
                      </div>
                      {(submission.name || submission.email) && (
                        <div className="flex items-center gap-2">
                          {submission.name && (
                            <Badge className="bg-gray-100 text-black border border-gray-300 px-3 py-1 text-sm font-semibold">
                              👤 {submission.name}
                            </Badge>
                          )}
                          {submission.email && (
                            <Badge className="bg-gray-100 text-black border border-gray-300 px-3 py-1 text-sm font-semibold">
                              ✉️ {submission.email}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar size={18} />
                        <span className="font-medium">
                          {new Date(submission.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User Review */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 bg-black rounded-full"></div>
                      <h4 className="text-black font-bold text-lg">
                        User Review
                      </h4>
                    </div>
                    <p className="text-black bg-gray-100 rounded-xl p-5 leading-relaxed border border-gray-300">
                      {submission.review}
                    </p>
                  </div>

                  {/* AI Summary */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 bg-black rounded-full"></div>
                      <h4 className="text-black font-bold text-lg flex items-center gap-2">
                        <span className="text-xs bg-black text-white px-3 py-1 rounded-full font-bold">
                          AI
                        </span>
                        Summary
                      </h4>
                    </div>
                    <div className="glass rounded-xl p-5 border-l-4 border-black">
                      <p className="text-black leading-relaxed">
                        {submission.aiSummary}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 bg-gray-800 rounded-full"></div>
                      <h4 className="text-black font-bold text-lg flex items-center gap-2">
                        <span className="text-xs bg-gray-800 text-white px-3 py-1 rounded-full font-bold">
                          AI
                        </span>
                        Recommended Actions
                      </h4>
                    </div>
                    <ul className="space-y-3">
                      {submission.recommendedActions.map((action, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 + i * 0.1 }}
                          className="text-black flex items-start gap-3 bg-gray-100 rounded-xl p-4 border border-gray-300"
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{action}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
