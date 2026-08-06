-- Additive permission repair for the deployed testing analytics schema.
-- RLS policies created by 20260806_research_analytics_and_testing_governance.sql
-- already restrict writes to public.is_admin(); these grants only allow those
-- policies to be evaluated for authenticated browser sessions.

grant usage on schema public to authenticated;

grant select, insert, update, delete
  on public.testing_configurations,
     public.testing_action_plans,
     public.testing_iterations
  to authenticated;
