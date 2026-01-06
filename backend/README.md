# AI Feedback System - Backend

Backend server for the AI-powered feedback system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_actual_api_key
PORT=3001
```

## Development

Run the development server:
```bash
npm run dev
```

## Build

Build for production:
```bash
npm run build
```

## Production

Run in production:
```bash
npm start
```

## API Endpoints

### POST /api/feedback/submit
Submit user feedback
- Body: `{ rating: number, review: string }`
- Returns: `{ success: boolean, aiResponse: string, submissionId: string }`

### GET /api/feedback/admin/submissions
Get all submissions (Admin)
- Returns: `{ success: boolean, submissions: Array, count: number }`

### GET /api/health
Health check endpoint
- Returns: `{ status: string, timestamp: string }`

## Deployment

This backend can be deployed to:
- Vercel (recommended)
- Render
- Railway
- Any Node.js hosting platform

For Vercel:
```bash
vercel --prod
```

Make sure to set the `GEMINI_API_KEY` environment variable in your deployment platform.
