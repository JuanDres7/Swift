from database.supabase_client import supabase


class PedidoRepo:

    def obtener_todos(self) -> list:
        respuesta = supabase.table("vista_pedidos_completos").select("*").execute()
        return respuesta.data

    def obtener_por_id(self, pedido_id: str) -> dict | None:
        respuesta = (
            supabase.table("pedidos")
            .select("*")
            .eq("id", pedido_id)
            .single()
            .execute()
        )
        return respuesta.data

    def obtener_detalles(self, pedido_id: str) -> list:
        respuesta = (
            supabase.table("detalle_pedidos")
            .select("*")
            .eq("pedido_id", pedido_id)
            .execute()
        )
        return respuesta.data

    def crear(self, cliente_id: str, items: list[dict], descuento: float = 0) -> str:
        respuesta = supabase.rpc("crear_pedido", {
            "p_cliente_id": cliente_id,
            "p_items_json": items,
            "p_descuento": descuento,
        }).execute()
        return respuesta.data

    def actualizar_estado(self, pedido_id: str, nuevo_estado: str) -> dict:
        respuesta = supabase.rpc("actualizar_estado_pedido", {
            "p_pedido_id": pedido_id,
            "p_nuevo_estado": nuevo_estado,
        }).execute()
        return respuesta.data

    def cancelar(self, pedido_id: str, observacion: str = "Cancelado por el usuario") -> None:
        supabase.rpc("cancelar_pedido", {
            "p_pedido_id": pedido_id,
            "p_observacion": observacion,
        }).execute()

    def aplicar_descuento(self, pedido_id: str) -> float:
        respuesta = supabase.rpc("aplicar_descuento", {
            "p_pedido_id": pedido_id,
        }).execute()
        return respuesta.data
