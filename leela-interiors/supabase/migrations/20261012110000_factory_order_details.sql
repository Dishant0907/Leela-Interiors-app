-- Factory order: dates, site/contact details, drawing reference + one attached drawing file.
alter table factory_orders
  add column order_date date not null default current_date,
  add column required_date date,
  add column site_address text not null default '',
  add column contact_person text not null default '',
  add column contact_phone text not null default '',
  add column drawing_ref text not null default '',
  add column drawing_revision text not null default '',
  add column drawing_path text,
  add column drawing_name text;

-- Private bucket; objects live under "<user_id>/<order_id>/<file>".
insert into storage.buckets (id, name, public, file_size_limit)
values ('factory-drawings', 'factory-drawings', false, 20971520)
on conflict (id) do nothing;

create policy "user owns factory drawings" on storage.objects
  for all to authenticated
  using (bucket_id = 'factory-drawings' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'factory-drawings' and (storage.foldername(name))[1] = auth.uid()::text);
