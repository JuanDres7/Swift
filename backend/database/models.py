from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


# ── Tablas ─────────────────────────────────────────────────────────────────────

class Cliente(SQLModel, table=True):
    __tablename__ = "clientes"
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    created_at: Optional[datetime] = None


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: Optional[str] = None
    created_at: Optional[datetime] = None


class Producto(SQLModel, table=True):
    __tablename__ = "productos"
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    tipo: str
    precio: float
    stock: int = 0
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = Field(default=None, foreign_key="categorias.id")
    created_at: Optional[datetime] = None


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"
    id: Optional[int] = Field(default=None, primary_key=True)
    cliente_id: int = Field(foreign_key="clientes.id")
    estado: str = "pendiente"
    total: Optional[float] = None
    descuento: Optional[float] = 0.0
    created_at: Optional[datetime] = None


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedidos"
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id")
    producto_id: int = Field(foreign_key="productos.id")
    cantidad: int
    precio_unitario: float
    subtotal: float


class Factura(SQLModel, table=True):
    __tablename__ = "facturas"
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id")
    numero_factura: str
    subtotal: float
    iva: float
    total: float
    created_at: Optional[datetime] = None


class Envio(SQLModel, table=True):
    __tablename__ = "envios"
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id")
    estado: str = "preparando"
    transportadora: Optional[str] = None
    numero_guia: Optional[str] = None
    fecha_estimada: Optional[datetime] = None
    fecha_entrega: Optional[datetime] = None
    created_at: Optional[datetime] = None


class AuditoriaPedido(SQLModel, table=True):
    __tablename__ = "auditoria_pedidos"
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id")
    estado_anterior: Optional[str] = None
    estado_nuevo: str
    created_at: Optional[datetime] = None
