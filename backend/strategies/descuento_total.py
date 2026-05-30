from .strategy import EstrategiaDescuento


class DescuentoPorTotal(EstrategiaDescuento):
    """Aplica 15% de descuento si el total del pedido supera $500."""

    def calcular(self, total: float, num_productos: int) -> float:
        if total > 500:
            return 0.15
        return 0.0
