-- Additive extension for testing configuration persistence metadata.
-- Safe to run multiple times.

alter table public.testing_configurations
  add column if not exists framework_version text not null default '2026.08.unleash-v1',
  add column if not exists configuration_metadata jsonb not null default '{}'::jsonb;

update public.testing_configurations
set
  framework_version = coalesce(nullif(trim(framework_version), ''), '2026.08.unleash-v1'),
  configuration_metadata = coalesce(configuration_metadata, '{}'::jsonb)
where true;

create index if not exists testing_configurations_updated_idx
  on public.testing_configurations (updated_at desc);
