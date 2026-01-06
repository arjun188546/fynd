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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
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

const users: User[] = [];
const submissions: FeedbackSubmission[] = [];

// Create admin user with hashed password
const adminPasswordHash = bcrypt.hashSync('admin@boo', 10);
users.push({
  id: 'admin-1',
  email: 'admin@email.com',
  name: 'Admin',
  password: adminPasswordHash,
  role: 'admin'
});

// Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Local Strategy for Admin
passport.use('local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = users.find(u => u.email === email && u.role === 'admin');

    if (!user || !user.password) {
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

// Google Strategy for Users
passport.use('google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = users.find(u => u.googleId === profile.id);

    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        googleId: profile.id,
        email: profile.emails?.[0]?.value || '',
        name: profile.displayName,
        role: 'user'
      };
      users.push(user);
    }

    return done(null, user);
  } catch (error) {
    return done(error as Error);
  }
}));

// Auth Middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
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

    const user = users.find(u => u.id === decoded.id);

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

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
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

    const user = users.find(u => u.id === decoded.id);

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
  rating: z.number().min(1).max(5),
  review: z.string().min(1).max(2000),
});

// Helper function to generate AI response for user
async function generateUserResponse(rating: number, review: string): Promise<string> {
  try {
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating user response:', error);
    return 'Thank you for your valuable feedback! We appreciate you taking the time to share your thoughts with us.';
  }
}

// Helper function to generate AI summary for admin
async function generateAdminSummary(rating: number, review: string): Promise<string> {
  try {
    const prompt = `You are an AI analyst summarizing customer feedback for administrators.

Rating: ${rating}/5 stars
Review: "${review}"

Create a concise summary (1-2 sentences) that extracts the key points and sentiment.

Summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    return `Customer provided a ${rating}-star review with feedback about their experience.`;
  }
}

// Helper function to generate recommended actions
async function generateRecommendedActions(
  rating: number,
  review: string
): Promise<string[]> {
  try {
    const prompt = `You are an AI business consultant analyzing customer feedback.

Rating: ${rating}/5 stars
Review: "${review}"

Generate 2-3 specific, actionable recommendations for the business based on this feedback.
Format as a JSON array of strings.

Example: ["Action 1", "Action 2", "Action 3"]

Recommendations:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 3);
      }
    } catch {
      // If not valid JSON, split by newlines and clean
      const lines = text
        .split('\n')
        .map((line) => line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter((line) => line.length > 0)
        .slice(0, 3);

      return lines.length > 0 ? lines : ['Review customer feedback regularly', 'Address specific concerns raised', 'Follow up with customer'];
    }
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
      console.log('📝 Available users:', users.map(u => ({ email: u.email, role: u.role })));
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
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      console.warn('⚠️  [AUTH] Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      password: hashedPassword,
      role: 'user'
    };

    users.push(newUser);
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

    // Find user
    const user = users.find(u => u.email === email.trim().toLowerCase() && u.role === 'user');

    if (!user || !user.password) {
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

// Submit feedback (Authenticated Users Only)
app.post('/api/feedback/submit', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as User;

    // Validate request body
    const validation = feedbackSubmissionSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.errors,
      });
    }

    const { rating, review } = validation.data;

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

    // Create submission record
    const submission: FeedbackSubmission = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      rating,
      review: review.trim(),
      aiSummary,
      recommendedActions,
      userResponse,
      createdAt: new Date().toISOString(),
    };

    // Store submission
    submissions.push(submission);

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
app.get('/api/feedback/admin/submissions', requireAdmin, (req: Request, res: Response) => {
  try {
    // Return submissions in reverse chronological order (newest first)
    const sortedSubmissions = [...submissions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({
      success: true,
      submissions: sortedSubmissions,
      count: sortedSubmissions.length,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
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
app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Backend Server Started Successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log('\n📋 Available Endpoints:');
  console.log('  POST /api/auth/admin/login - Admin login');
  console.log('  GET  /api/auth/google - Google OAuth');
  console.log('  GET  /api/auth/me - Get current user');
  console.log('  POST /api/feedback/submit - Submit feedback');
  console.log('  GET  /api/feedback/admin/submissions - Get all submissions');
  console.log('\n👤 Admin Credentials:');
  console.log('  Email: admin@email.com');
  console.log('  Password: admin@boo');
  console.log('\n⚙️  Environment:');
  console.log('  JWT_SECRET:', JWT_SECRET ? '✅ Configured' : '❌ Missing');
  console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' ? '✅ Configured' : '⚠️  Using placeholder');
  console.log('  GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id' ? '✅ Configured' : '⚠️  Using placeholder');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎯 Ready to accept requests!\n');
});

export default app;
