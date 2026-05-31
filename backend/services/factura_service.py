from fastapi import HTTPException
from repositories.factura_repo import FacturaRepo


class FacturaService:

    def __init__(self):
        self.repo = FacturaRepo()

    def obtener_por_pedido(self, pedido_id: str) -> dict:
        factura = self.repo.obtener_por_pedido(pedido_id)
        if not factura:
            raise HTTPException(status_code=404, detail="Factura no encontrada para este pedido")
        return factura
