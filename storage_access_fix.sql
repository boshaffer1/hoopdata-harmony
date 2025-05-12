-- Basic Read (SELECT) policies for all buckets
-- This allows authenticated users to read from all buckets
CREATE POLICY "Allow authenticated users to read from all buckets"
ON storage.objects FOR SELECT
TO authenticated
USING (true);

-- Specific policies for each bucket (videos, clips, thumbnails, csv_files, roster)
-- These allow authenticated users to upload/update files

-- Videos bucket
CREATE POLICY "Allow authenticated uploads to videos bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow authenticated updates to videos bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'videos')
WITH CHECK (bucket_id = 'videos');

-- Clips bucket
CREATE POLICY "Allow authenticated uploads to clips bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'clips');

CREATE POLICY "Allow authenticated updates to clips bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'clips')
WITH CHECK (bucket_id = 'clips');

-- Thumbnails bucket
CREATE POLICY "Allow authenticated uploads to thumbnails bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'thumbnails');

CREATE POLICY "Allow authenticated updates to thumbnails bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'thumbnails')
WITH CHECK (bucket_id = 'thumbnails');

-- CSV Files bucket
CREATE POLICY "Allow authenticated uploads to csv_files bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'csv_files');

CREATE POLICY "Allow authenticated updates to csv_files bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'csv_files')
WITH CHECK (bucket_id = 'csv_files');

-- Roster bucket
CREATE POLICY "Allow authenticated uploads to roster bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'roster');

CREATE POLICY "Allow authenticated updates to roster bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'roster')
WITH CHECK (bucket_id = 'roster');

-- If you need to allow deleting files, add DELETE policies
CREATE POLICY "Allow authenticated deletes from all buckets"
ON storage.objects FOR DELETE
TO authenticated
USING (true);

-- If you need anonymous access (public files) for any bucket, add policies like these:
-- For example, to make thumbnails publicly readable:
CREATE POLICY "Allow public access to thumbnails"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'thumbnails'); 