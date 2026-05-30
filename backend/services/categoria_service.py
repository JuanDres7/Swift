from fastapi import HTTPException
from repositories.categoria_repo import CategoriaRepo
from schemas import CategoriaCreate, CategoriaUpdate


class CategoriaService:

    def __init__(self):
        self.repo = CategoriaRepo()

    def obtener_todos(self) -> list:
        return self.repo.obtener_todos()

    def obtener_por_id(self, categoria_id: str) -> dict:
        categoria = self.repo.obtener_por_id(categoria_id)
        if not categoria:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        return categoria

    def crear(self, datos: CategoriaCreate) -> dict:
        return self.repo.crear(datos.model_dump())

    def actualizar(self, categoria_id: str, datos: CategoriaUpdate) -> dict:
        self.obtener_por_id(categoria_id)
        campos = datos.model_dump(exclude_none=True)
        return self.repo.actualizar(categoria_id, campos)

    def eliminar(self, categoria_id: str) -> None:
        self.obtener_por_id(categoria_id)
        self.repo.eliminar(categoria_id)
