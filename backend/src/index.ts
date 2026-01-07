import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import pool from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://fyndfb.onrender.com',
  'https://fyndfb-frontend.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());

// In-memory storage (replace with database in production)
interface User {
  id: string;
  email: string;
  name: string;
  googleId?: string;
  password?: string;
  role: 'user' | 'admin';
}

interface FeedbackSubmission {
  id: string;
  userId: string;
  rating: number;
  review: string;
  aiSummary: string;
  recommendedActions: string[];
  userResponse: string;
  createdAt: string;
}

// Import database service
import { userDb, feedbackDb, initializeDatabase } from './database';

// Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userDb.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy for Admin
passport.use('local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await userDb.findByEmail(email);

    if (!user || user.role !== 'admin' || !user.password) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Google Strategy for Users (DISABLED - uncomment when you have Google OAuth credentials)
/*
passport.use('google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Try to find existing user by Google ID
    const result = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [profile.id]
    );

    let user = result.rows[0];

    if (!user) {
      // Create new user
      const newUser = await userDb.create({
        id: `user-${Date.now()}`,
        googleId: profile.id,
        email: profile.emails?.[0]?.value || '',
        name: profile.displayName,
        role: 'user'
      });
      user = newUser;
    }

    return done(null, user);
  } catch (error) {
    return done(error as Error);
  }
}));
*/

// Auth Middleware
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    console.log('\n🔒 [AUTH] Checking authentication');
    console.log('📋 Token present:', !!token);

    if (!token) {
      console.warn('⚠️  [AUTH] No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    console.log('✅ [AUTH] Token decoded:', { id: decoded.id, email: decoded.email, role: decoded.role });

    const user = await userDb.findById(decoded.id);

    if (!user) {
      console.warn('⚠️  [AUTH] User not found for id:', decoded.id);
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('✅ [AUTH] User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [AUTH] Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    console.log('\n🔐 [AUTH] Checking admin access');
    console.log('📋 Token present:', !!token);

    if (!token) {
      console.warn('⚠️  [AUTH] No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    console.log('✅ [AUTH] Token decoded:', { id: decoded.id, email: decoded.email, role: decoded.role });

    const user = await userDb.findById(decoded.id);

    if (!user || user.role !== 'admin') {
      console.warn('⚠️  [AUTH] Admin access denied for:', decoded.email, '(role:', decoded.role, ')');
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log('✅ [AUTH] Admin access granted:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [AUTH] Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Validation schemas
const feedbackSubmissionSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  rating: z.number().min(1).max(5),
  review: z.string().min(1).max(2000),
});

// Helper function to detect gibberish/meaningless feedback
function isGibberish(text: string): boolean {
  // Remove spaces and convert to lowercase
  const cleaned = text.replace(/\s+/g, '').toLowerCase();

  // Check if too short (less than 3 characters)
  if (cleaned.length < 3) {
    return true;
  }

  // Check for excessive character repetition (e.g., "aaaaaaa", "123123123")
  const hasExcessiveRepetition = /(.)\1{4,}/.test(cleaned);
  if (hasExcessiveRepetition) {
    return true;
  }

  // Check vowel-to-consonant ratio (gibberish often has very low vowel ratio)
  const vowels = cleaned.match(/[aeiou]/g) || [];
  const consonants = cleaned.match(/[bcdfghjklmnpqrstvwxyz]/g) || [];
  const vowelRatio = vowels.length / (vowels.length + consonants.length);

  // If less than 10% vowels or more than 90% vowels, likely gibberish
  if (vowelRatio < 0.1 || vowelRatio > 0.9) {
    return true;
  }

  // Check for random keyboard mashing patterns
  const keyboardPatterns = [
    /asdf/i, /qwer/i, /zxcv/i, /hjkl/i,
    /dfgh/i, /cvbn/i, /tyui/i, /fghj/i
  ];
  const hasKeyboardMashing = keyboardPatterns.some(pattern => pattern.test(text));
  if (hasKeyboardMashing && cleaned.length < 20) {
    return true;
  }

  // Check if it's mostly numbers or special characters
  const alphaChars = cleaned.match(/[a-z]/g) || [];
  const alphaRatio = alphaChars.length / cleaned.length;
  if (alphaRatio < 0.3) {
    return true;
  }

  return false;
}

// Helper function to generate AI response for user
async function generateUserResponse(rating: number, review: string): Promise<string> {
  try {
    console.log('\n🤖 [GEMINI AI] Generating user response...');
    console.log('📊 Rating:', rating + '/5');
    console.log('📝 Review:', review.substring(0, 100) + (review.length > 100 ? '...' : ''));

    // Check for gibberish input
    if (isGibberish(review)) {
      console.log('⚠️  [GEMINI AI] Gibberish detected, using fallback response');
      return 'Thank you for your feedback. We appreciate you taking the time to rate our service.';
    }

    const prompt = `You are a customer service AI responding to a user's feedback. 
    
Rating: ${rating}/5 stars
Review: "${review}"

Generate a friendly, professional, and empathetic response that:
1. Thanks the user for their feedback
2. Acknowledges their specific points
3. Shows that their feedback is valued
4. If the rating is low, express concern and commitment to improvement
5. Keep it concise (2-3 sentences)

Response:`;

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text().trim();
    const duration = Date.now() - startTime;

    console.log('✅ [GEMINI AI] User response generated in', duration + 'ms');
    console.log('💬 Response:', generatedText.substring(0, 100) + (generatedText.length > 100 ? '...' : ''));

    return generatedText;
  } catch (error) {
    console.error('❌ [GEMINI AI] Error generating user response:', error);
    return 'Thank you for your valuable feedback! We appreciate you taking the time to share your thoughts with us.';
  }
}

// Helper function to generate AI summary for admin
async function generateAdminSummary(rating: number, review: string): Promise<string> {
  try {
    console.log('\n📊 [GEMINI AI] Generating admin summary...');

    // Check for gibberish input
    if (isGibberish(review)) {
      console.log('⚠️  [GEMINI AI] Gibberish detected, using fallback summary');
      return `Customer provided a ${rating}-star rating with unclear or invalid feedback text.`;
    }

    const prompt = `You are an AI analyst summarizing customer feedback for administrators.

Rating: ${rating}/5 stars
Review: "${review}"

Create a concise summary (1-2 sentences) that extracts the key points and sentiment.

Summary:`;

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();
    const duration = Date.now() - startTime;

    console.log('✅ [GEMINI AI] Admin summary generated in', duration + 'ms');
    console.log('📋 Summary:', summary);

    return summary;
  } catch (error) {
    console.error('❌ [GEMINI AI] Error generating summary:', error);
    return `Customer provided a ${rating}-star review with feedback about their experience.`;
  }
}

// Helper function to generate recommended actions
async function generateRecommendedActions(
  rating: number,
  review: string
): Promise<string[]> {
  try {
    console.log('\n💡 [GEMINI AI] Generating recommended actions...');

    // Check for gibberish input
    if (isGibberish(review)) {
      console.log('⚠️  [GEMINI AI] Gibberish detected, using fallback actions');
      return [
        'Request customer to provide clearer feedback',
        'Follow up with customer for more details',
        'Review feedback quality standards'
      ];
    }

    const prompt = `You are an AI business consultant analyzing customer feedback. Based on the specific feedback below, generate 2-3 SPECIFIC and ACTIONABLE recommendations.

Rating: ${rating}/5 stars
Review: "${review}"

IMPORTANT: 
- Make recommendations SPECIFIC to this feedback
- Focus on the actual issues or praise mentioned
- Be actionable and concrete
- Return ONLY a valid JSON array of strings
- Do NOT include any markdown formatting or code blocks

Example format: ["Specific action 1", "Specific action 2", "Specific action 3"]

Recommendations:`;

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    const duration = Date.now() - startTime;

    console.log('✅ [GEMINI AI] Actions generated in', duration + 'ms');
    console.log('📄 [GEMINI AI] Raw response:', text);

    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const actions = parsed.slice(0, 3);
        console.log('🎯 [GEMINI AI] Actions:', actions);
        return actions;
      }
    } catch (parseError) {
      console.log('⚠️  [GEMINI AI] JSON parse failed, trying to extract array...');
      // Try to find JSON array in the text
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const actions = parsed.slice(0, 3);
            console.log('🎯 [GEMINI AI] Actions (extracted):', actions);
            return actions;
          }
        } catch (e) {
          console.log('⚠️  [GEMINI AI] Array extraction failed');
        }
      }
    }

    // Fallback: split by newlines and clean
    const lines = text
      .split('\n')
      .map((line) => line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim())
      .filter((line) => line.length > 10 && !line.startsWith('[') && !line.startsWith('{'))
      .slice(0, 3);

    if (lines.length > 0) {
      console.log('🎯 [GEMINI AI] Actions (parsed from lines):', lines);
      return lines;
    }

    // Last resort fallback
    const fallback = ['Review customer feedback regularly', 'Address specific concerns raised', 'Follow up with customer'];
    console.log('⚠️  [GEMINI AI] Using fallback actions:', fallback);
    return fallback;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [
      'Review customer feedback regularly',
      'Address specific concerns raised',
      'Follow up with customer to ensure satisfaction',
    ];
  }

  return ['Improve service quality', 'Address customer concerns', 'Follow up'];
}

// Routes

// ==================== AUTH ROUTES ====================

// Admin login
app.post('/api/auth/admin/login', (req: Request, res: Response, next: NextFunction) => {
  console.log('\n🔐 [AUTH] Admin login attempt');
  console.log('📧 Email:', req.body.email);
  console.log('⏰ Timestamp:', new Date().toISOString());

  passport.authenticate('local', (err: any, user: User, info: any) => {
    if (err) {
      console.error('❌ [AUTH] Authentication error:', err);
      return res.status(500).json({ error: 'Authentication error' });
    }
    if (!user) {
      console.warn('⚠️  [AUTH] Login failed:', info?.message || 'Invalid credentials');
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }

    console.log('✅ [AUTH] User authenticated:', user.email, '(', user.role, ')');

    req.login(user, (err) => {
      if (err) {
        console.error('❌ [AUTH] Session creation error:', err);
        return res.status(500).json({ error: 'Login error' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('🎟️  [AUTH] JWT token generated');
      console.log('✨ [AUTH] Login successful for:', user.email);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      });
    });
  })(req, res, next);
});

// User Registration
app.post('/api/auth/register', async (req: Request, res: Response) => {
  console.log('\n📝 [AUTH] User registration attempt');
  console.log('📧 Email:', req.body.email);
  console.log('👤 Name:', req.body.name);

  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      console.warn('⚠️  [AUTH] Invalid name');
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    if (!email || !email.includes('@')) {
      console.warn('⚠️  [AUTH] Invalid email');
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!password || password.length < 6) {
      console.warn('⚠️  [AUTH] Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await userDb.findByEmail(email);
    if (existingUser) {
      console.warn('⚠️  [AUTH] Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const newUser = await userDb.create({
      id: `user-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      password: hashedPassword,
      role: 'user'
    });
    console.log('✅ [AUTH] User registered:', newUser.email);

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🎟️  [AUTH] JWT token generated');
    console.log('✨ [AUTH] Registration successful for:', newUser.email);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    console.error('❌ [AUTH] Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  console.log('\n🔐 [AUTH] User login attempt');
  console.log('📧 Email:', req.body.email);

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.warn('⚠️  [AUTH] Missing credentials');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user and verify password
    const user = await userDb.findByEmail(email);

    if (!user || user.role !== 'user' || !user.password) {
      console.warn('⚠️  [AUTH] User not found or invalid credentials');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.warn('⚠️  [AUTH] Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('✅ [AUTH] User authenticated:', user.email);

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🎟️  [AUTH] JWT token generated');
    console.log('✨ [AUTH] Login successful for:', user.email);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('❌ [AUTH] Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google OAuth initiate (HIDDEN - keeping for future use)
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    const user = req.user as User;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.redirect(`http://localhost:3000/?token=${token}`);
  }
);

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout error' });
    }
    res.json({ success: true });
  });
});

// Get current user
app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = req.user as User;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
});

// ==================== FEEDBACK ROUTES ====================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Submit feedback (Public endpoint - no authentication required)
app.post('/api/feedback/submit', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = feedbackSubmissionSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.errors,
      });
    }

    const { name, email, rating, review } = validation.data;

    // Handle empty review edge case
    if (!review.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Review cannot be empty',
      });
    }

    // Generate AI responses (in parallel for efficiency)
    const [userResponse, aiSummary, recommendedActions] = await Promise.all([
      generateUserResponse(rating, review),
      generateAdminSummary(rating, review),
      generateRecommendedActions(rating, review),
    ]);

    // Create submission record in database
    const submission = await feedbackDb.create({
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: email, // Use email as identifier for public submissions
      name: name.trim(),
      email: email.trim(),
      rating,
      review: review.trim(),
      aiSummary,
      recommendedActions,
      userResponse
    });

    // Return response to user
    res.json({
      success: true,
      aiResponse: userResponse,
      submissionId: submission.id,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all submissions (Admin Only)
app.get('/api/feedback/admin/submissions', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get all submissions from database (already sorted by created_at DESC)
    const allSubmissions = await feedbackDb.getAll();

    res.json({
      success: true,
      submissions: allSubmissions,
      count: allSubmissions.length,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// RAG Chatbot for Admin Insights (Admin Only)
app.post('/api/admin/chat', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    console.log('\n💬 [CHATBOT] Admin query received');
    console.log('📝 Query:', message);

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Step 1: Retrieve all feedback from database
    console.log('📊 [CHATBOT] Retrieving feedback data...');
    const allFeedback = await feedbackDb.getAll();
    console.log(`✅ [CHATBOT] Retrieved ${allFeedback.length} feedback entries`);

    // Step 2: Calculate statistics
    const stats = {
      total: allFeedback.length,
      avgRating: allFeedback.length > 0
        ? (allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length).toFixed(2)
        : 0,
      ratingDistribution: {
        5: allFeedback.filter(f => f.rating === 5).length,
        4: allFeedback.filter(f => f.rating === 4).length,
        3: allFeedback.filter(f => f.rating === 3).length,
        2: allFeedback.filter(f => f.rating === 2).length,
        1: allFeedback.filter(f => f.rating === 1).length,
      },
      positive: allFeedback.filter(f => f.rating >= 4).length,
      negative: allFeedback.filter(f => f.rating <= 2).length,
      neutral: allFeedback.filter(f => f.rating === 3).length,
    };

    console.log('📈 [CHATBOT] Statistics:', stats);

    // Step 3: Format feedback for AI context (limit to recent 30 for token efficiency)
    const recentFeedback = allFeedback.slice(0, 30);
    const feedbackContext = recentFeedback.map((f, idx) =>
      `${idx + 1}. [${f.rating}⭐] "${f.review}" - ${f.aiSummary || 'No summary'}`
    ).join('\n');

    // Step 4: Build AI prompt with context
    const systemPrompt = `You are an expert business analyst and customer experience consultant. Provide comprehensive, detailed insights with actionable strategies.

📊 FEEDBACK DATA:
Total: ${stats.total} reviews | Avg Rating: ${stats.avgRating}/5.0
Positive: ${stats.positive} | Neutral: ${stats.neutral} | Negative: ${stats.negative}

Rating Breakdown:
⭐⭐⭐⭐⭐ ${stats.ratingDistribution[5]} (${((stats.ratingDistribution[5] / stats.total) * 100).toFixed(0)}%)
⭐⭐⭐⭐ ${stats.ratingDistribution[4]} (${((stats.ratingDistribution[4] / stats.total) * 100).toFixed(0)}%)
⭐⭐⭐ ${stats.ratingDistribution[3]} (${((stats.ratingDistribution[3] / stats.total) * 100).toFixed(0)}%)
⭐⭐ ${stats.ratingDistribution[2]} (${((stats.ratingDistribution[2] / stats.total) * 100).toFixed(0)}%)
⭐ ${stats.ratingDistribution[1]} (${((stats.ratingDistribution[1] / stats.total) * 100).toFixed(0)}%)

RECENT FEEDBACK:
${feedbackContext}

ADMIN QUERY: ${message}

FORMATTING RULES:
✅ Use emojis for visual hierarchy (📊 📈 ⚠️ ✅ 🎯 💡 🔥)
✅ Use clear section headers with emojis
✅ Provide DETAILED explanations (3-5 sentences per point)
✅ Use bullet points (•) NOT numbered lists
✅ Bold key metrics with ** **
✅ Include specific examples from feedback
✅ Explain WHY and HOW for each recommendation
✅ Add context and reasoning
❌ NO numbered lists (1. 2. 3.)
❌ NO overly brief responses
❌ NO generic advice

RESPONSE STRUCTURE:
📊 **OVERVIEW** - Comprehensive summary with key metrics and overall sentiment analysis

⚠️ **KEY ISSUES** - Detailed analysis of main problems with:
• Root cause analysis
• Impact assessment
• Specific customer quotes
• Frequency and severity

🎯 **STRATEGIC RECOMMENDATIONS** - In-depth action plan with:
• Detailed implementation steps
• Expected outcomes and benefits
• Timeline and priority level
• Resources needed
• Success metrics

Provide thorough, actionable insights. Be comprehensive and detailed.

Provide your analysis:`;

    // Step 5: Generate AI response
    console.log('🤖 [CHATBOT] Generating AI response...');
    const startTime = Date.now();

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const aiResponse = response.text().trim();

    const duration = Date.now() - startTime;
    console.log(`✅ [CHATBOT] Response generated in ${duration}ms`);
    console.log('💡 [CHATBOT] Response preview:', aiResponse.substring(0, 150) + '...');

    // Step 6: Return response
    res.json({
      success: true,
      response: aiResponse,
      stats: stats,
      feedbackCount: allFeedback.length
    });

  } catch (error) {
    console.error('❌ [CHATBOT] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
// Initialize database and start server
async function startServer() {
  try {
    // Initialize database (create admin user if not exists)
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚀 Backend Server Started Successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log('\n📋 Available Endpoints:');
      console.log('  POST /api/auth/register - User registration');
      console.log('  POST /api/auth/login - User login');
      console.log('  POST /api/auth/admin/login - Admin login');
      console.log('  GET  /api/auth/google - Google OAuth');
      console.log('  GET  /api/auth/me - Get current user');
      console.log('  POST /api/feedback/submit - Submit feedback');
      console.log('  GET  /api/feedback/admin/submissions - Get all submissions');
      console.log('\n👤 Admin Credentials:');
      console.log('  Email: admin@email.com');
      console.log('  Password: admin@boo');
      console.log('\n⚙️  Environment:');
      console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing');
      console.log('  JWT_SECRET:', JWT_SECRET ? '✅ Configured' : '❌ Missing');
      console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' ? '✅ Configured' : '⚠️  Using placeholder');
      console.log('  GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id' ? '✅ Configured' : '⚠️  Using placeholder');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('🎯 Ready to accept requests!\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
