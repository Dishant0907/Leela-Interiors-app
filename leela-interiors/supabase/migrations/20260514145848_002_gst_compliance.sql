-- business_profile (one row per user)
create table business_profile (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        references auth.users not null unique,
  business_name text       not null,
  gstin        text        not null,
  address      text        not null,
  state_code   text        not null,
  pan          text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table business_profile enable row level security;
create policy "user owns business_profile" on business_profile
  for all using (auth.uid() = user_id);

-- costings: GST split + client GSTIN
alter table costings
  add column transaction_type text not null default 'intra'
    check (transaction_type in ('intra', 'inter')),
  add column cgst_rate   numeric(5,2) not null default 9,
  add column sgst_rate   numeric(5,2) not null default 9,
  add column igst_rate   numeric(5,2) not null default 0,
  add column cgst_amount numeric(12,2) not null default 0,
  add column sgst_amount numeric(12,2) not null default 0,
  add column igst_amount numeric(12,2) not null default 0,
  add column client_gstin text;

-- invoices: GST split + client GSTIN
alter table invoices
  add column transaction_type text not null default 'intra'
    check (transaction_type in ('intra', 'inter')),
  add column cgst_rate   numeric(5,2) not null default 9,
  add column sgst_rate   numeric(5,2) not null default 9,
  add column igst_rate   numeric(5,2) not null default 0,
  add column cgst_amount numeric(12,2) not null default 0,
  add column sgst_amount numeric(12,2) not null default 0,
  add column igst_amount numeric(12,2) not null default 0,
  add column client_gstin text;

-- item_master: HSN/SAC code
alter table item_master
  add column hsn_sac text;
