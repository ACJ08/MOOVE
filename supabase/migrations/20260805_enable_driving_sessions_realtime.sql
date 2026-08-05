-- Enable live weekly-driving refreshes for a driver's own completed sessions.
-- Safe to execute after the existing MOOVE migrations.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'driving_sessions'
  ) then
    alter publication supabase_realtime add table public.driving_sessions;
  end if;
end $$;
