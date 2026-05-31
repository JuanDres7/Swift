from fastapi import HTTPException
from repositories.envio_repo import EnvioRepo
from schemas import EnvioUpdate


class EnvioService:

    def __init__(self):
        self.repo = EnvioRepo()

    def obtener_por_pedido(self, pedido_id: str) -> dict:
        envio = self.repo.obtener_por_pedido(pedido_id)
        if not envio:
            raise HTTPException(status_code=404, detail="Envío no encontrado para este pedido")
        return envio

    def actualizar(self, envio_id: str, datos: EnvioUpdate) -> dict:
        campos = datos.model_dump(exclude_none=True)
        return self.repo.actualizar(envio_id, campos)
