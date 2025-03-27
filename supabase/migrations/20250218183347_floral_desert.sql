/*
  # Add complaint history table

  1. New Tables
    - `complaint_history`
      - `id` (uuid, primary key)
      - `complaint_id` (uuid, references complaints)
      - `user_id` (uuid, references users)
      - `timestamp` (timestamptz)
      - `field` (text)
      - `old_value` (jsonb)
      - `new_value` (jsonb)
      - `change_type` (text)

  2. Indexes
    - Index on complaint_id for faster lookups
    - Index on timestamp for chronological queries
    - Index on change_type for filtering by type of change

  3. Views
    - complaint_audit_log for easy querying of history with user details
*/

-- Create complaint history table
CREATE TABLE complaint_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  timestamp timestamptz DEFAULT now(),
  field text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  change_type text NOT NULL CHECK (change_type IN ('create', 'update', 'delete')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX complaint_history_complaint_id_idx ON complaint_history(complaint_id);
CREATE INDEX complaint_history_timestamp_idx ON complaint_history(timestamp);
CREATE INDEX complaint_history_change_type_idx ON complaint_history(change_type);

-- Create view for audit log with user details
CREATE VIEW complaint_audit_log AS
SELECT 
  ch.id,
  ch.complaint_id,
  c.number as complaint_number,
  u.name as user_name,
  u.email as user_email,
  ch.timestamp,
  ch.field,
  ch.old_value,
  ch.new_value,
  ch.change_type
FROM complaint_history ch
LEFT JOIN complaints c ON ch.complaint_id = c.id
LEFT JOIN users u ON ch.user_id = u.id
ORDER BY ch.timestamp DESC;