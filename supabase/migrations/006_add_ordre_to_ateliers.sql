-- Add ordre column for display ordering
ALTER TABLE ateliers
ADD COLUMN ordre integer;

-- Initialize ordre based on current created_at order (most recent first = lowest ordre)
UPDATE ateliers
SET ordre = sub.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS row_num
  FROM ateliers
) AS sub
WHERE ateliers.id = sub.id;

-- Make NOT NULL after backfill
ALTER TABLE ateliers
ALTER COLUMN ordre SET NOT NULL;

-- Default for new ateliers: 0 (will be overridden by API logic)
ALTER TABLE ateliers
ALTER COLUMN ordre SET DEFAULT 0;
