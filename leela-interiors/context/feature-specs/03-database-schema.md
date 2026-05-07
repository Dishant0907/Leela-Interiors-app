Read `AGENTS.md` before starting.

The app shell is ready. Create all Supabase tables, enable RLS, and generate TypeScript types.

## Tables

Run the following SQL in the Supabase SQL editor. Save the SQL in `supabase/migrations/001_initial_schema.sql`.

### clients
```sql
create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  phone text,
  address text,
  reference text,
  created_at timestamptz default now()
);
```

### item_master
```sql
create table item_master (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  section text not null check (section in ('kitchen', 'accessories', 'hardware', 'civil')),
  name text not null,
  default_rate numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);
```

### costings
```sql
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
```

### invoices
```sql
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
```

### payments
```sql
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
```

## Row Level Security

Enable RLS on all tables and add policies so every query is scoped to `auth.uid()`:

```sql
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
```

## TypeScript Types

Generate types with the Supabase CLI:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

Commit the generated file.

The `line_items` JSONB shape:
```ts
{
  sections: {
    kitchen: LineItem[]
    accessories: LineItem[]
    hardware: LineItem[]
    civil: LineItem[]
  }
}
// LineItem: { id: string, description: string, qty: number, rate: number, amount: number }
```

### Check when done

- all 5 tables exist in Supabase with correct columns
- RLS is enabled on every table
- a row inserted by one user is not returned when queried as another
- `src/types/supabase.ts` is generated and committed
