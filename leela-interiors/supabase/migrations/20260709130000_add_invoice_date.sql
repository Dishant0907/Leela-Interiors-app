-- Invoice date should snapshot the costing_date at conversion time, not created_at
ALTER TABLE invoices ADD COLUMN invoice_date date NOT NULL DEFAULT current_date;

UPDATE invoices i SET invoice_date = c.costing_date FROM costings c WHERE c.id = i.costing_id;
