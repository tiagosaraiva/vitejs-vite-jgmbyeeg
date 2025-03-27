/*
  # Add conclusion and judgment fields to analysis points

  1. Changes
    - Add conclusion and judgment fields to complaint_analysis_points table
    - Add check constraint for judgment values
*/

ALTER TABLE complaint_analysis_points
ADD COLUMN conclusion text,
ADD COLUMN judgment text CHECK (judgment IN ('Procedente', 'Improcedente', 'Inconclusivo'));