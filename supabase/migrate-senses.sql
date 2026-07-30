-- Run once in Supabase SQL Editor (existing projects).
-- Adds senses jsonb: [{ "gloss": "...", "example": "..." }, ...]

alter table public.gre_words
  add column if not exists senses jsonb;

update public.gre_words
set senses = jsonb_build_array(
  jsonb_build_object('gloss', gloss, 'example', '')
)
where senses is null
   or senses = 'null'::jsonb
   or jsonb_typeof(senses) <> 'array'
   or jsonb_array_length(senses) = 0;

alter table public.gre_words
  alter column senses set default '[]'::jsonb;

alter table public.gre_words
  alter column senses set not null;

create or replace function public.gre_put_word(p_password text, p_row jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  result public.gre_words;
  v_senses jsonb;
  v_gloss text;
  i int;
  item jsonb;
  g text;
  ex text;
begin
  perform public.gre_assert_password(p_password);

  v_senses := coalesce(p_row->'senses', '[]'::jsonb);
  if jsonb_typeof(v_senses) <> 'array' or jsonb_array_length(v_senses) < 1 then
    -- legacy single gloss (+ optional example)
    g := trim(coalesce(p_row->>'gloss', ''));
    ex := trim(coalesce(p_row->>'example', ''));
    if g = '' then
      raise exception '至少需要一组释义 + 例句' using errcode = 'P0001';
    end if;
    if ex = '' then
      raise exception '每条释义都需要例句' using errcode = 'P0001';
    end if;
    v_senses := jsonb_build_array(jsonb_build_object('gloss', g, 'example', ex));
  else
    for i in 0 .. jsonb_array_length(v_senses) - 1 loop
      item := v_senses->i;
      g := trim(coalesce(item->>'gloss', ''));
      ex := trim(coalesce(item->>'example', ''));
      if g = '' or ex = '' then
        raise exception '每条释义都必须配例句' using errcode = 'P0001';
      end if;
      v_senses := jsonb_set(v_senses, array[i::text], jsonb_build_object('gloss', g, 'example', ex));
    end loop;
  end if;

  v_gloss := trim(coalesce(v_senses->0->>'gloss', ''));

  delete from public.gre_words
  where word = lower(trim(p_row->>'word')) and id is distinct from (p_row->>'id');

  insert into public.gre_words as w (id, word, gloss, senses, note, created_at, updated_at, day_key)
  values (
    p_row->>'id',
    lower(trim(p_row->>'word')),
    v_gloss,
    v_senses,
    nullif(trim(coalesce(p_row->>'note', '')), ''),
    coalesce((p_row->>'createdAt')::timestamptz, now()),
    coalesce((p_row->>'updatedAt')::timestamptz, now()),
    coalesce(nullif(p_row->>'dayKey', ''), to_char(now() at time zone 'utc', 'YYYY-MM-DD'))
  )
  on conflict (id) do update set
    word = excluded.word,
    gloss = excluded.gloss,
    senses = excluded.senses,
    note = excluded.note,
    updated_at = excluded.updated_at,
    day_key = excluded.day_key
  returning * into result;

  return jsonb_build_object(
    'id', result.id,
    'word', result.word,
    'gloss', result.gloss,
    'senses', result.senses,
    'note', result.note,
    'createdAt', result.created_at,
    'updatedAt', result.updated_at,
    'dayKey', result.day_key
  );
end;
$$;

grant execute on function public.gre_put_word(text, jsonb) to anon, authenticated;
