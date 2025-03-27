-- Add user_name column to complaint_history table
ALTER TABLE complaint_history
ADD COLUMN user_name text;

-- Update existing records to set user_name as 'Sistema'
UPDATE complaint_history
SET user_name = 'Sistema'
WHERE user_name IS NULL;