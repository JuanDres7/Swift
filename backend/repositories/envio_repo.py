from database.supabase_client import supabase


class EnvioRepo:

    def obtener_por_pedido(self, pedido_id: str) -> dict | None:
        respuesta = (
            supabase.table("envios")
            .select("*")
            .eq("pedido_id", pedido_id)
            .single()
            .execute()
        )
        return respuesta.data

    def actualizar(self, envio_id: str, datos: dict) -> dict:
        respuesta = (
            supabase.table("envios")
            .update(datos)
            .eq("id", envio_id)
            .execute()
        )
        return respuesta.data[0]
