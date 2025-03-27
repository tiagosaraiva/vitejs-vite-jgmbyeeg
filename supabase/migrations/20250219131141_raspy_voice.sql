-- Add observation column to complaint_conclusions table
ALTER TABLE complaint_conclusions
ADD COLUMN observation text;

-- Update judgment check constraint in complaint_analysis_points
ALTER TABLE complaint_analysis_points
DROP CONSTRAINT IF EXISTS complaint_analysis_points_judgment_check;

ALTER TABLE complaint_analysis_points
ADD CONSTRAINT complaint_analysis_points_judgment_check 
CHECK (judgment IN ('Procedente', 'Improcedente', 'Inconclusivo', 'Parcialmente procedente'));