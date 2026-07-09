-- Drop in reverse dependency order
drop table if exists payments cascade;
drop table if exists invoices cascade;
drop table if exists costings cascade;
drop table if exists item_master cascade;
drop table if exists clients cascade;

-- clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  phone text,
  address text,
  reference text,
  created_at timestamptz default now()
);

-- item_master
create table item_master (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  section text not null check (section in ('kitchen', 'accessories', 'hardware', 'civil')),
  name text not null,
  default_rate numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- costings
create table costings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  client_id uuid references clients,
  costing_number text unique not null,
  status text not null default 'saved' check (status in ('draft', 'saved')),
  client_name text not null,
  client_phone text,
  client_address text,
  client_reference text,
  shutter_top text,
  shutter_base text,
  cabinet_color text,
  line_items jsonb not null default '{}',
  kitchen_total numeric not null default 0,
  accessories_total numeric not null default 0,
  hardware_total numeric not null default 0,
  civil_total numeric not null default 0,
  freight numeric not null default 0,
  gst_rate numeric not null default 18,
  gst_amount numeric not null default 0,
  grand_total numeric not null default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- invoices
create table invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  costing_id uuid references costings not null,
  client_id uuid references clients,
  invoice_number text unique not null,
  status text not null default 'pending' check (status in ('pending', 'partial', 'paid')),
  line_items jsonb not null default '{}',
  kitchen_total numeric not null default 0,
  accessories_total numeric not null default 0,
  hardware_total numeric not null default 0,
  civil_total numeric not null default 0,
  freight numeric not null default 0,
  gst_rate numeric not null default 18,
  gst_amount numeric not null default 0,
  grand_total numeric not null default 0,
  created_at timestamptz default now()
);

-- payments
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  invoice_id uuid references invoices not null,
  stage text not null check (stage in ('advance', 'pre_delivery', 'completion')),
  amount numeric not null,
  paid_at date not null,
  notes text,
  created_at timestamptz default now()
);

-- RLS
alter table clients enable row level security;
alter table item_master enable row level security;
alter table costings enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;

create policy "user owns clients" on clients for all using (auth.uid() = user_id);
create policy "user owns item_master" on item_master for all using (auth.uid() = user_id);
create policy "user owns costings" on costings for all using (auth.uid() = user_id);
create policy "user owns invoices" on invoices for all using (auth.uid() = user_id);
create policy "user owns payments" on payments for all using (auth.uid() = user_id);
