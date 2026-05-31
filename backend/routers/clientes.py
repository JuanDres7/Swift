from fastapi import APIRouter
from services.cliente_service import ClienteService
from schemas import ClienteCreate, ClienteRead, ClienteUpdate

router = APIRouter(prefix="/clientes", tags=["Clientes"])
service = ClienteService()


@router.get("/", response_model=list[ClienteRead])
def listar_clientes():
    return service.obtener_todos()


@router.get("/{cliente_id}", response_model=ClienteRead)
def obtener_cliente(cliente_id: str):
    return service.obtener_por_id(cliente_id)


@router.post("/", response_model=ClienteRead, status_code=201)
def crear_cliente(datos: ClienteCreate):
    return service.crear(datos)


@router.patch("/{cliente_id}", response_model=ClienteRead)
def actualizar_cliente(cliente_id: str, datos: ClienteUpdate):
    return service.actualizar(cliente_id, datos)


@router.delete("/{cliente_id}", status_code=204)
def eliminar_cliente(cliente_id: str):
    service.eliminar(cliente_id)
