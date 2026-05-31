from fastapi import APIRouter
from services.categoria_service import CategoriaService
from schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate

router = APIRouter(prefix="/categorias", tags=["Categorías"])
service = CategoriaService()


@router.get("/", response_model=list[CategoriaRead])
def listar_categorias():
    return service.obtener_todos()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: str):
    return service.obtener_por_id(categoria_id)


@router.post("/", response_model=CategoriaRead, status_code=201)
def crear_categoria(datos: CategoriaCreate):
    return service.crear(datos)


@router.patch("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(categoria_id: str, datos: CategoriaUpdate):
    return service.actualizar(categoria_id, datos)


@router.delete("/{categoria_id}", status_code=204)
def eliminar_categoria(categoria_id: str):
    service.eliminar(categoria_id)
