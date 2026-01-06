# Supabase Configuration

## Database Connection String

Add this to your `backend/.env` file:

```env
DATABASE_URL=postgresql://postgres:madhavam@boogeyman@db.wdhqodrlxjiuaukvbanv.supabase.co:5432/postgres
```

## Complete .env File

Your `backend/.env` should look like this:

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=943b576e694ac2b0ca2e74b3f8e1a9d5c7f2e4b6a8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8e0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8e0d2e4f6a8b0c2d4e6f8a0
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATABASE_URL=postgresql://postgres:madhavam@boogeyman@db.wdhqodrlxjiuaukvbanv.supabase.co:5432/postgres
```

## Supabase Dashboard

- **URL:** https://wdhqodrlxjiuaukvbanv.supabase.co
- **Password:** madhavam@boogeyman

## Next Steps

1. Add DATABASE_URL to `backend/.env`
2. Run migration: `cd backend && npm run migrate`
3. Backend will automatically use Supabase
