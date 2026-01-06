import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, CheckCircle, AlertCircle, User, Mail } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export const UserDashboard = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!review.trim()) {
      toast.error('Please write a review');
      return;
    }

    setIsSubmitting(true);
    setShowSuccess(false);
    setAiResponse('');

    try {
      const response = await fetch(API_ENDPOINTS.SUBMIT_FEEDBACK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          rating,
          review: review.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const data = await response.json();
      setAiResponse(data.aiResponse || 'Thank you for your feedback!');
      setShowSuccess(true);

      // Reset form after 5 seconds
      setTimeout(() => {
        setName('');
        setEmail('');
        setRating(0);
        setReview('');
        setShowSuccess(false);
        setAiResponse('');
      }, 5000);

      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <img src="/fynd_icon.svg" alt="Fynd" className="h-10 w-10" />
            <h1 className="text-4xl font-bold text-black">
              Share Your Feedback
            </h1>
          </motion.div>
          <p className="text-gray-600 text-lg">
            We'd love to hear about your experience!
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-8 bg-white shadow-fynd border-0">
          {showSuccess ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Thank You!
              </h2>
              {aiResponse && (
                <motion.div
                  className="glass rounded-xl p-6 mb-6 border border-gray-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2 bg-black rounded-lg">
                      <Star className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">AI Response</p>
                  </div>
                  <p className="text-black text-left leading-relaxed">{aiResponse}</p>
                </motion.div>
              )}
              <p className="text-gray-600 mb-6 text-lg">
                Your feedback has been successfully submitted.
              </p>
              <Button
                onClick={() => {
                  setName('');
                  setEmail('');
                  setShowSuccess(false);
                  setRating(0);
                  setReview('');
                  setAiResponse('');
                }}
                className="px-8 py-3"
              >
                Submit Another Review
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Name and Email Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Name Field */}
                <div>
                  <label className="block text-black font-bold mb-3 text-lg">
                    Your Name
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
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-black font-bold mb-3 text-lg">
                    Your Email
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
              </div>

              {/* Rating Section */}
              <div className="mb-8">
                <label className="block text-black font-bold mb-6 text-lg">
                  Rate Your Experience
                </label>
                <div className="flex gap-3 justify-center p-6 bg-gray-100 rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      className="focus:outline-none hover-lift"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        size={52}
                        className={`transition-all duration-200 ${star <= (hoverRating || rating)
                            ? 'fill-black text-black drop-shadow-lg'
                            : 'text-gray-300'
                          }`}
                      />
                    </motion.button>
                  ))}
                </div>
                {rating > 0 && (
                  <motion.p
                    className="text-center text-gray-600 mt-3 font-semibold text-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {rating === 1 && '😞 Poor'}
                    {rating === 2 && '😐 Fair'}
                    {rating === 3 && '🙂 Good'}
                    {rating === 4 && '😊 Very Good'}
                    {rating === 5 && '🤩 Excellent'}
                  </motion.p>
                )}
              </div>

              {/* Review Section */}
              <div className="mb-8">
                <label className="block text-gray-900 font-bold mb-3 text-lg">
                  Write Your Review
                </label>
                <textarea
                  className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all hover:border-gray-300"
                  rows={6}
                  placeholder="Tell us about your experience..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  maxLength={2000}
                />
                <div className="flex justify-between mt-3">
                  <p className="text-sm text-gray-500 font-medium">
                    {review.length}/2000 characters
                  </p>
                  {review.length === 0 && (
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <AlertCircle size={16} />
                      Review cannot be empty
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !name.trim() || !email.trim() || rating === 0 || !review.trim()}
                  className="px-10 py-4 text-lg flex items-center gap-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Send size={22} />
                      </motion.div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={22} />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Info Section */}
        <motion.div
          className="mt-8 text-center text-gray-600 text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="flex items-center justify-center gap-2">
            <span className="text-2xl">✨</span>
            Your feedback helps us improve our service. Thank you for taking the time!
            <span className="text-2xl">✨</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
