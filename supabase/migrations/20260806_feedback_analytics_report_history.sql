-- Immutable audit history for exports generated from the TRL-4 feedback dashboard.
create table if not exists public.testing_report_exports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null check (report_type in ('csv', 'txt', 'pdf')),
  configuration_id text references public.testing_configurations(id) on delete set null,
  generated_by uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now()
);

alter table public.testing_report_exports enable row level security;
drop policy if exists "testing_report_exports_admin_only" on public.testing_report_exports;
create policy "testing_report_exports_admin_only" on public.testing_report_exports for all to authenticated
using (public.is_admin()) with check (public.is_admin());
grant select, insert on public.testing_report_exports to authenticated;
create index if not exists testing_report_exports_generated_idx on public.testing_report_exports (generated_at desc);
