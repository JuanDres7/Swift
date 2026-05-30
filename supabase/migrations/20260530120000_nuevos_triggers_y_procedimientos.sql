-- ── Función y trigger: validar transiciones de estado en pedidos ──────────────
-- Impide cambios de estado inválidos a nivel BD (ej: pendiente → entregado).

create or replace function validar_transicion_estado()
returns trigger as $$
begin
    if old.estado = 'pendiente' and new.estado not in ('confirmado', 'cancelado') then
        raise exception 'Transición inválida: pendiente → %', new.estado;
    elsif old.estado = 'confirmado' and new.estado not in ('enviado', 'cancelado') then
        raise exception 'Transición inválida: confirmado → %', new.estado;
    elsif old.estado = 'enviado' and new.estado != 'entregado' then
        raise exception 'Transición inválida: enviado → %', new.estado;
    elsif old.estado in ('entregado', 'cancelado') then
        raise exception 'No se puede modificar un pedido en estado %', old.estado;
    end if;

    return new;
end;
$$ language plpgsql;

create trigger trigger_validar_transicion_estado
    before update on pedidos
    for each row
    when (old.estado is distinct from new.estado)
    execute function validar_transicion_estado();


-- ── Función y trigger: crear envío al confirmar pedido ────────────────────────
-- Inserta automáticamente un registro en envios cuando el pedido se confirma.

create or replace function crear_envio_al_confirmar()
returns trigger as $$
begin
    if new.estado = 'confirmado' and old.estado != 'confirmado' then
        if not exists (select 1 from envios where pedido_id = new.id) then
            insert into envios (pedido_id, estado)
            values (new.id, 'preparando');
        end if;
    end if;

    return new;
end;
$$ language plpgsql;

create trigger trigger_crear_envio
    after update on pedidos
    for each row
    execute function crear_envio_al_confirmar();


-- ── Función y trigger: proteger eliminación de clientes con pedidos ───────────
-- Devuelve un error claro si se intenta eliminar un cliente con pedidos activos.

create or replace function validar_eliminar_cliente()
returns trigger as $$
begin
    if exists (select 1 from pedidos where cliente_id = old.id) then
        raise exception 'No se puede eliminar el cliente % porque tiene pedidos asociados', old.id;
    end if;

    return old;
end;
$$ language plpgsql;

create trigger trigger_no_eliminar_cliente_con_pedidos
    before delete on clientes
    for each row
    execute function validar_eliminar_cliente();


-- ── Función y trigger: proteger eliminación de categorías con productos ───────
-- Devuelve un error claro si se intenta eliminar una categoría con productos.

create or replace function validar_eliminar_categoria()
returns trigger as $$
begin
    if exists (select 1 from productos where categoria_id = old.id) then
        raise exception 'No se puede eliminar la categoría % porque tiene productos asociados', old.id;
    end if;

    return old;
end;
$$ language plpgsql;

create trigger trigger_no_eliminar_categoria_con_productos
    before delete on categorias
    for each row
    execute function validar_eliminar_categoria();


-- ── Procedimiento almacenado: actualizar estado de pedido ─────────────────────
-- Cambia el estado de un pedido. Para cancelar usar cancelar_pedido().
-- El trigger_validar_transicion_estado valida automáticamente la transición.

create or replace function actualizar_estado_pedido(
    p_pedido_id integer,
    p_nuevo_estado text
)
returns json as $$
declare
    v_resultado json;
begin
    if p_nuevo_estado = 'cancelado' then
        raise exception 'Para cancelar un pedido usa el procedimiento cancelar_pedido()';
    end if;

    update pedidos
    set estado = p_nuevo_estado
    where id = p_pedido_id
    returning row_to_json(pedidos.*) into v_resultado;

    if v_resultado is null then
        raise exception 'Pedido % no encontrado', p_pedido_id;
    end if;

    return v_resultado;
end;
$$ language plpgsql;
