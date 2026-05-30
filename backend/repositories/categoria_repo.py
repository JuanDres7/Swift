from database.supabase_client import supabase


class CategoriaRepo:

    def obtener_todos(self) -> list:
        respuesta = supabase.table("categorias").select("*").execute()
        return respuesta.data

    def obtener_por_id(self, categoria_id: str) -> dict | None:
        respuesta = (
            supabase.table("categorias")
            .select("*")
            .eq("id", categoria_id)
            .single()
            .execute()
        )
        return respuesta.data

    def crear(self, datos: dict) -> dict:
        respuesta = supabase.table("categorias").insert(datos).execute()
        return respuesta.data[0]

    def actualizar(self, categoria_id: str, datos: dict) -> dict:
        respuesta = (
            supabase.table("categorias")
            .update(datos)
            .eq("id", categoria_id)
            .execute()
        )
        return respuesta.data[0]

    def eliminar(self, categoria_id: str) -> None:
        supabase.table("categorias").delete().eq("id", categoria_id).execute()
