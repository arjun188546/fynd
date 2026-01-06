# Quick Reference Card

## 🚀 Start the Application

### Backend
```bash
cd backend
npm run dev
```
**Runs on**: http://localhost:3001

### Frontend
```bash
cd frontend
npm run dev
```
**Runs on**: http://localhost:3000

---

## 🔑 Credentials

### Admin Login
- **URL**: http://localhost:3000/admin/login
- **Email**: `admin@email.com`
- **Password**: `admin@boo`

### User Login
- **URL**: http://localhost:3000/login
- **Method**: Google OAuth (requires setup - see AUTHENTICATION_SETUP.md)

---

## 🌐 Routes

### Public Routes
- `/login` - User login with Google
- `/admin/login` - Admin login with email/password

### Protected Routes (Require Authentication)
- `/` - User Dashboard (submit feedback)
- `/admin` - Admin Dashboard (view all feedback) **[Admin Only]**
- `/dashboard` - Main dashboard
- `/warehouses` - Data warehouses
- `/explorer` - Data explorer
- `/insights` - Insights
- `/visualizations` - Visualizations
- `/history` - History
- `/settings` - Settings

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/admin/login         Admin login
GET    /api/auth/google              Initiate Google OAuth
GET    /api/auth/google/callback     OAuth callback
GET    /api/auth/me                  Get current user
POST   /api/auth/logout              Logout
```

### Feedback (Protected)
```
POST   /api/feedback/submit                Submit feedback (requires auth)
GET    /api/feedback/admin/submissions     View all submissions (requires admin)
```

---

## ⚙️ Environment Variables

### Backend (.env)
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_secure_random_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Generate JWT Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Get API Keys**:
- Gemini: https://makersuite.google.com/app/apikey
- Google OAuth: https://console.cloud.google.com/

---

## 🧪 Testing Checklist

### Admin Flow
- [ ] Navigate to /admin/login
- [ ] Login with admin@email.com / admin@boo
- [ ] Should see Admin Dashboard
- [ ] Should see admin email in top bar
- [ ] Submit feedback as user
- [ ] Check feedback appears in admin dashboard
- [ ] Test logout button

### User Flow (After Google OAuth Setup)
- [ ] Navigate to /login
- [ ] Click "Continue with Google"
- [ ] Complete Google OAuth
- [ ] Should see User Dashboard
- [ ] Should see user name in top bar
- [ ] Submit feedback
- [ ] Should see AI response
- [ ] Test logout button

### Security
- [ ] Try accessing /admin without login → redirects to /login
- [ ] Login as user, try /admin → shows "Access denied"
- [ ] Clear localStorage, try accessing / → redirects to /login
- [ ] Test expired token handling

---

## 📚 Documentation

- **[README.md](./README.md)** - Main project documentation
- **[AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)** - Complete auth setup guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

---

## 🐛 Common Issues

### "Redirect URI mismatch" (Google OAuth)
**Fix**: Add `http://localhost:3001/api/auth/google/callback` to authorized redirect URIs in Google Cloud Console

### "Invalid token" errors
**Fix**: 
1. Check JWT_SECRET is consistent
2. Clear localStorage and login again
3. Restart backend server

### Admin login fails
**Fix**: 
- Verify exact credentials (case-sensitive):
  - Email: `admin@email.com`
  - Password: `admin@boo`

### Frontend can't reach backend
**Fix**:
1. Ensure backend is running on port 3001
2. Check CORS allows `http://localhost:3000`
3. Clear browser cache

### Google OAuth doesn't work
**Fix**: Complete Google OAuth setup in AUTHENTICATION_SETUP.md section 1

---

## 🎨 Design System

### Colors (Black & White Theme)
- Primary: `#000000` (Black)
- Secondary: `#ffffff` (White)
- Accent: `#333333` (Dark Gray)
- Border: `#e5e7eb` (Light Gray)

### Icons
- User: Profile icon (circle)
- Admin: Shield icon (rounded box)
- Login: Google logo (colored)
- Logout: LogOut icon

---

## 📦 Key Dependencies

### Backend
- express - Web server
- passport - Authentication
- passport-local - Email/password strategy
- passport-google-oauth20 - Google OAuth strategy
- bcryptjs - Password hashing
- jsonwebtoken - JWT tokens
- @google/generative-ai - Gemini AI
- zod - Schema validation

### Frontend
- react - UI framework
- react-router-dom - Routing
- framer-motion - Animations
- tailwindcss - Styling
- lucide-react - Icons

---

## 🔒 Security Notes

1. **Admin Password**: Change default password in production
2. **JWT Secret**: Use strong random string (64+ characters)
3. **HTTPS**: Enable for production deployment
4. **Database**: Replace in-memory storage before production
5. **Token Storage**: Consider httpOnly cookies instead of localStorage
6. **Rate Limiting**: Add to prevent brute force attacks
7. **CORS**: Restrict to production domain

---

## 📝 Quick Commands

### Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Build for Production
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Check for Errors
```bash
# Backend TypeScript check
cd backend && npx tsc --noEmit

# Frontend TypeScript check
cd frontend && npx tsc --noEmit
```

### Generate Secure Keys
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 64
```

---

## 🎯 Project Status

### ✅ Completed
- Two-dashboard system (User + Admin)
- Google OAuth setup (backend ready)
- Email/password admin auth
- JWT token system
- Protected routes
- User/admin info display
- Logout functionality
- AI response generation
- Black & white design
- Comprehensive documentation

### ⚙️ Requires Configuration
- Google OAuth credentials
- Gemini API key
- JWT secret generation

### 🚀 Future Enhancements
- Database integration
- Refresh tokens
- Password reset
- Email verification
- 2FA for admin
- Rate limiting

---

## 💡 Tips

1. **Development**: Use two terminal windows (backend + frontend)
2. **Testing**: Use incognito/private window for testing different users
3. **Debugging**: Check browser console and backend terminal for errors
4. **Tokens**: Use browser DevTools → Application → Local Storage to inspect tokens
5. **API Testing**: Use Postman or Thunder Client for testing API endpoints
6. **Logs**: Backend logs show authentication events and errors

---

## 📞 Need Help?

1. Check [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for detailed setup
2. Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical details
3. See [README.md](./README.md) for general information
4. Check browser console for frontend errors
5. Check backend terminal for server errors
6. Verify all environment variables are set correctly

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Status**: Ready for Development Testing
