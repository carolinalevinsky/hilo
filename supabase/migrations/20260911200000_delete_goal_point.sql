-- Borrar un avance cargado por error (P17).
--
-- El QA de Thomas: "no se puede corregir un error — no hay forma de borrar un
-- registro de progreso". Carolina decidió que se pueda, con confirmación.
--
-- No alcanza con un `delete` desde la aplicación, por el trigger de M3
-- (`goals_record_progress`): la serie de avance la escribe la base cada vez que
-- cambia `goals.progress`, un punto por día. Si el punto que se borra era el
-- último, el objetivo tiene que volver al valor anterior —si no, la lista dice
-- 40 % y el gráfico termina en 35 %— y ese `update` dispara el trigger, que
-- vuelve a escribir un punto para hoy con el valor corregido. Borrar el error de
-- hoy dejaba un punto de hoy.
--
-- ─── Cómo ─────────────────────────────────────────────────────────────────
--
-- Una función `delete_goal_point` que hace las dos cosas en una transacción, y
-- una marca local a esa transacción (`hilo.goal_point_correction`) que el
-- trigger mira para no escribir mientras dura la corrección. `set_config(…,
-- true)` la limita a la transacción: no hay forma de que quede prendida para la
-- escritura siguiente.
--
-- `security invoker`, igual que el trigger: la función corre con la sesión de
-- quien la llama, así que RLS decide qué punto y qué objetivo puede tocar. Para
-- un punto ajeno el `select` no encuentra nada y la función no hace nada.
--
-- Borrar un punto que no es el último no toca `goals.progress`: el valor actual
-- sigue siendo el de la última medición.

create or replace function public.record_goal_progress()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.progress is not distinct from old.progress then
    return new;
  end if;

  -- Una corrección desde `delete_goal_point`: el valor vuelve al de una
  -- medición que ya está en la serie, así que no hay nada nuevo que anotar.
  if current_setting('hilo.goal_point_correction', true) = 'on' then
    return new;
  end if;

  insert into public.goal_progress (practitioner_id, patient_id, goal_id, value)
  values (new.practitioner_id, new.patient_id, new.id, new.progress)
  on conflict (goal_id, recorded_on) do update set value = excluded.value;

  return new;
end;
$$;

create or replace function public.delete_goal_point(point_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target public.goal_progress;
  previous_value integer;
begin
  select * into target from public.goal_progress where id = point_id;
  if not found then
    return;
  end if;

  delete from public.goal_progress where id = point_id;

  -- Sólo si era la última medición del objetivo.
  if not exists (
    select 1 from public.goal_progress
    where goal_id = target.goal_id and recorded_on > target.recorded_on
  ) then
    select value into previous_value
    from public.goal_progress
    where goal_id = target.goal_id
    order by recorded_on desc
    limit 1;

    perform set_config('hilo.goal_point_correction', 'on', true);
    update public.goals
      set progress = coalesce(previous_value, 0)
      where id = target.goal_id;
    perform set_config('hilo.goal_point_correction', 'off', true);
  end if;
end;
$$;

revoke execute on function public.delete_goal_point(uuid) from public, anon;
grant execute on function public.delete_goal_point(uuid) to authenticated;
