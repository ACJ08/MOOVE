-- Keep driver context and administrator research dashboards in sync without polling.
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'testing_configurations') then
    alter publication supabase_realtime add table public.testing_configurations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'testing_action_plans') then
    alter publication supabase_realtime add table public.testing_action_plans;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'testing_iterations') then
    alter publication supabase_realtime add table public.testing_iterations;
  end if;
end $$;
