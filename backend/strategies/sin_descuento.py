from .strategy import EstrategiaDescuento


class SinDescuento(EstrategiaDescuento):
    """No aplica ningún descuento al pedido."""

    def calcular(self, total: float, num_productos: int) -> float:
        return 0.0
