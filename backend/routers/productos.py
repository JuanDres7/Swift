from fastapi import APIRouter
from services.producto_service import ProductoService
from schemas import ProductoCreate, ProductoRead, ProductoUpdate

router = APIRouter(prefix="/productos", tags=["Productos"])
service = ProductoService()


@router.get("/", response_model=list[ProductoRead])
def listar_productos():
    return service.obtener_todos()


@router.get("/inventario", response_model=list)
def obtener_inventario():
    return service.obtener_inventario()


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: str):
    return service.obtener_por_id(producto_id)


@router.post("/", response_model=ProductoRead, status_code=201)
def crear_producto(datos: ProductoCreate):
    return service.crear(datos)


@router.patch("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(producto_id: str, datos: ProductoUpdate):
    return service.actualizar(producto_id, datos)


@router.delete("/{producto_id}", status_code=204)
def eliminar_producto(producto_id: str):
    service.eliminar(producto_id)
