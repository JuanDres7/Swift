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
    id: str
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
    id: str
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
    categoria_id: str


class ProductoRead(SQLModel):
    id: str
    nombre: str
    tipo: str
    precio: float
    stock: int
    descripcion: Optional[str] = None
    categoria_id: str
    created_at: Optional[datetime] = None


class ProductoUpdate(SQLModel):
    nombre: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    descripcion: Optional[str] = None
    categoria_id: Optional[str] = None


# ── Pedido ─────────────────────────────────────────────────────────────────────

class ItemPedido(SQLModel):
    producto_id: str
    cantidad: int


class PedidoCreate(SQLModel):
    cliente_id: str
    items: list[ItemPedido]


class PedidoRead(SQLModel):
    id: str
    cliente_id: str
    estado: str
    total: float
    descuento: float
    fecha_pedido: Optional[datetime] = None


class PedidoUpdate(SQLModel):
    estado: str


class CancelarPedidoRequest(SQLModel):
    observacion: str = "Cancelado por el usuario"


# ── DetallePedido ──────────────────────────────────────────────────────────────

class DetallePedidoRead(SQLModel):
    id: str
    pedido_id: str
    producto_id: str
    cantidad: int
    precio_unitario: float
    subtotal: Optional[float] = None


# ── Factura ────────────────────────────────────────────────────────────────────

class FacturaRead(SQLModel):
    id: str
    pedido_id: str
    numero_factura: str
    subtotal: float
    impuestos: float
    total: float
    fecha_emision: Optional[datetime] = None


# ── Envio ──────────────────────────────────────────────────────────────────────

class EnvioRead(SQLModel):
    id: str
    pedido_id: str
    estado: str
    direccion_destino: str
    transportadora: Optional[str] = None
    numero_guia: Optional[str] = None
    fecha_envio: Optional[datetime] = None
    fecha_entrega: Optional[datetime] = None


class EnvioUpdate(SQLModel):
    estado: Optional[str] = None
    transportadora: Optional[str] = None
    numero_guia: Optional[str] = None
    fecha_envio: Optional[datetime] = None
    fecha_entrega: Optional[datetime] = None


# ── AuditoriaPedido ────────────────────────────────────────────────────────────

class AuditoriaPedidoRead(SQLModel):
    id: str
    pedido_id: str
    estado_anterior: Optional[str] = None
    estado_nuevo: str
    fecha_cambio: Optional[datetime] = None
    observacion: Optional[str] = None
