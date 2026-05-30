from database.supabase_client import supabase


class ReporteRepo:

    def pedidos_completos(self) -> list:
        respuesta = supabase.table("vista_pedidos_completos").select("*").execute()
        return respuesta.data

    def inventario(self) -> list:
        respuesta = supabase.table("vista_inventario").select("*").execute()
        return respuesta.data

    def resumen_ventas(self) -> list:
        respuesta = supabase.table("vista_resumen_ventas").select("*").execute()
        return respuesta.data
