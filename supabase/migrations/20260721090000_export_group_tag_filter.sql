-- US-E10-04 — filter the three CSV export RPCs by group tag (GRPID).
--
-- Each export is a public wrapper over a SECURITY DEFINER private impl. Adding a defaulted
-- p_grpid parameter changes the signature, so — exactly like US-E10-02's get_leaderboard_page
-- — CREATE OR REPLACE would leave an ambiguous OVERLOAD behind. Every function is therefore
-- DROP + CREATE. Drop the public wrapper before its private impl (it depends on it).
--
-- p_grpid is optional and NULL means "every group", so the deployed edge function — which
-- calls these with named p_hn/p_offset/p_limit and never sends p_grpid — keeps working after
-- this migration.
--
-- No group COLUMN is added to any export: a downloaded file is already the chosen group's
-- file (or everyone, where group is moot), so the column would be redundant. The exports
-- filter only.
--
-- Group is resolved from user_game_profile_data, which has no UNIQUE(hn): latest row wins
-- (DISTINCT ON (hn) ORDER BY created_at DESC, id DESC), matching US-E10-02. A player with no
-- profile row — or GRPID NULL — counts as 'UNTAGGED'. The filter runs at the row-producing
-- stage so LIMIT/OFFSET paging counts filtered rows.

-- ── Player export (filter only — no group column) ───────────────────────────────────────
DROP FUNCTION IF EXISTS public.get_player_export_rows(text, integer, integer);
DROP FUNCTION IF EXISTS private.get_player_export_rows(text, integer, integer);

CREATE FUNCTION private.get_player_export_rows(
  p_hn text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT NULL,
  p_grpid text DEFAULT NULL
)
RETURNS TABLE(
  hn text, firstname text, lastname text, gender text, birth_date date, phone text,
  started_program timestamp with time zone, education_level text, "educationName" text,
  "programId" bigint, "programName" text, "programDayCount" integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  with edu as (
    select distinct on (key) key, name
    from (
      select nullif(trim(e.eduid), '') as key, e.name, 1 as priority
      from public.user_education_level e
      where nullif(trim(e.eduid), '') is not null
      union all
      select e.id::text, e.name, 2
      from public.user_education_level e
    ) k
    where k.key is not null
    order by key, priority
  ), latest_profile as (
    select distinct on (gp.hn) gp.hn, gp.program
    from public.user_game_profile_data gp
    where nullif(trim(gp.hn), '') is not null
    order by gp.hn, gp.created_at desc, gp.id desc
  ), latest_group as (
    -- US-E10-04: kept only to FILTER by group; not surfaced as an output column
    select distinct on (gp.hn) gp.hn, gp."GRPID" as grpid
    from public.user_game_profile_data gp
    where nullif(trim(gp.hn), '') is not null
    order by gp.hn, gp.created_at desc, gp.id desc
  ), program_days as (
    select glpd.gpid, max(floor(glpd.day))::integer as day_count
    from public.game_level_preset_data glpd
    where glpd.day is not null
    group by glpd.gpid
  )
  select
    p.hn::text,
    p.firstname,
    p.lastname,
    p.gender,
    p.birth_date,
    p.phone,
    p.started_program,
    p.education_level::text,
    coalesce(nullif(edu.name, ''), trim(coalesce(p.education_level, '')))::text as "educationName",
    lp.program as "programId",
    coalesce(nullif(pl.name, ''), '')::text as "programName",
    coalesce(pd.day_count, 0) as "programDayCount"
  from public.user_data p
  left join edu on edu.key = trim(coalesce(p.education_level, ''))
  left join latest_profile lp on lp.hn = p.hn
  left join public.game_level_preset_list pl on pl.id = lp.program
  left join program_days pd on pd.gpid = lp.program
  left join latest_group lg on lg.hn = p.hn
  where (nullif(trim(p_hn), '') is null or p.hn = trim(p_hn))
    and (nullif(trim(p_grpid), '') is null or coalesce(lg.grpid, 'UNTAGGED') = trim(p_grpid))
  order by p.hn
  limit p_limit offset coalesce(p_offset, 0);
$function$;

CREATE FUNCTION public.get_player_export_rows(
  p_hn text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT NULL,
  p_grpid text DEFAULT NULL
)
RETURNS TABLE(
  hn text, firstname text, lastname text, gender text, birth_date date, phone text,
  started_program timestamp with time zone, education_level text, "educationName" text,
  "programId" bigint, "programName" text, "programDayCount" integer
)
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $function$
  select * from private.get_player_export_rows(p_hn, p_offset, p_limit, p_grpid);
$function$;

-- ── Game export (filter only; every row carries hn to join back to the player file) ──────
DROP FUNCTION IF EXISTS public.get_game_export_rows(text, integer, integer);
DROP FUNCTION IF EXISTS private.get_game_export_rows(text, integer, integer);

CREATE FUNCTION private.get_game_export_rows(
  p_hn text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT NULL,
  p_grpid text DEFAULT NULL
)
RETURNS TABLE(
  hn text, gid text, minigame_name text, mci_group text,
  start_at timestamp with time zone, end_at timestamp with time zone,
  score bigint, level smallint, total_correct bigint, total_wrong bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  with latest_group as (
    select distinct on (gp.hn) gp.hn, gp."GRPID" as grpid
    from public.user_game_profile_data gp
    where nullif(trim(gp.hn), '') is not null
    order by gp.hn, gp.created_at desc, gp.id desc
  ), matched as (
    select
      h.id            as history_id,
      trim(h.hn)      as hn,
      trim(h.gid)     as gid,
      h.user_game_data_id,
      coalesce(h.start_at, gd.started_at) as sort_at,
      gd.started_at,
      gd.ended_at,
      gd.score,
      gd.level,
      p.id            as patient_order
    from public.user_game_history h
    left join public.user_game_data gd on gd.id = h.user_game_data_id
    left join public.user_data p on p.hn = trim(h.hn)
    left join latest_group lg on lg.hn = trim(h.hn)
    where nullif(trim(h.gid), '') is not null
      and h."check-in" is not true
      and (nullif(trim(p_hn), '') is null or trim(h.hn) = trim(p_hn))
      -- US-E10-04: group filter — 'UNTAGGED' covers players with no profile row
      and (nullif(trim(p_grpid), '') is null or coalesce(lg.grpid, 'UNTAGGED') = trim(p_grpid))
      -- ⚠️ REST001 ไม่ถูกตัดที่นี่ — ต่างจาก last_stage ใน history export
  ), replay as (
    select
      r.historyid,
      count(*) filter (where r.answer_result is true)  as correct,
      count(*) filter (where r.answer_result is false) as wrong
    from (
      select
        rl.historyid,
        case
          when jsonb_typeof(rl.value -> 'data') = 'boolean'   then (rl.value -> 'data')::boolean
          when jsonb_typeof(rl.value -> 'answer') = 'boolean' then (rl.value -> 'answer')::boolean
          else null
        end as answer_result
      from public.game_replay_log rl
      join matched m on m.history_id = rl.historyid
      where rl.replayid = 'global.answer_submitted'
    ) r
    where r.answer_result is not null
    group by r.historyid
  )
  select
    matched.hn::text,
    matched.gid::text,
    coalesce(nullif(trim(g.name), ''), nullif(trim(g.th_name), ''), matched.gid)::text as minigame_name,
    coalesce(nullif(trim(g.mci_group), ''), '')::text as mci_group,
    matched.started_at as start_at,
    matched.ended_at   as end_at,
    matched.score,
    matched.level,
    replay.correct as total_correct,
    replay.wrong   as total_wrong
  from matched
  left join public.game_list_data g on trim(g.gid) = matched.gid
  left join replay on replay.historyid = matched.history_id
  order by
    matched.patient_order asc nulls last,
    matched.sort_at asc,
    matched.history_id asc
  limit p_limit offset coalesce(p_offset, 0);
$function$;

CREATE FUNCTION public.get_game_export_rows(
  p_hn text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT NULL,
  p_grpid text DEFAULT NULL
)
RETURNS TABLE(
  hn text, gid text, minigame_name text, mci_group text,
  start_at timestamp with time zone, end_at timestamp with time zone,
  score bigint, level smallint, total_correct bigint, total_wrong bigint
)
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $function$
  select * from private.get_game_export_rows(p_hn, p_offset, p_limit, p_grpid);
$function$;

-- ── History export (filter only) ────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.get_game_history_csv_export_rows(text, integer, integer);
DROP FUNCTION IF EXISTS private.get_game_history_csv_export_rows(text, integer, integer);

CREATE FUNCTION private.get_game_history_csv_export_rows(
  p_hn text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT NULL,
  p_grpid text DEFAULT NULL
)
RETURNS TABLE(
  user_hn text, firstgame_at timestamp with time zone, lastgame_at timestamp with time zone,
  total_time numeric, "check-in" boolean, last_stage bigint, total_score numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  with latest_profile as (
    select distinct on (gp.hn) gp.hn, gp.program
    from public.user_game_profile_data gp
    where gp.hn is not null and gp.program is not null
    order by gp.hn, gp.created_at desc, gp.id desc
  ), latest_group as (
    select distinct on (gp.hn) gp.hn, gp."GRPID" as grpid
    from public.user_game_profile_data gp
    where nullif(trim(gp.hn), '') is not null
    order by gp.hn, gp.created_at desc, gp.id desc
  ), patients as (
    select
      coalesce(p.id, 2147483647) as patient_order,
      p.hn::text as hn,
      (p.started_program at time zone 'Asia/Bangkok')::date as program_start_day,
      latest_profile.program
    from public.user_data p
    join latest_profile on latest_profile.hn = p.hn
    left join latest_group lg on lg.hn = p.hn
    where p.hn is not null
      and p.started_program is not null
      and (nullif(trim(p_hn), '') is null or p.hn = trim(p_hn))
      -- US-E10-04: group filter
      and (nullif(trim(p_grpid), '') is null or coalesce(lg.grpid, 'UNTAGGED') = trim(p_grpid))
  ), program_days as (
    select
      patients.patient_order,
      patients.hn as user_hn,
      preset_days.day as program_day,
      patients.program_start_day + (preset_days.day - 1) as local_day
    from patients
    join (
      select distinct glpd.gpid, glpd.day::integer as day
      from public.game_level_preset_data glpd
      where glpd.day is not null and glpd.day >= 1
    ) preset_days on preset_days.gpid = patients.program
  ), histories as (
    select
      h.*,
      (h.start_at at time zone 'Asia/Bangkok')::date as local_day,
      gd.score as game_score
    from public.user_game_history h
    left join public.user_game_data gd on gd.id = h.user_game_data_id
    where (h.gid is not null or h."check-in" is true)
      and (nullif(trim(p_hn), '') is null or h.hn = trim(p_hn))
  ), daily as (
    select
      program_days.patient_order,
      program_days.user_hn,
      program_days.local_day,
      program_days.program_day,
      min(histories.start_at) filter (
        where histories.gid is not null and histories."check-in" is not true
      ) as firstgame_at,
      max(coalesce(histories.end_at, histories.start_at)) filter (
        where histories.gid is not null and histories."check-in" is not true
      ) as last_play_at,
      max(coalesce(histories.end_at, histories.start_at)) filter (
        where histories."check-in" is true
      ) as last_checkin_at,
      coalesce(bool_or(histories."check-in" is true), false) as has_check_in,
      count(*) filter (
        where histories.gid is not null
          and histories.gid <> 'REST001'
          and histories."check-in" is not true
      ) as played_game_count,
      count(histories.id) as history_count,
      sum(histories.game_score) filter (
        where histories.gid is not null
          and histories.gid <> 'REST001'
          and histories."check-in" is not true
          and histories.game_score is not null
      ) as total_score
    from program_days
    left join histories
      on histories.hn = program_days.user_hn
      and histories.local_day = program_days.local_day
    group by
      program_days.patient_order,
      program_days.user_hn,
      program_days.local_day,
      program_days.program_day
  ), export_rows as (
    select
      daily.patient_order,
      daily.user_hn,
      daily.local_day,
      daily.program_day,
      daily.firstgame_at,
      case
        when daily.firstgame_at is null and daily.last_play_at is null then daily.last_checkin_at
        when daily.last_checkin_at is null and daily.last_play_at is null then daily.firstgame_at
        when daily.last_checkin_at is null then greatest(daily.firstgame_at, daily.last_play_at)
        when daily.last_play_at is null then greatest(daily.firstgame_at, daily.last_checkin_at)
        else greatest(daily.firstgame_at, daily.last_play_at, daily.last_checkin_at)
      end as lastgame_at,
      daily.has_check_in,
      case
        when daily.history_count = 0 then null
        else daily.played_game_count
      end as last_stage,
      daily.total_score
    from daily
  )
  select
    export_rows.user_hn,
    export_rows.firstgame_at,
    export_rows.lastgame_at,
    case
      when export_rows.firstgame_at is not null
        and export_rows.lastgame_at is not null
        and export_rows.lastgame_at >= export_rows.firstgame_at
        then round((extract(epoch from (export_rows.lastgame_at - export_rows.firstgame_at)) / 60.0)::numeric, 1)
      else null
    end as total_time,
    export_rows.has_check_in as "check-in",
    export_rows.last_stage,
    export_rows.total_score
  from export_rows
  order by export_rows.patient_order, export_rows.local_day
  limit p_limit offset coalesce(p_offset, 0);
$function$;

CREATE FUNCTION public.get_game_history_csv_export_rows(
  p_hn text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT NULL,
  p_grpid text DEFAULT NULL
)
RETURNS TABLE(
  user_hn text, firstgame_at timestamp with time zone, lastgame_at timestamp with time zone,
  total_time numeric, "check-in" boolean, last_stage bigint, total_score numeric
)
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $function$
  select * from private.get_game_history_csv_export_rows(p_hn, p_offset, p_limit, p_grpid);
$function$;
