


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."aplicar_descuento"("p_pedido_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_total DECIMAL;
    v_cantidad_items INT;
    v_descuento DECIMAL := 0;
BEGIN
    SELECT p.total, COUNT(dp.id)
    INTO v_total, v_cantidad_items
    FROM pedidos p
    JOIN detalle_pedidos dp ON dp.pedido_id = p.id
    WHERE p.id = p_pedido_id
    GROUP BY p.total;
 
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido % no encontrado', p_pedido_id;
    END IF;
 
    -- Regla 1: más de 3 productos → 10%
    IF v_cantidad_items > 3 THEN
        v_descuento := v_total * 0.10;
    END IF;
 
    -- Regla 2: total mayor a 500 → 15% (sobreescribe regla 1)
    IF v_total > 500 THEN
        v_descuento := v_total * 0.15;
    END IF;
 
    -- Aplicar descuento
    UPDATE pedidos
    SET
        descuento = v_descuento,
        total = v_total - v_descuento,
        updated_at = NOW()
    WHERE id = p_pedido_id;
 
    RETURN v_descuento;
END;
$$;


ALTER FUNCTION "public"."aplicar_descuento"("p_pedido_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cancelar_pedido"("p_pedido_id" "uuid", "p_observacion" "text" DEFAULT 'Cancelado por el sistema'::"text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_estado_actual VARCHAR(30);
    v_item detalle_pedidos%ROWTYPE;
BEGIN
    -- Verificar estado actual
    SELECT estado INTO v_estado_actual
    FROM pedidos WHERE id = p_pedido_id;
 
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido % no encontrado', p_pedido_id;
    END IF;
 
    IF v_estado_actual IN ('entregado', 'cancelado') THEN
        RAISE EXCEPTION 'No se puede cancelar un pedido en estado %', v_estado_actual;
    END IF;
 
    -- Devolver stock solo si ya fue confirmado
    IF v_estado_actual = 'confirmado' OR v_estado_actual = 'enviado' THEN
        FOR v_item IN
            SELECT * FROM detalle_pedidos WHERE pedido_id = p_pedido_id
        LOOP
            UPDATE productos
            SET stock = stock + v_item.cantidad
            WHERE id = v_item.producto_id;
        END LOOP;
    END IF;
 
    -- Cancelar el pedido
    UPDATE pedidos
    SET estado = 'cancelado', updated_at = NOW()
    WHERE id = p_pedido_id;
 
END;
$$;


ALTER FUNCTION "public"."cancelar_pedido"("p_pedido_id" "uuid", "p_observacion" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."crear_pedido"("p_cliente_id" "uuid", "p_items_json" "jsonb", "p_descuento" numeric DEFAULT 0) RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_pedido_id UUID;
    v_item JSONB;
    v_producto productos%ROWTYPE;
    v_subtotal DECIMAL := 0;
    v_total DECIMAL := 0;
BEGIN
    -- Crear el pedido base
    INSERT INTO pedidos (cliente_id, estado, descuento)
    VALUES (p_cliente_id, 'pendiente', p_descuento)
    RETURNING id INTO v_pedido_id;
 
    -- Iterar sobre cada item del pedido
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items_json)
    LOOP
        -- Obtener producto y validar stock
        SELECT * INTO v_producto
        FROM productos
        WHERE id = (v_item->>'producto_id')::UUID;
 
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Producto % no encontrado', v_item->>'producto_id';
        END IF;
 
        IF v_producto.stock < (v_item->>'cantidad')::INT THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto %', v_producto.nombre;
        END IF;
 
        -- Insertar detalle
        INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES (
            v_pedido_id,
            v_producto.id,
            (v_item->>'cantidad')::INT,
            v_producto.precio
        );
 
        v_subtotal := v_subtotal + (v_producto.precio * (v_item->>'cantidad')::INT);
    END LOOP;
 
    -- Calcular total con descuento
    v_total := v_subtotal - p_descuento;
    IF v_total < 0 THEN v_total := 0; END IF;
 
    -- Actualizar total del pedido
    UPDATE pedidos SET total = v_total WHERE id = v_pedido_id;
 
    RETURN v_pedido_id;
 
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;


ALTER FUNCTION "public"."crear_pedido"("p_cliente_id" "uuid", "p_items_json" "jsonb", "p_descuento" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_actualizar_stock"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_item detalle_pedidos%ROWTYPE;
BEGIN
    -- Solo actúa cuando el estado cambia a 'confirmado'
    IF OLD.estado != 'confirmado' AND NEW.estado = 'confirmado' THEN
        FOR v_item IN
            SELECT * FROM detalle_pedidos WHERE pedido_id = NEW.id
        LOOP
            -- Validar stock antes de descontar
            IF (SELECT stock FROM productos WHERE id = v_item.producto_id) < v_item.cantidad THEN
                RAISE EXCEPTION 'Stock insuficiente para confirmar el pedido';
            END IF;
 
            UPDATE productos
            SET stock = stock - v_item.cantidad
            WHERE id = v_item.producto_id;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_actualizar_stock"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_auditoria_pedidos"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO auditoria_pedidos (
            pedido_id,
            estado_anterior,
            estado_nuevo,
            observacion
        ) VALUES (
            NEW.id,
            OLD.estado,
            NEW.estado,
            'Cambio automático registrado por el sistema'
        );
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_auditoria_pedidos"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_generar_factura"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_impuestos     DECIMAL;
    v_total_factura DECIMAL;
    v_numero        VARCHAR(50);
BEGIN
    -- Solo actúa cuando el estado cambia a 'confirmado'
    IF OLD.estado != 'confirmado' AND NEW.estado = 'confirmado' THEN
 
        -- Verificar que no exista ya una factura
        IF NOT EXISTS (SELECT 1 FROM facturas WHERE pedido_id = NEW.id) THEN
 
            v_impuestos     := NEW.total * 0.19;
            v_total_factura := NEW.total + v_impuestos;
            v_numero        := 'SWIFT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                               UPPER(SUBSTR(NEW.id::TEXT, 1, 8));
 
            INSERT INTO facturas (
                pedido_id,
                numero_factura,
                subtotal,
                impuestos,
                total
            ) VALUES (
                NEW.id,
                v_numero,
                NEW.total,
                v_impuestos,
                v_total_factura
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_generar_factura"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."auditoria_pedidos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "pedido_id" "uuid" NOT NULL,
    "estado_anterior" character varying(30),
    "estado_nuevo" character varying(30) NOT NULL,
    "fecha_cambio" timestamp without time zone DEFAULT "now"(),
    "observacion" "text"
);


ALTER TABLE "public"."auditoria_pedidos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categorias" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nombre" character varying(100) NOT NULL,
    "descripcion" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."categorias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clientes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nombre" character varying(150) NOT NULL,
    "email" character varying(150) NOT NULL,
    "telefono" character varying(20),
    "direccion" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."clientes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."detalle_pedidos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "pedido_id" "uuid" NOT NULL,
    "producto_id" "uuid" NOT NULL,
    "cantidad" integer NOT NULL,
    "precio_unitario" numeric(10,2) NOT NULL,
    "subtotal" numeric(10,2) GENERATED ALWAYS AS ((("cantidad")::numeric * "precio_unitario")) STORED,
    CONSTRAINT "detalle_pedidos_cantidad_check" CHECK (("cantidad" > 0)),
    CONSTRAINT "detalle_pedidos_precio_unitario_check" CHECK (("precio_unitario" > (0)::numeric))
);


ALTER TABLE "public"."detalle_pedidos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."envios" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "pedido_id" "uuid" NOT NULL,
    "estado" character varying(30) DEFAULT 'preparando'::character varying NOT NULL,
    "direccion_destino" "text" NOT NULL,
    "transportadora" character varying(100),
    "numero_guia" character varying(100),
    "fecha_envio" timestamp without time zone,
    "fecha_entrega" timestamp without time zone,
    CONSTRAINT "envios_estado_check" CHECK ((("estado")::"text" = ANY ((ARRAY['preparando'::character varying, 'en_camino'::character varying, 'entregado'::character varying, 'devuelto'::character varying])::"text"[])))
);


ALTER TABLE "public"."envios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."facturas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "pedido_id" "uuid" NOT NULL,
    "numero_factura" character varying(50) NOT NULL,
    "subtotal" numeric(10,2) NOT NULL,
    "impuestos" numeric(10,2) DEFAULT 0 NOT NULL,
    "total" numeric(10,2) NOT NULL,
    "fecha_emision" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "facturas_impuestos_check" CHECK (("impuestos" >= (0)::numeric)),
    CONSTRAINT "facturas_subtotal_check" CHECK (("subtotal" >= (0)::numeric)),
    CONSTRAINT "facturas_total_check" CHECK (("total" >= (0)::numeric))
);


ALTER TABLE "public"."facturas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pedidos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "estado" character varying(30) DEFAULT 'pendiente'::character varying NOT NULL,
    "total" numeric(10,2) DEFAULT 0 NOT NULL,
    "descuento" numeric(10,2) DEFAULT 0 NOT NULL,
    "fecha_pedido" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "pedidos_descuento_check" CHECK (("descuento" >= (0)::numeric)),
    CONSTRAINT "pedidos_estado_check" CHECK ((("estado")::"text" = ANY ((ARRAY['pendiente'::character varying, 'confirmado'::character varying, 'enviado'::character varying, 'entregado'::character varying, 'cancelado'::character varying])::"text"[]))),
    CONSTRAINT "pedidos_total_check" CHECK (("total" >= (0)::numeric))
);


ALTER TABLE "public"."pedidos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."productos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "categoria_id" "uuid" NOT NULL,
    "nombre" character varying(150) NOT NULL,
    "tipo" character varying(50) NOT NULL,
    "precio" numeric(10,2) NOT NULL,
    "stock" integer DEFAULT 0 NOT NULL,
    "descripcion" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "productos_precio_check" CHECK (("precio" > (0)::numeric)),
    CONSTRAINT "productos_stock_check" CHECK (("stock" >= 0)),
    CONSTRAINT "productos_tipo_check" CHECK ((("tipo")::"text" = ANY ((ARRAY['laptop'::character varying, 'celular'::character varying, 'accesorio'::character varying, 'componente'::character varying])::"text"[])))
);


ALTER TABLE "public"."productos" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vista_inventario" AS
 SELECT "pr"."id",
    "pr"."nombre" AS "producto",
    "pr"."tipo",
    "cat"."nombre" AS "categoria",
    "pr"."precio",
    "pr"."stock",
        CASE
            WHEN ("pr"."stock" = 0) THEN 'agotado'::"text"
            WHEN ("pr"."stock" <= 5) THEN 'stock bajo'::"text"
            ELSE 'disponible'::"text"
        END AS "estado_stock"
   FROM ("public"."productos" "pr"
     JOIN "public"."categorias" "cat" ON (("cat"."id" = "pr"."categoria_id")))
  ORDER BY "pr"."stock";


ALTER VIEW "public"."vista_inventario" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vista_pedidos_completos" AS
 SELECT "p"."id" AS "pedido_id",
    "p"."fecha_pedido",
    "p"."estado",
    "p"."total",
    "p"."descuento",
    "c"."id" AS "cliente_id",
    "c"."nombre" AS "cliente_nombre",
    "c"."email" AS "cliente_email",
    "count"("dp"."id") AS "cantidad_productos",
    COALESCE("f"."numero_factura", 'Sin factura'::character varying) AS "numero_factura",
    COALESCE("e"."estado", 'Sin envío'::character varying) AS "estado_envio"
   FROM (((("public"."pedidos" "p"
     JOIN "public"."clientes" "c" ON (("c"."id" = "p"."cliente_id")))
     LEFT JOIN "public"."detalle_pedidos" "dp" ON (("dp"."pedido_id" = "p"."id")))
     LEFT JOIN "public"."facturas" "f" ON (("f"."pedido_id" = "p"."id")))
     LEFT JOIN "public"."envios" "e" ON (("e"."pedido_id" = "p"."id")))
  GROUP BY "p"."id", "p"."fecha_pedido", "p"."estado", "p"."total", "p"."descuento", "c"."id", "c"."nombre", "c"."email", "f"."numero_factura", "e"."estado";


ALTER VIEW "public"."vista_pedidos_completos" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vista_resumen_ventas" AS
 SELECT "cat"."nombre" AS "categoria",
    "count"(DISTINCT "p"."id") AS "total_pedidos",
    "sum"("dp"."cantidad") AS "unidades_vendidas",
    "sum"("dp"."subtotal") AS "ingresos_totales",
    "round"("avg"("dp"."precio_unitario"), 2) AS "precio_promedio"
   FROM ((("public"."detalle_pedidos" "dp"
     JOIN "public"."productos" "pr" ON (("pr"."id" = "dp"."producto_id")))
     JOIN "public"."categorias" "cat" ON (("cat"."id" = "pr"."categoria_id")))
     JOIN "public"."pedidos" "p" ON (("p"."id" = "dp"."pedido_id")))
  WHERE (("p"."estado")::"text" <> ALL ((ARRAY['cancelado'::character varying, 'pendiente'::character varying])::"text"[]))
  GROUP BY "cat"."nombre"
  ORDER BY ("sum"("dp"."subtotal")) DESC;


ALTER VIEW "public"."vista_resumen_ventas" OWNER TO "postgres";


ALTER TABLE ONLY "public"."auditoria_pedidos"
    ADD CONSTRAINT "auditoria_pedidos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categorias"
    ADD CONSTRAINT "categorias_nombre_key" UNIQUE ("nombre");



ALTER TABLE ONLY "public"."categorias"
    ADD CONSTRAINT "categorias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."detalle_pedidos"
    ADD CONSTRAINT "detalle_pedidos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."envios"
    ADD CONSTRAINT "envios_pedido_id_key" UNIQUE ("pedido_id");



ALTER TABLE ONLY "public"."envios"
    ADD CONSTRAINT "envios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."facturas"
    ADD CONSTRAINT "facturas_numero_factura_key" UNIQUE ("numero_factura");



ALTER TABLE ONLY "public"."facturas"
    ADD CONSTRAINT "facturas_pedido_id_key" UNIQUE ("pedido_id");



ALTER TABLE ONLY "public"."facturas"
    ADD CONSTRAINT "facturas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pedidos"
    ADD CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."productos"
    ADD CONSTRAINT "productos_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "trigger_actualizar_stock" AFTER UPDATE ON "public"."pedidos" FOR EACH ROW EXECUTE FUNCTION "public"."fn_actualizar_stock"();



CREATE OR REPLACE TRIGGER "trigger_auditoria_pedidos" AFTER UPDATE ON "public"."pedidos" FOR EACH ROW EXECUTE FUNCTION "public"."fn_auditoria_pedidos"();



CREATE OR REPLACE TRIGGER "trigger_generar_factura" AFTER UPDATE ON "public"."pedidos" FOR EACH ROW EXECUTE FUNCTION "public"."fn_generar_factura"();



ALTER TABLE ONLY "public"."auditoria_pedidos"
    ADD CONSTRAINT "auditoria_pedidos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."detalle_pedidos"
    ADD CONSTRAINT "detalle_pedidos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."detalle_pedidos"
    ADD CONSTRAINT "detalle_pedidos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."envios"
    ADD CONSTRAINT "envios_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."facturas"
    ADD CONSTRAINT "facturas_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."pedidos"
    ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."productos"
    ADD CONSTRAINT "productos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE RESTRICT;



ALTER TABLE "public"."auditoria_pedidos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categorias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clientes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."detalle_pedidos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."envios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."facturas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pedidos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."productos" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."aplicar_descuento"("p_pedido_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."aplicar_descuento"("p_pedido_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."aplicar_descuento"("p_pedido_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cancelar_pedido"("p_pedido_id" "uuid", "p_observacion" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cancelar_pedido"("p_pedido_id" "uuid", "p_observacion" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cancelar_pedido"("p_pedido_id" "uuid", "p_observacion" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."crear_pedido"("p_cliente_id" "uuid", "p_items_json" "jsonb", "p_descuento" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."crear_pedido"("p_cliente_id" "uuid", "p_items_json" "jsonb", "p_descuento" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."crear_pedido"("p_cliente_id" "uuid", "p_items_json" "jsonb", "p_descuento" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_actualizar_stock"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_actualizar_stock"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_actualizar_stock"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_auditoria_pedidos"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_auditoria_pedidos"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_auditoria_pedidos"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_generar_factura"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_generar_factura"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_generar_factura"() TO "service_role";


















GRANT ALL ON TABLE "public"."auditoria_pedidos" TO "anon";
GRANT ALL ON TABLE "public"."auditoria_pedidos" TO "authenticated";
GRANT ALL ON TABLE "public"."auditoria_pedidos" TO "service_role";



GRANT ALL ON TABLE "public"."categorias" TO "anon";
GRANT ALL ON TABLE "public"."categorias" TO "authenticated";
GRANT ALL ON TABLE "public"."categorias" TO "service_role";



GRANT ALL ON TABLE "public"."clientes" TO "anon";
GRANT ALL ON TABLE "public"."clientes" TO "authenticated";
GRANT ALL ON TABLE "public"."clientes" TO "service_role";



GRANT ALL ON TABLE "public"."detalle_pedidos" TO "anon";
GRANT ALL ON TABLE "public"."detalle_pedidos" TO "authenticated";
GRANT ALL ON TABLE "public"."detalle_pedidos" TO "service_role";



GRANT ALL ON TABLE "public"."envios" TO "anon";
GRANT ALL ON TABLE "public"."envios" TO "authenticated";
GRANT ALL ON TABLE "public"."envios" TO "service_role";



GRANT ALL ON TABLE "public"."facturas" TO "anon";
GRANT ALL ON TABLE "public"."facturas" TO "authenticated";
GRANT ALL ON TABLE "public"."facturas" TO "service_role";



GRANT ALL ON TABLE "public"."pedidos" TO "anon";
GRANT ALL ON TABLE "public"."pedidos" TO "authenticated";
GRANT ALL ON TABLE "public"."pedidos" TO "service_role";



GRANT ALL ON TABLE "public"."productos" TO "anon";
GRANT ALL ON TABLE "public"."productos" TO "authenticated";
GRANT ALL ON TABLE "public"."productos" TO "service_role";



GRANT ALL ON TABLE "public"."vista_inventario" TO "anon";
GRANT ALL ON TABLE "public"."vista_inventario" TO "authenticated";
GRANT ALL ON TABLE "public"."vista_inventario" TO "service_role";



GRANT ALL ON TABLE "public"."vista_pedidos_completos" TO "anon";
GRANT ALL ON TABLE "public"."vista_pedidos_completos" TO "authenticated";
GRANT ALL ON TABLE "public"."vista_pedidos_completos" TO "service_role";



GRANT ALL ON TABLE "public"."vista_resumen_ventas" TO "anon";
GRANT ALL ON TABLE "public"."vista_resumen_ventas" TO "authenticated";
GRANT ALL ON TABLE "public"."vista_resumen_ventas" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































