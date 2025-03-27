/*
  # Add analysis points table

  1. New Tables
    - `complaint_analysis_points`
      - `id` (uuid, primary key)
      - `complaint_id` (uuid, foreign key to complaints)
      - `point` (text)
      - `created_at` (timestamp)

  2. Changes
    - Add table for storing analysis points
    - Add index for efficient querying
*/

-- Create analysis points table
CREATE TABLE complaint_analysis_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  point text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX complaint_analysis_points_complaint_id_idx ON complaint_analysis_points(complaint_id);