-- Corrige el tipo del parámetro p_pedido_id de integer a uuid,
-- para que coincida con el tipo real de pedidos.id.

create or replace function actualizar_estado_pedido(
    p_pedido_id uuid,
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
