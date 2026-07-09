-- costing_number/invoice_number were globally unique, but the sequence generator
-- (lib/costing.ts getNextSequence) computes the next number scoped to the current
-- user via RLS. With more than one auth user, two accounts can independently
-- compute the same "next" number and collide on the global constraint. Scope the
-- uniqueness to (user_id, number) to match how numbers are actually generated.

alter table costings drop constraint costings_costing_number_key;
alter table costings add constraint costings_user_id_costing_number_key unique (user_id, costing_number);

alter table invoices drop constraint invoices_invoice_number_key;
alter table invoices add constraint invoices_user_id_invoice_number_key unique (user_id, invoice_number);
