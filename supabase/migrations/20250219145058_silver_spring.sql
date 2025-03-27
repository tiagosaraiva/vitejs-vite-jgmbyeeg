/*
  # Add removed member column to complaints table

  1. Changes
    - Add removed_member column to complaints table
*/

-- Add removed_member column to complaints table
ALTER TABLE complaints
ADD COLUMN removed_member text;

-- Create index for efficient querying
CREATE INDEX complaints_removed_member_idx ON complaints(removed_member);