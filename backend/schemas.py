from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


# ── Cliente ────────────────────────────────────────────────────────────────────

class ClienteCreate(SQLModel):
    nombre: str
    email: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None


class ClienteRead(SQLModel):
    id: int
    nombre: str
    email: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    created_at: Optional[datetime] = None


class ClienteUpdate(SQLModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None


# ── Categoria ──────────────────────────────────────────────────────────────────

class CategoriaCreate(SQLModel):
    nombre: str
    descripcion: Optional[str] = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    created_at: Optional[datetime] = None


class CategoriaUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None


# ── Producto ───────────────────────────────────────────────────────────────────

class ProductoCreate(SQLModel):
    nombre: str
    tipo: str
    precio: float
    stock: int = 0
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = None


class ProductoRead(SQLModel):
    id: int
    nombre: str
    tipo: str
    precio: float
    stock: int
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = None
    created_at: Optional[datetime] = None


class ProductoUpdate(SQLModel):
    nombre: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = None


# ── Pedido ─────────────────────────────────────────────────────────────────────

class ItemPedido(SQLModel):
    producto_id: int
    cantidad: int


class PedidoCreate(SQLModel):
    cliente_id: int
    items: list[ItemPedido]
    descuento: Optional[float] = None


class PedidoRead(SQLModel):
    id: int
    cliente_id: int
    estado: str
    total: Optional[float] = None
    descuento: Optional[float] = None
    created_at: Optional[datetime] = None


class PedidoUpdate(SQLModel):
    estado: str


# ── DetallePedido ──────────────────────────────────────────────────────────────

class DetallePedidoRead(SQLModel):
    id: int
    pedido_id: int
    producto_id: int
    cantidad: int
    precio_unitario: float
    subtotal: float


# ── Factura ────────────────────────────────────────────────────────────────────

class FacturaRead(SQLModel):
    id: int
    pedido_id: int
    numero_factura: str
    subtotal: float
    iva: float
    total: float
    created_at: Optional[datetime] = None


# ── Envio ──────────────────────────────────────────────────────────────────────

class EnvioRead(SQLModel):
    id: int
    pedido_id: int
    estado: str
    transportadora: Optional[str] = None
    numero_guia: Optional[str] = None
    fecha_estimada: Optional[datetime] = None
    fecha_entrega: Optional[datetime] = None
    created_at: Optional[datetime] = None


class EnvioUpdate(SQLModel):
    estado: Optional[str] = None
    transportadora: Optional[str] = None
    numero_guia: Optional[str] = None
    fecha_estimada: Optional[datetime] = None
    fecha_entrega: Optional[datetime] = None


# ── AuditoriaPedido ────────────────────────────────────────────────────────────

class AuditoriaPedidoRead(SQLModel):
    id: int
    pedido_id: int
    estado_anterior: Optional[str] = None
    estado_nuevo: str
    created_at: Optional[datetime] = None
