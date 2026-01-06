# AI Feedback System - Task 2

A production-ready AI-powered feedback system with two dashboards: User Dashboard and Admin Dashboard. Features dual authentication with Google OAuth for users and email/password for admin.

## 🔐 Authentication System

This application uses a dual authentication system:
- **Public Users**: Sign in with Google OAuth to submit feedback
- **Admin Users**: Sign in with email/password to view and manage submissions

**Quick Start**: See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for complete setup instructions.

**Admin Credentials**:
- Email: `admin@email.com`
- Password: `admin@boo`

## 🚀 Features

### User Dashboard
- Google OAuth authentication
- Star rating selector (1-5 stars)
- Review text input with character limit
- Real-time AI-generated responses
- Success/error state handling
- Form validation
- User profile display with logout

### Admin Dashboard
- Secure email/password authentication
- Real-time feedback monitoring
- Auto-refresh functionality (10-second intervals)
- Rating-based filtering
- Analytics and statistics:
  - Total reviews count
  - Average rating
  - Rating distribution
- AI-generated summaries
- AI-recommended actions for each review
- Admin profile display with logout

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with black & white color scheme
- **Animations**: Framer Motion
- **Routing**: React Router with protected routes
- **Authentication**: JWT tokens with route guards
- **State Management**: React Hooks
- **API Client**: Fetch API with error handling

### Backend (Node.js + Express + TypeScript)
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Authentication**: Passport.js (Local + Google OAuth strategies)
- **Security**: bcrypt password hashing, JWT tokens
- **Validation**: Zod schemas
- **AI Integration**: Google Gemini API
- **Data Storage**: In-memory (can be replaced with database)

## 📁 Project Structure

```
fynd-feedback-system/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── UserDashboard.tsx    # User feedback submission form
│   │   │   ├── AdminDashboard.tsx   # Admin monitoring panel
│   │   │   ├── UserLogin.tsx        # Google OAuth login page
│   │   │   └── AdminLogin.tsx       # Email/password admin login
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx       # Main layout wrapper
│   │   │   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   │   │   ├── Topbar.tsx       # Top navigation bar
│   │   │   │   └── RightPanel.tsx   # Feedback insights panel
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx       # Reusable button component
│   │   │   │   ├── Card.tsx         # Card component
│   │   │   │   ├── Badge.tsx        # Badge component
│   │   │   │   ├── Input.tsx        # Input field component
│   │   │   │   ├── Modal.tsx        # Modal dialog
│   │   │   │   ├── Select.tsx       # Dropdown select
│   │   │   │   └── Skeleton.tsx     # Loading skeleton
│   │   │   └── ProtectedRoute.tsx   # Route authentication guard
│   │   ├── App.tsx                  # Main app with routing
│   │   ├── main.tsx                 # App entry point
│   │   └── index.css                # Global styles (black & white theme)
│   ├── public/
│   │   └── images/                  # Image assets
│   ├── vercel.json                  # Frontend deployment config
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.ts           # Tailwind CSS config
│   └── package.json                 # Frontend dependencies
│
├── backend/
│   ├── src/
│   │   └── index.ts                 # Express server with authentication
│   ├── .env                         # Environment variables
│   ├── vercel.json                  # Backend deployment config
│   └── package.json                 # Backend dependencies
│
├── AUTHENTICATION_SETUP.md          # Complete auth setup guide
├── IMPLEMENTATION_SUMMARY.md        # Technical implementation details
├── QUICK_REFERENCE.md               # Quick reference card
├── SETUP_CHECKLIST.md               # Setup verification checklist
├── README.md                        # This file
├── start.ps1                        # PowerShell startup script
├── START_APPLICATION.bat            # Windows batch startup file
├── fynd_logo.svg                    # Fynd logo
└── fynd_icon.svg                    # Fynd icon
```
│   ├── .env                         # Environment variables
│   ├── vercel.json                  # Backend deployment config
│   └── package.json
│
├── AUTHENTICATION_SETUP.md          # Complete auth setup guide
└── README.md                        # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Gemini API key (free tier available)
- Google OAuth 2.0 credentials (for user authentication)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with the following variables:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_secure_random_string_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

4. Get your credentials:
   - **Gemini API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Google OAuth**: See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for detailed instructions
   - **JWT Secret**: Generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

5. Run development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```bash
cp .env.example .env
```

4. Run development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🚢 Deployment

### Backend Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy backend:
```bash
cd backend
vercel --prod
```

3. Set environment variables in Vercel:
   - Go to your project settings
   - Add `GEMINI_API_KEY` in Environment Variables

### Frontend Deployment (Vercel)

1. Update `frontend/vercel.json`:
   - Replace `your-backend-url.vercel.app` with your actual backend URL

2. Deploy frontend:
```bash
cd frontend
vercel --prod
```

### Alternative Deployment Options
- **Render**: Direct deployment from GitHub
- **Railway**: One-click deployment
- **Netlify**: Frontend deployment with Functions for backend

## 📡 API Endpoints

### Authentication Endpoints

#### POST /api/auth/admin/login
Admin login with email/password

**Request:**
```json
{
  "email": "admin@email.com",
  "password": "admin@boo"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "admin-1",
    "email": "admin@email.com",
    "name": "Admin",
    "role": "admin"
  }
}
```

#### GET /api/auth/google
Initiate Google OAuth flow (redirects to Google)

#### GET /api/auth/google/callback
OAuth callback (handles Google response)

**Query Parameters:**
- `code`: Authorization code from Google

**Redirects to:** `http://localhost:3000/?token=jwt_token_here`

#### GET /api/auth/me
Get current authenticated user

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user"
}
```

#### POST /api/auth/logout
Logout current user

### Feedback Endpoints

#### POST /api/feedback/submit
Submit user feedback (requires authentication)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "rating": 4,
  "review": "Great service!"
}
```

**Response:**
```json
{
  "success": true,
  "aiResponse": "Thank you for your wonderful feedback! We're thrilled to hear you had a great experience.",
  "submissionId": "fb_1234567890_abc123"
}
```

#### GET /api/feedback/admin/submissions
Get all submissions (Admin Dashboard - requires admin role)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "submissions": [
    {
      "id": "fb_1234567890_abc123",
      "rating": 4,
      "review": "Great service!",
      "aiSummary": "Customer expressed satisfaction with service quality.",
      "recommendedActions": [
        "Continue maintaining high service standards",
        "Share positive feedback with team",
        "Consider featuring this testimonial"
      ],
      "userResponse": "Thank you for your wonderful feedback!",
      "createdAt": "2024-01-06T10:30:00.000Z",
      "userId": "user-123"
    }
  ],
  "count": 1
}
```

## 🎯 Quick Start Guide

### First Time Setup

1. **Clone and install dependencies**:
```bash
# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

2. **Configure environment variables**:
```bash
# In backend directory, create .env file
cd backend
```

Create `backend/.env` with:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=generate_random_64_char_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

3. **Set up Google OAuth** (see [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md))

4. **Start both servers**:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Usage

#### As a User (Public)
1. Navigate to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Complete Google OAuth
4. Redirected to User Dashboard
5. Submit feedback with rating and review
6. Receive AI-generated response

#### As Admin
1. Navigate to `http://localhost:3000/admin/login`
2. Login with:
   - Email: `admin@email.com`
   - Password: `admin@boo`
3. View all feedback submissions
4. See AI-generated summaries and recommendations
5. Filter by rating
6. Monitor real-time updates

## 🧪 Testing

### Manual Testing

1. **Authentication Testing**:
   - Test Google OAuth flow
   - Test admin login with correct credentials
   - Test admin login with incorrect credentials
   - Test protected route access without authentication
   - Test non-admin user accessing admin dashboard

2. **User Dashboard Testing**:
   - Select different star ratings
   - Submit empty reviews (should show error)
   - Submit very long reviews (2000+ characters)
   - Check AI response generation
   - Verify success state
   - Test logout functionality

3. **Admin Dashboard Testing**:
   - Check real-time data updates
   - Test rating filters
   - Verify auto-refresh functionality
   - Check analytics calculations
   - Test logout functionality

4. **Edge Cases**:
   - Network failures
   - API timeouts
   - Empty submissions
   - Very long reviews
   - Multiple rapid submissions
   - Expired JWT tokens
   - Invalid tokens

## 🔧 Technical Requirements Checklist

- ✅ Web-based application (not Streamlit/Gradio)
- ✅ Server-side LLM calls only
- ✅ Clear API endpoints with JSON schemas
- ✅ Handles empty reviews
- ✅ Handles long reviews (2000 char limit)
- ✅ Graceful error handling
- ✅ Persistent data storage
- ✅ Secure authentication system
- ✅ Protected routes
- ✅ JWT token-based sessions
- ✅ Deployment on Vercel
- ✅ Public accessible URLs
- ✅ Auto-refresh admin dashboard

## 🎨 UI Features

- Modern dark theme with gradient accents
- Smooth animations with Framer Motion
- Responsive design
- Accessible components
- Loading states
- Error handling with toast notifications
- Real-time updates

## 🤖 AI Features

### For Users:
- Personalized response based on rating and review
- Empathetic and professional tone
- Acknowledges specific feedback points

### For Admins:
- Concise summary of each review
- Sentiment analysis
- Actionable recommendations
- Business insights

## 🔒 Security Considerations

- Input validation using Zod schemas
- XSS protection (React auto-escapes)
- CORS configuration
- Environment variables for sensitive data
- Rate limiting (recommended for production)

## 📈 Future Enhancements

- Database integration (PostgreSQL, MongoDB)
- User authentication
- Email notifications
- Advanced analytics dashboard
- Export functionality
- Multi-language support
- Sentiment trend analysis
- Rate limiting
- Webhook integrations

## 🐛 Known Limitations

- In-memory storage (data lost on server restart)
- No user authentication
- Single Gemini API key (shared across all requests)
- No rate limiting on API endpoints
- No data persistence across deployments

## 📝 License

MIT

## 👥 Author

Fynd AI Intern Assessment - Task 2

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Vercel for hosting
- React and TypeScript communities
