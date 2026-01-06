# Authentication System Setup Guide

## Overview
This application implements a dual authentication system:
- **Public Users**: Sign in with Google OAuth
- **Admin Users**: Sign in with email/password

## System Architecture

### Backend Authentication
- **Framework**: Passport.js
- **Strategies**: 
  - Local Strategy (Admin email/password)
  - Google OAuth 2.0 Strategy (Public users)
- **Token System**: JWT (JSON Web Tokens)
- **Session Management**: express-session + JWT

### Frontend Routes
- `/login` - User login with Google OAuth
- `/admin/login` - Admin login with email/password
- `/` - User Dashboard (protected)
- `/admin` - Admin Dashboard (protected, admin-only)

## Setup Instructions

### 1. Google OAuth Setup

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API" for your project

#### Step 2: Create OAuth 2.0 Credentials
1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: Fynd Feedback System
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
     - `http://localhost:3001`
   - **Authorized redirect URIs**:
     - `http://localhost:3001/api/auth/google/callback`
     - Add production URL when deploying
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

#### Step 3: Update Backend Environment Variables
Edit `backend/.env`:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_secure_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 2. Admin Credentials

The admin account is pre-configured in the backend:

**Email**: `admin@email.com`  
**Password**: `admin@boo`

This account is created automatically when the backend starts. The password is hashed using bcrypt for security.

### 3. Environment Configuration

#### Backend (.env)
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=generate_a_strong_random_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

**Generate JWT Secret**:
```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: OpenSSL
openssl rand -hex 64
```

#### Frontend
No additional environment variables required. The frontend uses relative API paths.

### 4. Running the Application

#### Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on: `http://localhost:3001`

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

## Authentication Flows

### User Flow (Google OAuth)
1. User visits `/login`
2. Clicks "Continue with Google"
3. Redirected to Google OAuth consent screen
4. After consent, redirected back to `/api/auth/google/callback`
5. Backend creates/finds user, generates JWT token
6. Redirected to frontend (`/?token=jwt_token`)
7. Frontend stores token in localStorage
8. User can access User Dashboard and submit feedback

### Admin Flow (Email/Password)
1. Admin visits `/admin/login`
2. Enters email: `admin@email.com`
3. Enters password: `admin@boo`
4. Backend validates credentials using bcrypt
5. Generates JWT token
6. Token stored in localStorage
7. Redirected to `/admin`
8. Can view all feedback submissions with AI insights

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- `GET /api/auth/google` - Initiate Google OAuth
  - Redirects to Google consent screen

- `GET /api/auth/google/callback` - OAuth callback
  - Query params: `code` (from Google)
  - Redirects to: `http://localhost:3000/?token=jwt_token`

- `GET /api/auth/me` - Get current user info
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ id, email, name, role }`

- `POST /api/auth/logout` - Logout
  - Clears session

### Feedback (Protected)
- `POST /api/feedback/submit` - Submit feedback
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ rating, review }`
  - Requires: Authenticated user

- `GET /api/feedback/admin/submissions` - View all submissions
  - Headers: `Authorization: Bearer <token>`
  - Requires: Admin role

## Security Features

### Password Security
- Admin password hashed with bcrypt (10 salt rounds)
- Passwords never stored in plain text
- Password verification uses timing-safe comparison

### Token Security
- JWT tokens signed with secret key
- Tokens expire after 24 hours
- Token verification on every protected route
- Tokens stored in localStorage (consider httpOnly cookies for production)

### CORS Configuration
```typescript
cors({
  origin: 'http://localhost:3000',
  credentials: true
})
```

### Protected Routes
- Frontend: `ProtectedRoute` component checks authentication
- Backend: `requireAuth` and `requireAdmin` middleware

## User Management

### In-Memory Storage (Development)
Currently uses in-memory arrays:
```typescript
const users: User[] = [
  {
    id: 'admin-1',
    email: 'admin@email.com',
    password: hashedPassword,
    name: 'Admin',
    role: 'admin'
  }
];
```

### Database Migration (Production)
For production, replace with database:
- **Recommended**: MongoDB with Mongoose or PostgreSQL with Prisma
- Store users, feedback, sessions
- Add user profile management
- Implement password reset flow

## Testing the System

### Test User Login
1. Navigate to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Sign in with your Google account
4. Should redirect to User Dashboard
5. Submit feedback to test

### Test Admin Login
1. Navigate to `http://localhost:3000/admin/login`
2. Email: `admin@email.com`
3. Password: `admin@boo`
4. Should redirect to Admin Dashboard
5. View submitted feedback

### Test Protected Routes
1. Try accessing `http://localhost:3000/admin` without login
   - Should redirect to `/login`
2. Login as regular user, try accessing `/admin`
   - Should show "Access denied" toast
3. Login as admin, should see all submissions

## Troubleshooting

### Google OAuth Issues
**Problem**: "Redirect URI mismatch"
- **Solution**: Ensure `http://localhost:3001/api/auth/google/callback` is in authorized redirect URIs

**Problem**: "Access blocked: This app's request is invalid"
- **Solution**: Verify OAuth consent screen is configured in Google Cloud Console

### Token Issues
**Problem**: "Invalid token" errors
- **Solution**: Check JWT_SECRET matches between token generation and verification
- Clear localStorage and login again

**Problem**: Token not being sent
- **Solution**: Check Authorization header: `Bearer <token>`

### Admin Login Issues
**Problem**: "Invalid credentials"
- **Solution**: Verify exact credentials:
  - Email: `admin@email.com` (case-sensitive)
  - Password: `admin@boo` (case-sensitive)

### Backend Connection Issues
**Problem**: Frontend can't reach backend
- **Solution**: Ensure backend is running on port 3001
- Check CORS configuration allows origin `http://localhost:3000`

## Production Deployment Checklist

- [ ] Set up production database (MongoDB/PostgreSQL)
- [ ] Migrate users and feedback to database
- [ ] Use environment variables for all secrets
- [ ] Update Google OAuth redirect URIs with production domain
- [ ] Use httpOnly cookies instead of localStorage for tokens
- [ ] Implement refresh token mechanism
- [ ] Add rate limiting on authentication endpoints
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Implement password reset flow
- [ ] Add email verification for new users
- [ ] Set up proper session management
- [ ] Add audit logging for admin actions
- [ ] Implement CSRF protection
- [ ] Use strong JWT secrets (64+ characters)
- [ ] Set appropriate token expiration times
- [ ] Add request validation and sanitization
- [ ] Implement account lockout after failed attempts

## Additional Features to Consider

### For Users
- Profile management
- View feedback history
- Edit/delete submissions
- Email notifications for responses

### For Admin
- User management interface
- Bulk actions on feedback
- Export feedback data (CSV/PDF)
- Advanced analytics dashboard
- Feedback tagging and categorization
- Search and filter capabilities

### Security Enhancements
- Two-factor authentication (2FA)
- OAuth with multiple providers (GitHub, Microsoft)
- IP-based access restrictions
- Device management
- Session management (view/revoke active sessions)

## Support

For issues or questions:
1. Check this documentation
2. Review backend logs in terminal
3. Check browser console for frontend errors
4. Verify environment variables are set correctly
5. Ensure all dependencies are installed (`npm install`)

## Architecture Diagram

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
    ┌────▼────┐       ┌────▼─────┐
    │  Login  │       │  Admin   │
    │  Page   │       │  Login   │
    └────┬────┘       └────┬─────┘
         │                 │
    ┌────▼────┐       ┌────▼─────┐
    │ Google  │       │  Local   │
    │  OAuth  │       │ Strategy │
    └────┬────┘       └────┬─────┘
         │                 │
         └─────────┬───────┘
                   │
              ┌────▼────┐
              │   JWT   │
              │  Token  │
              └────┬────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ┌────▼────┐         ┌────▼─────┐
    │  User   │         │  Admin   │
    │Dashboard│         │Dashboard │
    └─────────┘         └──────────┘
```

## Files Modified for Authentication

### Backend
- `backend/src/index.ts` - Main authentication logic
- `backend/.env` - Environment configuration
- `backend/package.json` - Auth dependencies

### Frontend
- `frontend/src/pages/UserLogin.tsx` - User login page
- `frontend/src/pages/AdminLogin.tsx` - Admin login page
- `frontend/src/pages/UserDashboard.tsx` - Added auth integration
- `frontend/src/pages/AdminDashboard.tsx` - Added auth integration
- `frontend/src/components/ProtectedRoute.tsx` - Route protection
- `frontend/src/App.tsx` - Updated routing with auth

## Next Steps

1. **Set up Google OAuth credentials** (see Step 1-3 above)
2. **Update .env file** with your credentials
3. **Test both authentication flows**
4. **Plan database migration** for production
5. **Implement additional security measures** from checklist
