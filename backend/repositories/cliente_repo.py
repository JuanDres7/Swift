from database.supabase_client import supabase


class ClienteRepo:

    def obtener_todos(self) -> list:
        respuesta = supabase.table("clientes").select("*").execute()
        return respuesta.data

    def obtener_por_id(self, cliente_id: str) -> dict | None:
        respuesta = (
            supabase.table("clientes")
            .select("*")
            .eq("id", cliente_id)
            .single()
            .execute()
        )
        return respuesta.data

    def crear(self, datos: dict) -> dict:
        respuesta = supabase.table("clientes").insert(datos).execute()
        return respuesta.data[0]

    def actualizar(self, cliente_id: str, datos: dict) -> dict:
        respuesta = (
            supabase.table("clientes")
            .update(datos)
            .eq("id", cliente_id)
            .execute()
        )
        return respuesta.data[0]

    def eliminar(self, cliente_id: str) -> None:
        supabase.table("clientes").delete().eq("id", cliente_id).execute()
