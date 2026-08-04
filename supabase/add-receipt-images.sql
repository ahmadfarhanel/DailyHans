-- Jalankan sekali di Supabase SQL Editor.
alter table expenses add column if not exists receipt_path text;
alter table income add column if not exists receipt_path text;

insert into storage.buckets (id, name, public)
values ('transaction-images', 'transaction-images', false)
on conflict (id) do nothing;

create policy "users upload own transaction images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'transaction-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users read own transaction images"
on storage.objects for select to authenticated
using (
  bucket_id = 'transaction-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'users delete own transaction images') then
    create policy "users delete own transaction images"
    on storage.objects for delete to authenticated
    using (
      bucket_id = 'transaction-images'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end $$;
