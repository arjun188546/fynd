-- Migration: Add support for public feedback submissions
-- Run this on your Supabase database to add name and email columns

-- Add name column to feedback_submissions
ALTER TABLE feedback_submissions 
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Add email column to feedback_submissions
ALTER TABLE feedback_submissions 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Make user_id optional by dropping the foreign key constraint
ALTER TABLE feedback_submissions 
DROP CONSTRAINT IF EXISTS feedback_submissions_user_id_fkey;

-- Make user_id nullable
ALTER TABLE feedback_submissions 
ALTER COLUMN user_id DROP NOT NULL;

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback_submissions(email);

-- Add index for name search
CREATE INDEX IF NOT EXISTS idx_feedback_name ON feedback_submissions(name);

-- Verify changes
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'feedback_submissions'
ORDER BY ordinal_position;
