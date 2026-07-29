-- GRE cloud schema for kaoyan-site
-- Run once in Supabase Dashboard → SQL Editor.
-- Then set write password:
--   select gre_set_password('你的口令', null);

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.gre_words (
  id text primary key,
  word text not null,
  gloss text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  day_key text not null
);

create unique index if not exists gre_words_word_uidx on public.gre_words (word);

create table if not exists public.gre_passages (
  id text primary key,
  title text not null,
  body text not null,
  kind text not null check (kind in ('question', 'sentence', 'passage')),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.gre_quant (
  id text primary key,
  kind text not null check (kind in ('wrong', 'note')),
  topic text not null default '未分类',
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.gre_writing (
  id text primary key,
  kind text not null check (kind in ('template', 'essay')),
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Single-row write secret (bcrypt via pgcrypto crypt)
create table if not exists public._gre_write_secret (
  id int primary key default 1 check (id = 1),
  password_hash text not null,
  updated_at timestamptz not null default now()
);

revoke all on table public._gre_write_secret from anon, authenticated, public;
revoke all on table public.gre_words from anon, authenticated, public;
revoke all on table public.gre_passages from anon, authenticated, public;
revoke all on table public.gre_quant from anon, authenticated, public;
revoke all on table public.gre_writing from anon, authenticated, public;

grant select on table public.gre_words to anon, authenticated;
grant select on table public.gre_passages to anon, authenticated;
grant select on table public.gre_quant to anon, authenticated;
grant select on table public.gre_writing to anon, authenticated;

alter table public.gre_words enable row level security;
alter table public.gre_passages enable row level security;
alter table public.gre_quant enable row level security;
alter table public.gre_writing enable row level security;
alter table public._gre_write_secret enable row level security;

drop policy if exists gre_words_select on public.gre_words;
create policy gre_words_select on public.gre_words for select to anon, authenticated using (true);

drop policy if exists gre_passages_select on public.gre_passages;
create policy gre_passages_select on public.gre_passages for select to anon, authenticated using (true);

drop policy if exists gre_quant_select on public.gre_quant;
create policy gre_quant_select on public.gre_quant for select to anon, authenticated using (true);

drop policy if exists gre_writing_select on public.gre_writing;
create policy gre_writing_select on public.gre_writing for select to anon, authenticated using (true);

-- No policies for insert/update/delete → blocked for anon; writes go through RPCs.

-- ---------------------------------------------------------------------------
-- Password helpers + RPCs
-- ---------------------------------------------------------------------------

create or replace function public.gre_assert_password(p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored text;
begin
  if p_password is null or length(trim(p_password)) = 0 then
    raise exception 'WRITE_LOCKED' using errcode = 'P0001';
  end if;
  select password_hash into stored from public._gre_write_secret where id = 1;
  if stored is null then
    raise exception 'PASSWORD_NOT_SET' using errcode = 'P0001';
  end if;
  if stored <> crypt(p_password, stored) then
    raise exception 'BAD_PASSWORD' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.gre_has_password()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public._gre_write_secret where id = 1);
$$;

create or replace function public.gre_set_password(p_new text, p_old text default null)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored text;
begin
  if p_new is null or length(trim(p_new)) < 4 then
    raise exception '口令至少 4 个字符' using errcode = 'P0001';
  end if;

  select password_hash into stored from public._gre_write_secret where id = 1;

  if stored is null then
    insert into public._gre_write_secret (id, password_hash, updated_at)
    values (1, crypt(trim(p_new), gen_salt('bf')), now());
    return true;
  end if;

  if p_old is null or stored <> crypt(p_old, stored) then
    raise exception 'BAD_PASSWORD' using errcode = 'P0001';
  end if;

  update public._gre_write_secret
  set password_hash = crypt(trim(p_new), gen_salt('bf')), updated_at = now()
  where id = 1;
  return true;
end;
$$;

-- Words ------------------------------------------------------------------

create or replace function public.gre_put_word(p_password text, p_row jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  result public.gre_words;
begin
  perform public.gre_assert_password(p_password);
  -- Same lemma under another id → drop the other so unique(word) holds
  delete from public.gre_words
  where word = lower(trim(p_row->>'word')) and id is distinct from (p_row->>'id');

  insert into public.gre_words as w (id, word, gloss, note, created_at, updated_at, day_key)
  values (
    p_row->>'id',
    lower(trim(p_row->>'word')),
    trim(p_row->>'gloss'),
    nullif(trim(coalesce(p_row->>'note', '')), ''),
    coalesce((p_row->>'createdAt')::timestamptz, now()),
    coalesce((p_row->>'updatedAt')::timestamptz, now()),
    coalesce(nullif(p_row->>'dayKey', ''), to_char(now() at time zone 'utc', 'YYYY-MM-DD'))
  )
  on conflict (id) do update set
    word = excluded.word,
    gloss = excluded.gloss,
    note = excluded.note,
    updated_at = excluded.updated_at,
    day_key = excluded.day_key
  returning * into result;

  return jsonb_build_object(
    'id', result.id,
    'word', result.word,
    'gloss', result.gloss,
    'note', result.note,
    'createdAt', result.created_at,
    'updatedAt', result.updated_at,
    'dayKey', result.day_key
  );
end;
$$;

create or replace function public.gre_delete_word(p_password text, p_id text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform public.gre_assert_password(p_password);
  delete from public.gre_words where id = p_id;
end;
$$;

-- Passages ---------------------------------------------------------------

create or replace function public.gre_put_passage(p_password text, p_row jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  result public.gre_passages;
begin
  perform public.gre_assert_password(p_password);
  insert into public.gre_passages as p (id, title, body, kind, created_at, updated_at)
  values (
    p_row->>'id',
    coalesce(nullif(trim(p_row->>'title'), ''), '未命名'),
    trim(p_row->>'body'),
    p_row->>'kind',
    coalesce((p_row->>'createdAt')::timestamptz, now()),
    coalesce((p_row->>'updatedAt')::timestamptz, now())
  )
  on conflict (id) do update set
    title = excluded.title,
    body = excluded.body,
    kind = excluded.kind,
    updated_at = excluded.updated_at
  returning * into result;

  return jsonb_build_object(
    'id', result.id,
    'title', result.title,
    'body', result.body,
    'kind', result.kind,
    'createdAt', result.created_at,
    'updatedAt', result.updated_at
  );
end;
$$;

create or replace function public.gre_delete_passage(p_password text, p_id text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform public.gre_assert_password(p_password);
  delete from public.gre_passages where id = p_id;
end;
$$;

-- Quant ------------------------------------------------------------------

create or replace function public.gre_put_quant(p_password text, p_row jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  result public.gre_quant;
begin
  perform public.gre_assert_password(p_password);
  insert into public.gre_quant as q (id, kind, topic, title, body, created_at, updated_at)
  values (
    p_row->>'id',
    p_row->>'kind',
    coalesce(nullif(trim(p_row->>'topic'), ''), '未分类'),
    trim(p_row->>'title'),
    trim(p_row->>'body'),
    coalesce((p_row->>'createdAt')::timestamptz, now()),
    coalesce((p_row->>'updatedAt')::timestamptz, now())
  )
  on conflict (id) do update set
    kind = excluded.kind,
    topic = excluded.topic,
    title = excluded.title,
    body = excluded.body,
    updated_at = excluded.updated_at
  returning * into result;

  return jsonb_build_object(
    'id', result.id,
    'kind', result.kind,
    'topic', result.topic,
    'title', result.title,
    'body', result.body,
    'createdAt', result.created_at,
    'updatedAt', result.updated_at
  );
end;
$$;

create or replace function public.gre_delete_quant(p_password text, p_id text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform public.gre_assert_password(p_password);
  delete from public.gre_quant where id = p_id;
end;
$$;

-- Writing ----------------------------------------------------------------

create or replace function public.gre_put_writing(p_password text, p_row jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  result public.gre_writing;
begin
  perform public.gre_assert_password(p_password);
  insert into public.gre_writing as w (id, kind, title, body, created_at, updated_at)
  values (
    p_row->>'id',
    p_row->>'kind',
    trim(p_row->>'title'),
    trim(p_row->>'body'),
    coalesce((p_row->>'createdAt')::timestamptz, now()),
    coalesce((p_row->>'updatedAt')::timestamptz, now())
  )
  on conflict (id) do update set
    kind = excluded.kind,
    title = excluded.title,
    body = excluded.body,
    updated_at = excluded.updated_at
  returning * into result;

  return jsonb_build_object(
    'id', result.id,
    'kind', result.kind,
    'title', result.title,
    'body', result.body,
    'createdAt', result.created_at,
    'updatedAt', result.updated_at
  );
end;
$$;

create or replace function public.gre_delete_writing(p_password text, p_id text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform public.gre_assert_password(p_password);
  delete from public.gre_writing where id = p_id;
end;
$$;

-- Bulk import (local IndexedDB / JSON → cloud) ---------------------------

create or replace function public.gre_import_bundle(p_password text, p_bundle jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  item jsonb;
  n_words int := 0;
  n_passages int := 0;
  n_quant int := 0;
  n_writing int := 0;
begin
  perform public.gre_assert_password(p_password);

  for item in select * from jsonb_array_elements(coalesce(p_bundle->'words', '[]'::jsonb))
  loop
    perform public.gre_put_word(p_password, item);
    n_words := n_words + 1;
  end loop;

  for item in select * from jsonb_array_elements(coalesce(p_bundle->'passages', '[]'::jsonb))
  loop
    perform public.gre_put_passage(p_password, item);
    n_passages := n_passages + 1;
  end loop;

  for item in select * from jsonb_array_elements(coalesce(p_bundle->'quant', '[]'::jsonb))
  loop
    perform public.gre_put_quant(p_password, item);
    n_quant := n_quant + 1;
  end loop;

  for item in select * from jsonb_array_elements(coalesce(p_bundle->'writing', '[]'::jsonb))
  loop
    perform public.gre_put_writing(p_password, item);
    n_writing := n_writing + 1;
  end loop;

  return jsonb_build_object(
    'words', n_words,
    'passages', n_passages,
    'quant', n_quant,
    'writing', n_writing
  );
end;
$$;

-- Grants -----------------------------------------------------------------

revoke all on function public.gre_assert_password(text) from public, anon, authenticated;
grant execute on function public.gre_has_password() to anon, authenticated;
grant execute on function public.gre_set_password(text, text) to anon, authenticated;
grant execute on function public.gre_put_word(text, jsonb) to anon, authenticated;
grant execute on function public.gre_delete_word(text, text) to anon, authenticated;
grant execute on function public.gre_put_passage(text, jsonb) to anon, authenticated;
grant execute on function public.gre_delete_passage(text, text) to anon, authenticated;
grant execute on function public.gre_put_quant(text, jsonb) to anon, authenticated;
grant execute on function public.gre_delete_quant(text, text) to anon, authenticated;
grant execute on function public.gre_put_writing(text, jsonb) to anon, authenticated;
grant execute on function public.gre_delete_writing(text, text) to anon, authenticated;
grant execute on function public.gre_import_bundle(text, jsonb) to anon, authenticated;

-- Optional: hide gre_assert_password from clients (still used internally).
-- PostgREST exposes all granted functions; assert is harmless if called alone.
