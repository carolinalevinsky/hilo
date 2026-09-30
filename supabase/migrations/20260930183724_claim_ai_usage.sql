-- Contar y anotar el uso de IA en un solo paso.
--
-- La cuota se revisaba en dos tiempos: `assertQuota` contaba las filas del mes
-- y, si quedaba lugar, `recordUsage` insertaba una. Entre las dos hay un hueco:
-- con una unidad disponible, diez pedidos al mismo tiempo cuentan los diez
-- "queda una" y los diez insertan. La cuota es el techo de lo que se gasta en
-- el modelo más caro; un techo que se pasa mandando pedidos en paralelo no es
-- un techo.
--
-- Esta función cuenta e inserta adentro de la misma transacción, con un
-- candado por profesional y tipo de uso. El segundo pedido espera a que el
-- primero termine y cuenta con su fila ya adentro.
--
-- La llama `src/server/ai-usage.ts` con la llave de servicio — la tabla no deja
-- insertar desde una sesión, ver `20260908090000_ai_usage.sql` — así que nadie
-- más la puede ejecutar.

create or replace function public.claim_ai_usage(
  p_practitioner uuid,
  p_kind         text,
  p_limit        integer,
  p_since        timestamptz
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  used integer;
  claimed uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_practitioner::text || ':' || p_kind, 0));

  select count(*) into used
  from public.ai_usage
  where practitioner_id = p_practitioner
    and kind = p_kind
    and created_at >= p_since;

  if used >= p_limit then
    return null;
  end if;

  insert into public.ai_usage (practitioner_id, kind)
  values (p_practitioner, p_kind)
  returning id into claimed;

  return claimed;
end;
$$;

revoke execute on function public.claim_ai_usage(uuid, text, integer, timestamptz)
  from public, anon, authenticated;
grant execute on function public.claim_ai_usage(uuid, text, integer, timestamptz)
  to service_role;
