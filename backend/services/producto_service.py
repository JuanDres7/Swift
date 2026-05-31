from fastapi import HTTPException
from repositories.producto_repo import ProductoRepo
from schemas import ProductoCreate, ProductoUpdate


class ProductoService:

    def __init__(self):
        self.repo = ProductoRepo()

    def obtener_todos(self) -> list:
        return self.repo.obtener_todos()

    def obtener_por_id(self, producto_id: str) -> dict:
        producto = self.repo.obtener_por_id(producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return producto

    def obtener_inventario(self) -> list:
        return self.repo.obtener_inventario()

    def crear(self, datos: ProductoCreate) -> dict:
        return self.repo.crear(datos.model_dump())

    def actualizar(self, producto_id: str, datos: ProductoUpdate) -> dict:
        self.obtener_por_id(producto_id)
        campos = datos.model_dump(exclude_none=True)
        return self.repo.actualizar(producto_id, campos)

    def eliminar(self, producto_id: str) -> None:
        self.obtener_por_id(producto_id)
        self.repo.eliminar(producto_id)
