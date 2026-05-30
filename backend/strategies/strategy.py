from abc import ABC, abstractmethod


class EstrategiaDescuento(ABC):
    """Interfaz base para todas las estrategias de descuento."""

    @abstractmethod
    def calcular(self, total: float, num_productos: int) -> float:
        """Retorna el porcentaje de descuento a aplicar (0.0 a 1.0)."""
        pass
