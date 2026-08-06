-- Reconcile the existing Supabase Auth administrator with its application
-- profile. This never creates an auth.users record and never changes driver
-- records. The profile trigger/function and public.is_admin() RBAC helper from
-- prior migrations remain the single source of authorization truth.

insert into public.profiles (id, name, email, role)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data ->> 'name', ''), 'MOOVE System Administrator'),
  u.email,
  'admin'
from auth.users u
where u.id = '5bff38f3-3de9-4d27-9633-ee9e622699f0'::uuid
  and u.email = 'admin@moove.app'
on conflict (id) do update
  set role = 'admin',
      name = coalesce(nullif(public.profiles.name, ''), excluded.name),
      updated_at = now();

-- Fail safely if the specified Auth account has been removed or its email was
-- changed. This prevents silently granting administrator access to another UID.
do $$
begin
  if not exists (
    select 1 from public.profiles
    where id = '5bff38f3-3de9-4d27-9633-ee9e622699f0'::uuid
      and email = 'admin@moove.app'
      and role = 'admin'
  ) then
    raise exception 'Expected MOOVE system administrator profile was not reconciled';
  end if;
end $$;
