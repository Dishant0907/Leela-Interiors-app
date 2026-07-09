-- clients
CREATE TABLE clients (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  phone       text,
  address     text,
  reference   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_select" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clients_insert" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_update" ON clients FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_delete" ON clients FOR DELETE USING (auth.uid() = user_id);

-- item_master
CREATE TABLE item_master (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section       text        NOT NULL,
  name          text        NOT NULL,
  default_rate  numeric(12,2),
  active        boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE item_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY "item_master_select" ON item_master FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "item_master_insert" ON item_master FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "item_master_update" ON item_master FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "item_master_delete" ON item_master FOR DELETE USING (auth.uid() = user_id);

-- costings
CREATE TABLE costings (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id           uuid        REFERENCES clients(id) ON DELETE SET NULL,
  costing_number      text        NOT NULL,
  status              text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','saved')),
  client_name         text,
  client_phone        text,
  client_address      text,
  client_reference    text,
  shutter_top         text,
  shutter_base        text,
  cabinet_color       text,
  line_items          jsonb       NOT NULL DEFAULT '{"sections":{"kitchen":[],"accessories":[],"hardware":[],"civil":[]}}',
  kitchen_total       numeric(12,2) NOT NULL DEFAULT 0,
  accessories_total   numeric(12,2) NOT NULL DEFAULT 0,
  hardware_total      numeric(12,2) NOT NULL DEFAULT 0,
  civil_total         numeric(12,2) NOT NULL DEFAULT 0,
  freight             numeric(12,2) NOT NULL DEFAULT 0,
  gst_rate            numeric(5,2)  NOT NULL DEFAULT 0,
  gst_amount          numeric(12,2) NOT NULL DEFAULT 0,
  grand_total         numeric(12,2) NOT NULL DEFAULT 0,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE costings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "costings_select" ON costings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "costings_insert" ON costings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "costings_update" ON costings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "costings_delete" ON costings FOR DELETE USING (auth.uid() = user_id);

-- invoices
CREATE TABLE invoices (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  costing_id          uuid        REFERENCES costings(id) ON DELETE SET NULL,
  client_id           uuid        REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number      text        NOT NULL,
  status              text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','partial','paid')),
  line_items          jsonb       NOT NULL DEFAULT '{"sections":{"kitchen":[],"accessories":[],"hardware":[],"civil":[]}}',
  kitchen_total       numeric(12,2) NOT NULL DEFAULT 0,
  accessories_total   numeric(12,2) NOT NULL DEFAULT 0,
  hardware_total      numeric(12,2) NOT NULL DEFAULT 0,
  civil_total         numeric(12,2) NOT NULL DEFAULT 0,
  freight             numeric(12,2) NOT NULL DEFAULT 0,
  gst_rate            numeric(5,2)  NOT NULL DEFAULT 0,
  gst_amount          numeric(12,2) NOT NULL DEFAULT 0,
  grand_total         numeric(12,2) NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_select" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "invoices_insert" ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "invoices_update" ON invoices FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "invoices_delete" ON invoices FOR DELETE USING (auth.uid() = user_id);

-- payments
CREATE TABLE payments (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id  uuid        NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  stage       text        NOT NULL CHECK (stage IN ('advance','pre_delivery','completion')),
  amount      numeric(12,2) NOT NULL,
  paid_at     timestamptz NOT NULL DEFAULT now(),
  notes       text
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_select" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payments_update" ON payments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payments_delete" ON payments FOR DELETE USING (auth.uid() = user_id);
