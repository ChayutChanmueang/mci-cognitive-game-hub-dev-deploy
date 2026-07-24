alter table public.game_tree_list enable row level security;

grant select on table public.game_tree_list to authenticated;

drop policy if exists "Authenticated users can read game tree catalog"
on public.game_tree_list;

create policy "Authenticated users can read game tree catalog"
on public.game_tree_list
for select
to authenticated
using (true);
