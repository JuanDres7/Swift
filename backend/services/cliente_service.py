from fastapi import HTTPException
from repositories.cliente_repo import ClienteRepo
from schemas import ClienteCreate, ClienteUpdate


class ClienteService:

    def __init__(self):
        self.repo = ClienteRepo()

    def obtener_todos(self) -> list:
        return self.repo.obtener_todos()

    def obtener_por_id(self, cliente_id: str) -> dict:
        cliente = self.repo.obtener_por_id(cliente_id)
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        return cliente

    def crear(self, datos: ClienteCreate) -> dict:
        return self.repo.crear(datos.model_dump())

    def actualizar(self, cliente_id: str, datos: ClienteUpdate) -> dict:
        self.obtener_por_id(cliente_id)
        campos = datos.model_dump(exclude_none=True)
        return self.repo.actualizar(cliente_id, campos)

    def eliminar(self, cliente_id: str) -> None:
        self.obtener_por_id(cliente_id)
        self.repo.eliminar(cliente_id)
