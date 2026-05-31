from fastapi import APIRouter
from services.envio_service import EnvioService
from schemas import EnvioRead, EnvioUpdate

router = APIRouter(prefix="/envios", tags=["Envíos"])
service = EnvioService()


@router.get("/pedido/{pedido_id}", response_model=EnvioRead)
def obtener_envio(pedido_id: str):
    return service.obtener_por_pedido(pedido_id)


@router.patch("/{envio_id}", response_model=EnvioRead)
def actualizar_envio(envio_id: str, datos: EnvioUpdate):
    return service.actualizar(envio_id, datos)
