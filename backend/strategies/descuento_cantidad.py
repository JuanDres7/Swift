from .strategy import EstrategiaDescuento


class DescuentoPorCantidad(EstrategiaDescuento):
    """Aplica 10% de descuento si el pedido tiene más de 3 productos distintos."""

    def calcular(self, total: float, num_productos: int) -> float:
        if num_productos > 3:
            return 0.10
        return 0.0
