-- Qualitative evidence for each feedback response. These columns are nullable:
-- a participant may complete every quantitative question without a comment.
-- A separate table is unnecessary because each comment has a one-to-one
-- relationship with this existing survey response and evaluation category.

alter table public.feedback_submissions
  add column if not exists user_experience_comment text check (char_length(user_experience_comment) <= 2000),
  add column if not exists first_impression_comment text check (char_length(first_impression_comment) <= 2000),
  add column if not exists perceived_value_comment text check (char_length(perceived_value_comment) <= 2000),
  add column if not exists ease_of_use_comment text check (char_length(ease_of_use_comment) <= 2000),
  add column if not exists technical_reliability_comment text check (char_length(technical_reliability_comment) <= 2000),
  add column if not exists bug_free_experience_comment text check (char_length(bug_free_experience_comment) <= 2000),
  add column if not exists continued_usage_comment text check (char_length(continued_usage_comment) <= 2000);

-- Comments are read with their feedback submission. Existing table grants and
-- RLS policies therefore keep this qualitative evidence owner/admin protected.
create index if not exists feedback_submissions_with_comments_idx
  on public.feedback_submissions (submitted_at desc)
  where user_experience_comment is not null
     or first_impression_comment is not null
     or perceived_value_comment is not null
     or ease_of_use_comment is not null
     or technical_reliability_comment is not null
     or bug_free_experience_comment is not null
     or continued_usage_comment is not null;
