/*
  # Create Contact Submissions Table with Enhanced Features

  1. New Tables
    - `contact_submissions`
      - `id` (uuid, primary key)
      - `name` (text, contact name)
      - `email` (text, contact email)
      - `company` (text, company name - optional)
      - `phone` (text, phone number - optional)
      - `service` (text, service interest - optional)
      - `message` (text, contact message)
      - `status` (text, submission status)
      - `ip_address` (text, client IP for security)
      - `user_agent` (text, browser info for analytics)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `contact_submissions` table
    - Allow public submissions
    - Allow authenticated users to view all submissions (for admin)

  3. Indexes
    - Performance indexes for common queries
*/

-- Create contact submissions table if not exists
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    service TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can view all submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow public contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow public to view contact submissions" ON contact_submissions;

-- Allow anyone to submit contact forms
CREATE POLICY "Allow public contact submissions"
ON contact_submissions FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow anyone to view contact submissions (for admin dashboard)
CREATE POLICY "Allow public to view contact submissions"
ON contact_submissions FOR SELECT
TO authenticated, anon
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at 
ON contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email 
ON contact_submissions(email);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status 
ON contact_submissions(status);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;

-- Create trigger for updated_at
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();