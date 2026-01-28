<div align="center">
  <img src="./fynd_logo.svg" alt="Fynd Feed Logo" width="200" />
  <h1>Fynd Feed - AI Customer Intelligence</h1>
  <p><strong>Transforming customer feedback into actionable business intelligence with Gemini AI.</strong></p>

  <p>
    <a href="https://github.com/arjun188546/fynd/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="License" />
    </a>
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
    <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Maintained" />
  </p>
  
  <p>
    <a href="https://render.com/deploy?repo=https://github.com/arjun188546/fynd">
      <img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" />
    </a>
  </p>
</div>

---

## ⚡️ Quick Preview
Fynd Feed is a production-ready AI-powered feedback system featuring dual dashboards for users and administrators. It leverages the latest **Gemini 2.0 Flash** models to provide real-time responses, sentiment analysis, and strategic business recommendations.

## 🚀 Key Features

### 👤 User Dashboard
- **Instant AI Engagement**: Receive personalized, empathetic responses immediately after submission.
- **Smart Validation**: Character limits and gibberish detection ensure high-quality feedback.
- **Modern UI**: Clean, interactive interface built with Framer Motion for smooth transitions.
- **Google OAuth**: Secure and seamless sign-in for public users.

### 🛡️ Admin Dashboard (Command Center)
- **"Ask Fynd AI" Chatbot**: A RAG-enabled assistant that understands your entire feedback history.
- **Claude-style UX**: High-contrast dark theme with markdown support and code pills for data analysis.
- **Strategic Insights**: AI-generated summaries and actionable business recommendations for every review.
- **Real-time Monitoring**: Live analytics, rating distributions, and auto-refresh metrics.

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express, TypeScript, Zod |
| **AI Engine** | Google Gemini API (`gemini-2.0-flash`) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Passport.js (Local + Google OAuth), JWT |
| **Icons** | Lucide React |

## 📦 Prerequisites
- **Node.js**: v18.0.0+
- **Database**: Supabase URL & Service Key
- **AI**: Google Gemini API Key
- **Auth**: Google Cloud Console credentials for OAuth

## 🚀 Setup & Installation

### 1. Clone & Install
```bash
git clone https://github.com/arjun188546/fynd.git
cd fynd

# Install Backend
cd backend && npm install

# Install Frontend
cd ../frontend && npm install
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=3001
GEMINI_API_KEY=your_key_here
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

## 📡 API Endpoints (Core)

- `POST /api/auth/admin/login`: Secure admin entry.
- `POST /api/feedback/submit`: Submit analysis request.
- `GET /api/feedback/admin/submissions`: Fetch intelligence reports.
- `POST /api/admin/chat`: Interact with the RAG Chatbot.

## 📄 License
Distributed under the **Apache License 2.0**. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ </p>
</div>
