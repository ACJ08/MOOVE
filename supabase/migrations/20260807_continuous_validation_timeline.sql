-- The internal QA and participant-validation work ran continuously throughout
-- the documented MVP lifecycle, rather than only in the final two days.
update public.testing_iterations
set start_date = '2026-07-20', end_date = '2026-08-07',
    summary = case when iteration_number = 7
      then 'Continuous internal development cycle covering debugging, feature refinement, usability improvements, performance optimization, and regression verification.'
      else 'Continuous alpha testing and participant-validation cycle covering survey collection, observations, feedback review, iterative revisions, and feature refinement.'
    end
where iteration_number in (7, 8)
  and project_id = '01985d68-8b96-7ad4-9a0d-0c7f87fe1001';
