from strategies import DescuentoPorCantidad, DescuentoPorTotal


class DescuentoService:
    """
    Determina el porcentaje de descuento aplicable a un pedido
    usando el patrón Strategy. Elige siempre la estrategia más beneficiosa.
    """

    def __init__(self):
        self.estrategias = [
            DescuentoPorCantidad(),
            DescuentoPorTotal(),
        ]

    def calcular(self, total: float, num_productos: int) -> float:
        porcentajes = [e.calcular(total, num_productos) for e in self.estrategias]
        return max(porcentajes)
