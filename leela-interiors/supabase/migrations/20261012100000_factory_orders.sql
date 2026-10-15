-- Factory orders: production orders sent to the factory.
-- Deliberately contains NO price/rate/amount/margin columns.
create table factory_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  costing_id uuid references costings(id) on delete set null,
  order_number text not null,
  client_name text not null default '',
  box_colour text not null default '',
  shutter_colour text not null default '',
  front_edge text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'in_production', 'ready', 'delivered')),
  sent_at timestamptz,
  in_production_at timestamptz,
  ready_at timestamptz,
  delivered_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, order_number)
);

create table factory_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references factory_orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null default 'cabinet'
    check (section in ('cabinet', 'shutter', 'accessories', 'hardware', 'other')),
  description text not null default '',
  width numeric,
  height numeric,
  depth numeric,
  qty numeric not null default 1,
  material text not null default '',
  finish text not null default '',
  hardware text not null default '',
  remarks text not null default '',
  sort_order integer not null default 0,
  -- exposed_sides, grain (H/V), side (L/R/B), shelf_type (GL/BRD), shelf_qty, shutter_type (DOOR/FRONT/FILLER/C)
  meta jsonb not null default '{}'::jsonb
);

create index factory_orders_costing_id_idx on factory_orders (costing_id);
create index factory_order_items_order_id_idx on factory_order_items (order_id, sort_order);

alter table factory_orders enable row level security;
alter table factory_order_items enable row level security;

create policy "user owns factory_orders" on factory_orders for all using (auth.uid() = user_id);
create policy "user owns factory_order_items" on factory_order_items for all using (auth.uid() = user_id);
