-- Tags for Q&A posts (topics, projects, hackathons, etc.)
alter table public.qa_posts
  add column if not exists tags text[] not null default '{}';

create index if not exists qa_posts_tags_gin on public.qa_posts using gin (tags);
