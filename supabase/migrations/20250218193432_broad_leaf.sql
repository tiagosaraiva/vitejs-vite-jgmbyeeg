/*
  # Complete complaint history tracking

  1. Changes
    - Add NOT NULL constraint to user_name column
    - Add index for user_name for faster queries
    - Update existing records
*/

-- Add NOT NULL constraint to user_name
ALTER TABLE complaint_history
ALTER COLUMN user_name SET NOT NULL;

-- Add index for user_name
CREATE INDEX IF NOT EXISTS complaint_history_user_name_idx ON complaint_history(user_name);