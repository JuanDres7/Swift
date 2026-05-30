from repositories.reporte_repo import ReporteRepo


class ReporteService:

    def __init__(self):
        self.repo = ReporteRepo()

    def pedidos_completos(self) -> list:
        return self.repo.pedidos_completos()

    def inventario(self) -> list:
        return self.repo.inventario()

    def resumen_ventas(self) -> list:
        return self.repo.resumen_ventas()
