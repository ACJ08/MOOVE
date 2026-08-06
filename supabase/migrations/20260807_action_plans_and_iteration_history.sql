-- MOOVE project documentation: scalable action plans and development iteration history.
-- This migration extends the existing governance tables without modifying prior migrations.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.validation_cycles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name)
);

insert into public.projects (id, slug, name)
values ('01985d68-8b96-7ad4-9a0d-0c7f87fe1001', 'moove-mvp-2026', 'MOOVE MVP')
on conflict (slug) do update set name = excluded.name;

insert into public.validation_cycles (id, project_id, name, starts_on, ends_on)
values ('01985d68-8b96-7ad4-9a0d-0c7f87fe1002', '01985d68-8b96-7ad4-9a0d-0c7f87fe1001', 'MVP build and TRL-4 validation', '2026-07-19', '2026-08-07')
on conflict (project_id, name) do update set starts_on = excluded.starts_on, ends_on = excluded.ends_on;

alter table public.testing_action_plans
  add column if not exists project_id uuid references public.projects(id) on delete restrict,
  add column if not exists validation_cycle_id uuid references public.validation_cycles(id) on delete set null,
  add column if not exists title text,
  add column if not exists category text,
  add column if not exists description text not null default '',
  add column if not exists reason text not null default '',
  add column if not exists expected_outcome text not null default '',
  add column if not exists owner text not null default 'MOOVE Product Team',
  add column if not exists completion_percentage smallint not null default 0 check (completion_percentage between 0 and 100),
  add column if not exists target_completion_date date,
  add column if not exists completed_date date,
  add column if not exists notes text not null default '',
  add column if not exists risks text not null default '',
  add column if not exists mitigation_strategy text not null default '';

update public.testing_action_plans
set project_id = '01985d68-8b96-7ad4-9a0d-0c7f87fe1001', validation_cycle_id = '01985d68-8b96-7ad4-9a0d-0c7f87fe1002', title = coalesce(title, issue)
where project_id is null;
alter table public.testing_action_plans alter column project_id set not null;

alter table public.testing_iterations
  add column if not exists project_id uuid references public.projects(id) on delete restrict,
  add column if not exists validation_cycle_id uuid references public.validation_cycles(id) on delete set null,
  add column if not exists iteration_number integer,
  add column if not exists iteration_name text,
  add column if not exists phase text not null default '',
  add column if not exists objective text not null default '',
  add column if not exists summary text not null default '',
  add column if not exists work_completed text not null default '',
  add column if not exists feedback_received text not null default '',
  add column if not exists issues_found text not null default '',
  add column if not exists resolution text not null default '',
  add column if not exists validation_result text not null default '',
  add column if not exists completion_percentage smallint not null default 0 check (completion_percentage between 0 and 100),
  add column if not exists status text not null default 'Planned' check (status in ('Planned', 'In Progress', 'Complete')),
  add column if not exists start_date date,
  add column if not exists end_date date;

update public.testing_iterations
set project_id = '01985d68-8b96-7ad4-9a0d-0c7f87fe1001', validation_cycle_id = '01985d68-8b96-7ad4-9a0d-0c7f87fe1002', iteration_name = coalesce(iteration_name, version), iteration_number = coalesce(iteration_number, 0)
where project_id is null;
alter table public.testing_iterations alter column project_id set not null;

create unique index if not exists testing_iterations_project_number_idx on public.testing_iterations(project_id, iteration_number) where deleted_at is null;
create index if not exists testing_action_plans_project_status_idx on public.testing_action_plans(project_id, status, priority, target_completion_date) where deleted_at is null;
create index if not exists validation_cycles_project_idx on public.validation_cycles(project_id, starts_on desc);

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects for each row execute function public.update_updated_at();
drop trigger if exists validation_cycles_updated_at on public.validation_cycles;
create trigger validation_cycles_updated_at before update on public.validation_cycles for each row execute function public.update_updated_at();

alter table public.projects enable row level security;
alter table public.validation_cycles enable row level security;
create policy "projects_select_authenticated" on public.projects for select to authenticated using (true);
create policy "projects_admin_write" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "validation_cycles_select_authenticated" on public.validation_cycles for select to authenticated using (true);
create policy "validation_cycles_admin_write" on public.validation_cycles for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.projects, public.validation_cycles to authenticated;
grant insert, update, delete on public.projects, public.validation_cycles to authenticated;

-- Seed project documentation. Seeded records are ordinary Supabase records and remain editable in the dashboard.
insert into public.testing_action_plans (project_id, validation_cycle_id, issue, title, category, description, reason, expected_outcome, priority, status, completion_percentage, target_completion_date, completed_date, risks, mitigation_strategy, notes)
values
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002','Define driver health problem and research scope','Research and validation plan','Research & Planning','Document sedentary-driver needs, literature findings, user assumptions, KPIs, and survey methodology.','A defensible MVP needs measurable validation criteria.','A scoped, evidence-led validation framework.','High','Done',100,'2026-07-20','2026-07-20','Scope may outgrow the build window.','Prioritize core risks and measurable outcomes.','Completed before product design.'),
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002','Create accessible responsive design system','Responsive UI and design system','UI/UX Design','Establish navigation, dashboard hierarchy, component patterns, mobile layouts, and accessibility conventions.','Drivers access MOOVE on varied screen sizes and in short sessions.','Consistent, readable interaction patterns across the MVP.','High','Done',100,'2026-07-23','2026-07-23','Dense dashboards can reduce readability.','Use progressive disclosure and responsive grids.','Design tokens and shared card patterns implemented.'),
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002','Deliver core driver experience','Core driver experience','Frontend Development','Build landing, authentication, dashboard, driving session, exercise library, health dashboard, and feedback interfaces.','The MVP needs an end-to-end participant journey.','A cohesive driver workflow ready for evaluation.','High','Done',100,'2026-07-29','2026-07-29','Feature breadth could affect stability.','Build reusable React components and test each flow.','Core flows integrated.'),
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002','Secure Supabase data model','Supabase schema and security','Supabase Development','Create normalized tables, authentication integration, migrations, indexes, and RLS policies.','Research data must be durable and access-controlled.','Reliable persistence with administrator reporting access.','High','Done',100,'2026-07-31','2026-07-31','Incorrect policies could block survey collection.','Test authenticated inserts and role-based reads.','RLS hardening and indexes added.'),
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002','Integrate personalized recommendations','Groq recommendation integration','AI Integration','Connect guarded AI recommendation requests with prompt structure, error handling, and fallbacks.','Personalized guidance complements rule-based wellness support.','Useful recommendations without blocking primary workflows.','Medium','Done',100,'2026-08-02','2026-08-02','Provider errors or slow responses.','Use validation, timeouts, and fallback content.','Recommendation experience verified.'),
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002','Complete analytics and evidence reporting','Feedback analytics and reports','Analytics','Implement calculated KPIs, survey evidence, classification lenses, exports, and research documentation.','Validation decisions need traceable quantitative and qualitative evidence.','Research-grade feedback analytics for TRL-4 reporting.','High','Done',100,'2026-08-05','2026-08-05','Placeholder language could compromise research integrity.','Use direct participant data and metric calculations only.','Classification evidence updated.'),
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002','Validate and refine participant workflows','Participant validation refinements','User Validation','Review survey responses, navigation observations, and comments; prioritize improvements.','Observed usability issues should directly inform the final build.','Improved readability, navigation, and reporting from validation evidence.','High','Done',100,'2026-08-07','2026-08-07','Small sample sizes can overstate a single comment.','Combine comments with aggregate metrics.','Final participant validation pass completed.')
on conflict do nothing;

insert into public.testing_iterations (project_id, validation_cycle_id, iteration_number, iteration_name, version, testing_cycle, phase, objective, summary, work_completed, feedback_received, improvements_made, issues_found, resolution, validation_result, completion_percentage, status, retesting_status, start_date, end_date)
values
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002',1,'Research & Planning','1','MVP build and TRL-4 validation','Research & Planning','Define problem, users, validation assumptions, and architecture.','Established the evidence base for MOOVE.','Literature review, driver needs analysis, competitor scan, KPIs, survey plan, initial architecture.','Early driver-health needs emphasized short, low-friction movement prompts.','Prioritized preventive-health workflows and measurable success criteria.','Broad scope.','Defined MVP boundaries.','Complete research plan approved.',100,'Complete','Complete','2026-07-19','2026-07-20'),
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002',2,'UI/UX Design','2','MVP build and TRL-4 validation','UI/UX Design','Create clear, responsive driver journeys.','Produced the visual foundation for the MVP.','Wireframes, navigation, landing page, dashboard hierarchy, mobile layouts, design system, accessibility plan.','Review favored simpler paths to sessions and exercises.','Improved visual hierarchy and touch-friendly controls.','Dashboard information density.','Used card grouping and progressive disclosure.','Design system ready for implementation.',100,'Complete','Complete','2026-07-21','2026-07-23'),
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002',3,'Frontend Development','3','MVP build and TRL-4 validation','Frontend Development','Deliver the complete driver-facing MVP.','Implemented the primary React application flows.','Landing page, auth, dashboard, driving session, exercise library, health dashboard, feedback and analytics views.','Internal review highlighted responsive edge cases.','Refactored shared components and responsive grids.','Repeated UI patterns.','Centralized reusable components.','Core experience complete.',100,'Complete','Complete','2026-07-24','2026-07-29'),
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002',4,'Backend & Supabase','4','MVP build and TRL-4 validation','Backend & Supabase','Persist product and research data securely.','Connected the MVP to Supabase.','Schema, authentication, CRUD, session tracking, migrations, RLS, indexes, query optimization.','Integration tests exposed policy and permission edge cases.','Hardened grants and owner/admin policies.','403 and policy mismatches.','Added explicit authenticated grants and RLS tests.','Durable secure data layer complete.',100,'Complete','Complete','2026-07-30','2026-07-31'),
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002',5,'AI Integration','5','MVP build and TRL-4 validation','AI Integration','Add guarded personalized recommendation support.','Integrated Groq-backed recommendation flows.','Prompt design, behavior summaries, request validation, error handling, token optimization, fallbacks.','Responses needed reliable fallback behavior.','Added non-blocking fallback messaging.','Transient provider failure.','Guarded API requests and fallback content.','Recommendation flow verified.',100,'Complete','Complete','2026-08-01','2026-08-02'),
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002',6,'System Integration','6','MVP build and TRL-4 validation','System Integration','Verify the integrated product and reporting workflow.','Connected frontend, backend, AI, and analytics surfaces.','Analytics calculations, reporting, dashboard integration, end-to-end flow verification.','Data freshness needed clearer handling.','Added live reload and durable data retrieval.','Cross-module sync.','Used Supabase-backed sources of truth.','End-to-end workflow complete.',100,'Complete','Complete','2026-08-03','2026-08-04'),
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002',7,'Internal Testing & Bug Fixing','7','MVP build and TRL-4 validation','Quality Assurance','Stabilize the MVP before participant testing.','Completed focused internal QA and fixes.','UI, API, database, responsive, cross-browser and regression checks; performance and component refactoring.','Minor layout and permission defects identified.','Resolved defects and verified regression coverage.','Responsive and permissions edge cases.','Retested affected workflows.','Ready for participant validation.',100,'Complete','Complete','2026-08-05','2026-08-06'),
('01985d68-8b96-7ad4-9a0d-0c7f87fe1001','01985d68-8b96-7ad4-9a0d-0c7f87fe1002',8,'User Validation & Feedback Testing','8','MVP build and TRL-4 validation','User Validation','Evaluate desirability, feasibility, and viability with participant surveys.','Participant feedback informed the final refinement pass.','Prepared testing sessions, collected surveys, measured completion, satisfaction, navigation, adoption and recommendation intent, and reviewed comments.','Participants reported positive usability; comments highlighted readability, dashboard organization, and faster workflows.','Improved evidence presentation, responsive readability, analytics visualizations, and minor defects.','Need to avoid overinterpreting small samples.','Triangulated comments with calculated survey metrics.','Validation evidence supports continued refinement and future larger-sample testing.',100,'Complete','Complete','2026-08-07','2026-08-07')
on conflict do nothing;
