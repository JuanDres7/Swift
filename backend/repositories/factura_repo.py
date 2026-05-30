from database.supabase_client import supabase


class FacturaRepo:

    def obtener_por_pedido(self, pedido_id: str) -> dict | None:
        respuesta = (
            supabase.table("facturas")
            .select("*")
            .eq("pedido_id", pedido_id)
            .single()
            .execute()
        )
        return respuesta.data
