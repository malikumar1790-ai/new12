/*
  # Create Storage Bucket for Resume Uploads

  1. Storage
    - Create `resumes` bucket for job application files
    - Configure public access for resume downloads
    - Set file size and type restrictions

  2. Security
    - Allow public uploads to resumes bucket
    - Allow public downloads from resumes bucket
    - File type restrictions (PDF, DOC, DOCX only)
*/

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to resumes bucket
CREATE POLICY IF NOT EXISTS "Allow public resume uploads"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'resumes');

-- Allow public downloads from resumes bucket
CREATE POLICY IF NOT EXISTS "Allow public resume downloads"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'resumes');

-- Allow public updates to resumes (for metadata)
CREATE POLICY IF NOT EXISTS "Allow public resume updates"
ON storage.objects FOR UPDATE
TO authenticated, anon
USING (bucket_id = 'resumes');