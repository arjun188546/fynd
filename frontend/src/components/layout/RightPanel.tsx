import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Trash2, Sparkles, X, MessageCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const RightPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI Feedback Analyst powered by Gemini 2.0 Flash. I can analyze all customer feedback, identify trends, and provide actionable strategies to improve your business.\n\nTry asking:\n• "What are customers complaining about?"\n• "How can we improve satisfaction?"\n• "Show me rating trends"\n• "What should we prioritize?"',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call backend RAG chatbot API
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage.content
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      toast.success('AI insights generated!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please make sure you\'re logged in as an admin and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat cleared. Ready to analyze your feedback data! What would you like to know?',
        timestamp: new Date()
      }
    ]);
    toast.success('Chat cleared');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Toggle Button - Floating when closed */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-black text-white rounded-full shadow-2xl hover:bg-gray-800 transition-all hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle size={24} />
        </motion.button>
      )}

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 w-80 h-screen bg-white border-l border-gray-200 flex flex-col shadow-2xl z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-black rounded-lg">
                    <Sparkles className="text-white" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-black">Ask Fynd AI</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearChat}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                  }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <img
                        src="/ai-assistant-icon.png"
                        alt="AI"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">Fynd AI</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <span
                  className={`text-xs mt-2 block ${message.role === 'user' ? 'text-gray-300' : 'text-gray-400'
                    }`}
                >
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-purple-500" size={16} />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isLoading}
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
                       resize-none text-sm placeholder-gray-400 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-all"
              style={{
                minHeight: '44px',
                maxHeight: '120px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = '44px';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white 
                       rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-all disabled:hover:bg-black"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

            {/* Custom Scrollbar Styles */}
            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f1f1;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #555;
              }
            `}</style>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
