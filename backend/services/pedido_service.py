from fastapi import HTTPException
from repositories.pedido_repo import PedidoRepo
from schemas import PedidoCreate
from .descuento_service import DescuentoService


class PedidoService:

    def __init__(self):
        self.repo = PedidoRepo()
        self.descuento_service = DescuentoService()

    def obtener_todos(self) -> list:
        return self.repo.obtener_todos()

    def obtener_por_id(self, pedido_id: str) -> dict:
        pedido = self.repo.obtener_por_id(pedido_id)
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        return pedido

    def obtener_detalles(self, pedido_id: str) -> list:
        self.obtener_por_id(pedido_id)
        return self.repo.obtener_detalles(pedido_id)

    def crear(self, datos: PedidoCreate) -> dict:
        # 1. Crear pedido via stored procedure (sin descuento aún)
        pedido_id = self.repo.crear(
            cliente_id=datos.cliente_id,
            items=[item.model_dump() for item in datos.items],
            descuento=0,
        )

        # 2. Obtener el pedido creado
        pedido = self.repo.obtener_por_id(pedido_id)
        detalles = self.repo.obtener_detalles(pedido_id)

        # 3. Calcular descuento con patrón Strategy
        descuento_pct = self.descuento_service.calcular(
            total=pedido["total"],
            num_productos=len(detalles),
        )

        # 4. Aplicar descuento via stored procedure si corresponde
        if descuento_pct > 0:
            self.repo.aplicar_descuento(pedido_id)
            pedido = self.repo.obtener_por_id(pedido_id)

        return pedido

    def confirmar(self, pedido_id: str) -> dict:
        self.obtener_por_id(pedido_id)
        return self.repo.actualizar_estado(pedido_id, "confirmado")

    def marcar_enviado(self, pedido_id: str) -> dict:
        self.obtener_por_id(pedido_id)
        return self.repo.actualizar_estado(pedido_id, "enviado")

    def marcar_entregado(self, pedido_id: str) -> dict:
        self.obtener_por_id(pedido_id)
        return self.repo.actualizar_estado(pedido_id, "entregado")

    def cancelar(self, pedido_id: str, observacion: str = "Cancelado por el usuario") -> None:
        self.obtener_por_id(pedido_id)
        self.repo.cancelar(pedido_id, observacion)
