-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  google_id VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback submissions table
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),  -- Made optional for public submissions
  name VARCHAR(255),  -- Name from public feedback form
  email VARCHAR(255),  -- Email from public feedback form
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  ai_summary TEXT,
  recommended_actions JSONB,
  user_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback_submissions(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback_submissions(created_at DESC);

-- Insert admin user (password: admin@boo)
INSERT INTO users (id, email, name, password, role)
VALUES (
  'admin-1',
  'admin@email.com',
  'Admin',
  '$2b$10$YourHashedPasswordHere',  -- This will be replaced by migration script
  'admin'
)
ON CONFLICT (email) DO NOTHING;
