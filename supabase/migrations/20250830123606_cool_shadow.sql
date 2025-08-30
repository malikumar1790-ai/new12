/*
  # Create Project Submissions Table

  1. New Tables
    - `project_submissions`
      - `id` (uuid, primary key)
      - `project_type` (text, type of AI project)
      - `industry` (text, client industry)
      - `budget` (text, budget range)
      - `timeline` (text, project timeline)
      - `features` (text array, selected features)
      - `description` (text, project description)
      - `contact_name` (text, contact person name)
      - `contact_email` (text, contact email)
      - `contact_company` (text, contact company)
      - `status` (text, submission status)
      - `estimated_cost` (text, estimated project cost)
      - `priority_level` (text, priority based on budget)
      - `ip_address` (text, client IP)
      - `user_agent` (text, browser info)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `project_submissions` table
    - Allow public submissions
    - Allow public viewing for admin dashboard
*/

-- Create project submissions table if not exists
CREATE TABLE IF NOT EXISTS project_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_type TEXT NOT NULL,
    industry TEXT NOT NULL,
    budget TEXT NOT NULL,
    timeline TEXT NOT NULL,
    features TEXT[] DEFAULT '{}',
    description TEXT,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_company TEXT,
    status TEXT DEFAULT 'new',
    estimated_cost TEXT,
    priority_level TEXT DEFAULT 'medium',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit projects" ON project_submissions;
DROP POLICY IF EXISTS "Allow public project submissions" ON project_submissions;
DROP POLICY IF EXISTS "Allow public to view project submissions" ON project_submissions;

-- Allow anyone to submit project requests
CREATE POLICY "Allow public project submissions"
ON project_submissions FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow anyone to view project submissions (for admin dashboard)
CREATE POLICY "Allow public to view project submissions"
ON project_submissions FOR SELECT
TO authenticated, anon
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_submissions_created_at 
ON project_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_submissions_contact_email 
ON project_submissions(contact_email);

CREATE INDEX IF NOT EXISTS idx_project_submissions_status 
ON project_submissions(status);

CREATE INDEX IF NOT EXISTS idx_project_submissions_priority 
ON project_submissions(priority_level);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_project_submissions_updated_at ON project_submissions;

CREATE TRIGGER update_project_submissions_updated_at
    BEFORE UPDATE ON project_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();