-- Fix foreign key relationships to reference profiles table instead of auth.users directly
-- Drop existing foreign keys and recreate them to reference profiles

ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_user_id_fkey,
ADD CONSTRAINT messages_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE room_members 
DROP CONSTRAINT IF EXISTS room_members_user_id_fkey,
ADD CONSTRAINT room_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE invites 
DROP CONSTRAINT IF EXISTS invites_created_by_fkey,
ADD CONSTRAINT invites_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE moderation_reports 
DROP CONSTRAINT IF EXISTS moderation_reports_reporter_id_fkey,
ADD CONSTRAINT moderation_reports_reporter_id_fkey 
FOREIGN KEY (reporter_id) REFERENCES profiles(id) ON DELETE SET NULL;