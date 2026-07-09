-- Let users set the costing date manually instead of relying on created_at
ALTER TABLE costings ADD COLUMN costing_date date NOT NULL DEFAULT current_date;
