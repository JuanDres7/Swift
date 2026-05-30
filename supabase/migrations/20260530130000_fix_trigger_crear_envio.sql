-- Corrige trigger_crear_envio para incluir direccion_destino (campo NOT NULL en envios).
-- Toma la dirección del cliente asociado al pedido.

create or replace function crear_envio_al_confirmar()
returns trigger as $$
declare
    v_direccion text;
begin
    if new.estado = 'confirmado' and old.estado != 'confirmado' then
        if not exists (select 1 from envios where pedido_id = new.id) then

            select coalesce(direccion, 'Sin dirección registrada')
            into v_direccion
            from clientes
            where id = new.cliente_id;

            insert into envios (pedido_id, estado, direccion_destino)
            values (new.id, 'preparando', v_direccion);

        end if;
    end if;

    return new;
end;
$$ language plpgsql;
