drop extension if exists "pg_net";

alter table "public"."envios" drop constraint "envios_estado_check";

alter table "public"."pedidos" drop constraint "pedidos_estado_check";

alter table "public"."productos" drop constraint "productos_tipo_check";

alter table "public"."envios" add constraint "envios_estado_check" CHECK (((estado)::text = ANY ((ARRAY['preparando'::character varying, 'en_camino'::character varying, 'entregado'::character varying, 'devuelto'::character varying])::text[]))) not valid;

alter table "public"."envios" validate constraint "envios_estado_check";

alter table "public"."pedidos" add constraint "pedidos_estado_check" CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'confirmado'::character varying, 'enviado'::character varying, 'entregado'::character varying, 'cancelado'::character varying])::text[]))) not valid;

alter table "public"."pedidos" validate constraint "pedidos_estado_check";

alter table "public"."productos" add constraint "productos_tipo_check" CHECK (((tipo)::text = ANY ((ARRAY['laptop'::character varying, 'celular'::character varying, 'accesorio'::character varying, 'componente'::character varying])::text[]))) not valid;

alter table "public"."productos" validate constraint "productos_tipo_check";

create or replace view "public"."vista_resumen_ventas" as  SELECT cat.nombre AS categoria,
    count(DISTINCT p.id) AS total_pedidos,
    sum(dp.cantidad) AS unidades_vendidas,
    sum(dp.subtotal) AS ingresos_totales,
    round(avg(dp.precio_unitario), 2) AS precio_promedio
   FROM (((public.detalle_pedidos dp
     JOIN public.productos pr ON ((pr.id = dp.producto_id)))
     JOIN public.categorias cat ON ((cat.id = pr.categoria_id)))
     JOIN public.pedidos p ON ((p.id = dp.pedido_id)))
  WHERE ((p.estado)::text <> ALL ((ARRAY['cancelado'::character varying, 'pendiente'::character varying])::text[]))
  GROUP BY cat.nombre
  ORDER BY (sum(dp.subtotal)) DESC;



