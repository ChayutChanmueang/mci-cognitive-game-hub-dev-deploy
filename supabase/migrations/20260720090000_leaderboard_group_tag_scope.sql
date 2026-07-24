-- US-E10-01 / US-E10-02 — scope the leaderboard to the viewer's group tag.
--
-- Rules (from the story):
--   * A player tagged into a group sees ONLY that group's ranking.
--   * A player with GRPID 'UNTAGGED' — or with no user_game_profile_data row at all —
--     sees EVERY group. That is the admin/inspection view.
--
-- The viewer's group is resolved HERE from p_hn, never taken from the caller. These are
-- SECURITY DEFINER functions reachable with the anon key, so a caller-supplied GRPID would
-- just be a request to view any group by name.
--
-- user_game_profile_data has no UNIQUE(hn); the (hn, created_at desc, id desc) index implies
-- "latest row wins" semantics, so every lookup here uses DISTINCT ON in that order rather than
-- assuming one row per hn.

-- Latest profile row per player, and therefore the group each player belongs to.
CREATE OR REPLACE FUNCTION public.get_user_group(p_hn text)
RETURNS TABLE(grpid text, tag_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  WITH viewer AS (
    SELECT COALESCE((
      SELECT p."GRPID"
      FROM user_game_profile_data p
      WHERE p.hn = p_hn
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT 1
    ), 'UNTAGGED') AS grpid
  )
  SELECT v.grpid, t.tag_name::text
  FROM viewer v
  LEFT JOIN user_group_tag t ON t."GRPID" = v.grpid;
$function$;

-- p_hn is optional so the existing two-argument callers keep working (NULL = UNTAGGED = see all).
CREATE OR REPLACE FUNCTION public.get_leaderboard_page(
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT 20,
  p_hn text DEFAULT NULL
)
RETURNS TABLE(hn text, firstname text, lastname text, total_score bigint, total_players bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  WITH player_grp AS (
    SELECT DISTINCT ON (p.hn) p.hn, p."GRPID" AS grpid
    FROM user_game_profile_data p
    ORDER BY p.hn, p.created_at DESC, p.id DESC
  ),
  viewer AS (
    SELECT COALESCE((SELECT g.grpid FROM player_grp g WHERE g.hn = p_hn), 'UNTAGGED') AS grpid
  ),
  scores AS (
    SELECT
      u.hn,
      u.firstname::text,
      u.lastname::text,
      SUM(gd.score)::bigint AS total_score
    FROM user_data u
    JOIN user_game_history h ON h.hn = u.hn
    JOIN user_game_data gd ON gd.id = h.user_game_data_id
    LEFT JOIN player_grp pg ON pg.hn = u.hn
    WHERE h."check-in" IS NOT TRUE
      AND h.user_game_data_id IS NOT NULL
      AND gd.score IS NOT NULL
      AND (
        (SELECT v.grpid FROM viewer v) = 'UNTAGGED'
        OR COALESCE(pg.grpid, 'UNTAGGED') = (SELECT v.grpid FROM viewer v)
      )
    GROUP BY u.hn, u.firstname, u.lastname
  ),
  total AS (SELECT COUNT(*)::bigint AS cnt FROM scores)
  SELECT s.hn, s.firstname, s.lastname, s.total_score, t.cnt
  FROM scores s, total t
  ORDER BY s.total_score DESC
  LIMIT p_limit OFFSET p_offset;
$function$;

-- Signature unchanged, but the rank is now computed within the viewer's own group. It has to
-- match get_leaderboard_page exactly: the bottom status bar and the list are two separate
-- queries, so if only one is filtered a หางดง player sees a 19-row list under "อันดับ 34".
CREATE OR REPLACE FUNCTION public.get_user_rank(p_hn text)
RETURNS TABLE(rank bigint, total bigint, firstname text, lastname text, total_score bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  WITH player_grp AS (
    SELECT DISTINCT ON (p.hn) p.hn, p."GRPID" AS grpid
    FROM user_game_profile_data p
    ORDER BY p.hn, p.created_at DESC, p.id DESC
  ),
  viewer AS (
    SELECT COALESCE((SELECT g.grpid FROM player_grp g WHERE g.hn = p_hn), 'UNTAGGED') AS grpid
  ),
  scores AS (
    SELECT u.hn, u.firstname::text, u.lastname::text, SUM(gd.score)::bigint AS total_score
    FROM user_data u
    JOIN user_game_history h ON h.hn = u.hn
    JOIN user_game_data gd ON gd.id = h.user_game_data_id
    LEFT JOIN player_grp pg ON pg.hn = u.hn
    WHERE h."check-in" IS NOT TRUE
      AND h.user_game_data_id IS NOT NULL
      AND gd.score IS NOT NULL
      AND (
        (SELECT v.grpid FROM viewer v) = 'UNTAGGED'
        OR COALESCE(pg.grpid, 'UNTAGGED') = (SELECT v.grpid FROM viewer v)
      )
    GROUP BY u.hn, u.firstname, u.lastname
  ),
  ranked AS (
    SELECT hn, firstname, lastname, total_score,
           ROW_NUMBER() OVER (ORDER BY total_score DESC)::bigint AS rank,
           COUNT(*) OVER ()::bigint AS total
    FROM scores
  )
  SELECT rank, total, firstname, lastname, total_score FROM ranked WHERE hn = p_hn;
$function$;
