-- Fix invoices.costing_id FK to allow deleting costings that have linked invoices.
-- Previously NOT NULL with no cascade — now nullable with ON DELETE SET NULL.
ALTER TABLE invoices
  DROP CONSTRAINT IF EXISTS invoices_costing_id_fkey;

ALTER TABLE invoices
  ALTER COLUMN costing_id DROP NOT NULL;

ALTER TABLE invoices
  ADD CONSTRAINT invoices_costing_id_fkey
  FOREIGN KEY (costing_id) REFERENCES costings(id) ON DELETE SET NULL;
