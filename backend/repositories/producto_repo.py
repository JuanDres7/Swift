from database.supabase_client import supabase


class ProductoRepo:

    def obtener_todos(self) -> list:
        respuesta = supabase.table("productos").select("*").execute()
        return respuesta.data

    def obtener_por_id(self, producto_id: str) -> dict | None:
        respuesta = (
            supabase.table("productos")
            .select("*")
            .eq("id", producto_id)
            .single()
            .execute()
        )
        return respuesta.data

    def obtener_inventario(self) -> list:
        respuesta = supabase.table("vista_inventario").select("*").execute()
        return respuesta.data

    def crear(self, datos: dict) -> dict:
        respuesta = supabase.table("productos").insert(datos).execute()
        return respuesta.data[0]

    def actualizar(self, producto_id: str, datos: dict) -> dict:
        respuesta = (
            supabase.table("productos")
            .update(datos)
            .eq("id", producto_id)
            .execute()
        )
        return respuesta.data[0]

    def eliminar(self, producto_id: str) -> None:
        supabase.table("productos").delete().eq("id", producto_id).execute()
