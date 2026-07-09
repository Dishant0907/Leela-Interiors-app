-- Add unit of measure to item_master (e.g. Nos, Sqft, Rft, Set, Lot)
ALTER TABLE item_master ADD COLUMN unit text NOT NULL DEFAULT 'nos';
