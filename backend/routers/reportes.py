from fastapi import APIRouter
from services.reporte_service import ReporteService

router = APIRouter(prefix="/reportes", tags=["Reportes"])
service = ReporteService()


@router.get("/pedidos", response_model=list)
def reporte_pedidos():
    return service.pedidos_completos()


@router.get("/inventario", response_model=list)
def reporte_inventario():
    return service.inventario()


@router.get("/ventas", response_model=list)
def reporte_ventas():
    return service.resumen_ventas()
