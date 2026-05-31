# Base de Datos — Referencia Swift

Documentación de todos los triggers, vistas y procedimientos almacenados del proyecto.

---

## Triggers (7)

### En la tabla `pedidos`

| Trigger | Momento | Qué hace |
|---|---|---|
| `trigger_validar_transicion_estado` | BEFORE UPDATE | Bloquea cambios de estado inválidos antes de que ocurran |
| `trigger_actualizar_stock` | AFTER UPDATE | Descuenta el stock de cada producto al confirmar |
| `trigger_generar_factura` | AFTER UPDATE | Genera la factura automáticamente al confirmar |
| `trigger_auditoria_pedidos` | AFTER UPDATE | Registra cada cambio de estado en `auditoria_pedidos` |
| `trigger_crear_envio` | AFTER UPDATE | Crea el registro de envío en estado `preparando` al confirmar |

### En la tabla `clientes`

| Trigger | Momento | Qué hace |
|---|---|---|
| `trigger_no_eliminar_cliente_con_pedidos` | BEFORE DELETE | Lanza error si el cliente tiene pedidos asociados (RF-01) |

### En la tabla `categorias`

| Trigger | Momento | Qué hace |
|---|---|---|
| `trigger_no_eliminar_categoria_con_productos` | BEFORE DELETE | Lanza error si la categoría tiene productos asociados (RF-03) |

---

### Detalle de cada trigger

#### `trigger_validar_transicion_estado`
Impide transiciones de estado imposibles antes de que lleguen a la BD.
```
pendiente  → confirmado ✅   cancelado ✅
confirmado → enviado    ✅   cancelado ✅
enviado    → entregado  ✅
entregado  → (nada)     ❌ bloqueado
cancelado  → (nada)     ❌ bloqueado
```

#### `trigger_actualizar_stock`
Solo actúa cuando `estado` cambia de cualquier valor a `confirmado`. Valida que haya stock suficiente antes de descontarlo. Si no hay stock, lanza excepción y revierte todo.

#### `trigger_generar_factura`
Solo actúa cuando `estado` cambia a `confirmado`. Calcula:
- `impuestos = total * 0.19` (IVA 19%)
- `total_factura = total + impuestos`
- `numero_factura = SWIFT-YYYYMMDD-XXXXXXXX`

No crea factura si ya existe una para ese pedido.

#### `trigger_auditoria_pedidos`
Registra en `auditoria_pedidos` el estado anterior, el nuevo estado y la fecha cada vez que cambia `estado` en un pedido.

#### `trigger_crear_envio`
Solo actúa cuando `estado` cambia a `confirmado`. Toma la dirección del cliente asociado al pedido y la registra como `direccion_destino`. Inserta en `envios` con `estado = 'preparando'`. No duplica si ya existe un envío. Si el cliente no tiene dirección, usa `'Sin dirección registrada'` como fallback.

#### `trigger_no_eliminar_cliente_con_pedidos`
Antes de borrar un cliente verifica si tiene filas en `pedidos`. Si tiene, lanza:
> `No se puede eliminar el cliente X porque tiene pedidos asociados`

#### `trigger_no_eliminar_categoria_con_productos`
Antes de borrar una categoría verifica si tiene filas en `productos`. Si tiene, lanza:
> `No se puede eliminar la categoría X porque tiene productos asociados`

---

## Procedimientos Almacenados (4)

### `crear_pedido`
```sql
crear_pedido(p_cliente_id uuid, p_items_json jsonb, p_descuento numeric) → uuid
```
Crea un pedido completo en una sola transacción atómica:
1. Inserta el pedido en `pedidos` con estado `pendiente`
2. Por cada item en `p_items_json`: valida que el producto exista y tenga stock suficiente
3. Inserta cada item en `detalle_pedidos`
4. Calcula el total y lo actualiza en `pedidos`
5. Retorna el `id` del pedido creado

**Formato de `p_items_json`:**
```json
[
  { "producto_id": "uuid", "cantidad": 2 },
  { "producto_id": "uuid", "cantidad": 1 }
]
```

---

### `cancelar_pedido`
```sql
cancelar_pedido(p_pedido_id uuid, p_observacion text) → void
```
1. Verifica que el pedido exista y no esté ya en `entregado` o `cancelado`
2. Si el pedido estaba en `confirmado` o `enviado`, devuelve el stock de cada producto
3. Cambia el estado a `cancelado`

---

### `aplicar_descuento`
```sql
aplicar_descuento(p_pedido_id uuid) → numeric
```
Calcula y aplica el descuento según las reglas de RF-05:
- Más de 3 productos distintos → 10%
- Total mayor a $500 → 15% (tiene prioridad sobre la regla anterior)

Actualiza `descuento` y `total` en el pedido. Retorna el valor del descuento aplicado.

---

### `actualizar_estado_pedido`
```sql
actualizar_estado_pedido(p_pedido_id integer, p_nuevo_estado text) → json
```
Cambia el estado de un pedido a `confirmado`, `enviado` o `entregado`. El `trigger_validar_transicion_estado` valida automáticamente que la transición sea válida.

> **No usar para cancelar** — para eso existe `cancelar_pedido()` que además devuelve el stock.

Retorna el registro del pedido actualizado en formato JSON.

---

## Vistas (3)

### `vista_pedidos_completos`
Une `pedidos`, `clientes`, `detalle_pedidos`, `facturas` y `envios` en una sola consulta.

**Columnas:** `pedido_id`, `fecha_pedido`, `estado`, `total`, `descuento`, `cliente_id`, `cliente_nombre`, `cliente_email`, `cantidad_productos`, `numero_factura`, `estado_envio`

**Uso:** pantalla principal de pedidos, reporte de pedidos.

---

### `vista_inventario`
Muestra todos los productos con su categoría y calcula el estado de stock automáticamente.

**Columnas:** `id`, `producto`, `tipo`, `categoria`, `precio`, `stock`, `estado_stock`

**Estado de stock:**
- `agotado` → stock = 0
- `stock bajo` → stock entre 1 y 5
- `disponible` → stock > 5

**Uso:** pantalla de inventario, alertas de stock bajo.

---

### `vista_resumen_ventas`
Agrupa las ventas por categoría. Excluye pedidos en estado `cancelado` o `pendiente`.

**Columnas:** `categoria`, `total_pedidos`, `unidades_vendidas`, `ingresos_totales`, `precio_promedio`

**Uso:** pantalla de reportes y estadísticas.
