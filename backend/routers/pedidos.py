from fastapi import APIRouter
from services.pedido_service import PedidoService
from services.factura_service import FacturaService
from schemas import PedidoCreate, PedidoRead, DetallePedidoRead, FacturaRead, CancelarPedidoRequest

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])
service = PedidoService()
factura_service = FacturaService()


@router.get("/", response_model=list)
def listar_pedidos():
    return service.obtener_todos()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: str):
    return service.obtener_por_id(pedido_id)


@router.get("/{pedido_id}/detalles", response_model=list[DetallePedidoRead])
def obtener_detalles(pedido_id: str):
    return service.obtener_detalles(pedido_id)


@router.get("/{pedido_id}/factura", response_model=FacturaRead)
def obtener_factura(pedido_id: str):
    return factura_service.obtener_por_pedido(pedido_id)


@router.post("/", response_model=PedidoRead, status_code=201)
def crear_pedido(datos: PedidoCreate):
    return service.crear(datos)


@router.patch("/{pedido_id}/confirmar", response_model=PedidoRead)
def confirmar_pedido(pedido_id: str):
    return service.confirmar(pedido_id)


@router.patch("/{pedido_id}/enviado", response_model=PedidoRead)
def marcar_enviado(pedido_id: str):
    return service.marcar_enviado(pedido_id)


@router.patch("/{pedido_id}/entregado", response_model=PedidoRead)
def marcar_entregado(pedido_id: str):
    return service.marcar_entregado(pedido_id)


@router.patch("/{pedido_id}/cancelar", status_code=204)
def cancelar_pedido(pedido_id: str, datos: CancelarPedidoRequest = CancelarPedidoRequest()):
    service.cancelar(pedido_id, datos.observacion)
