# Swift — Contexto del Proyecto para Claude Code

## ¿Qué es Swift?
Swift es una aplicación web de gestión de pedidos para una tienda de tecnología. Es un proyecto académico que integra dos materias:
- **Programación 2:** POO, herencia, interfaces, polimorfismo y patrón de diseño Observer
- **Sistemas de Bases de Datos:** vistas, procedimientos almacenados, triggers y auditoría

---

## Stack Tecnológico
| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| Base de datos | PostgreSQL (Supabase) |
| Control de versiones | Git + GitHub (JuanDres7/Swift) |

---

## Arquitectura del Proyecto

### Estructura de carpetas
```
Swift/
├── backend/
│   ├── routers/          # Endpoints HTTP (pedidos.py, clientes.py, productos.py)
│   ├── services/         # Lógica de negocio (PedidoService, DescuentoService)
│   ├── models/           # Clases Python con POO y herencia
│   ├── observers/        # Patrón Observer (Observer, InventarioObserver, FacturacionObserver, EnvioObserver)
│   ├── repositories/     # Acceso a datos (PedidoRepo, ClienteRepo, ProductoRepo)
│   ├── database/         # Conexión a Supabase (conexion.py, supabase_client.py)
│   ├── .env              # Credenciales (NO subir a GitHub)
│   ├── .env.example      # Plantilla de variables de entorno
│   └── requirements.txt  # Dependencias Python
├── frontend/
│   ├── src/
│   │   ├── pages/        # Pantallas (Pedidos, Productos, Clientes)
│   │   ├── components/   # Componentes reutilizables (Tabla, Formulario, Navbar)
│   │   ├── services/     # Llamadas a la API (api.js, pedidosService.js)
│   │   └── hooks/        # Hooks personalizados (usePedidos, useProductos)
│   └── ...
└── supabase/
    └── migrations/       # Archivos SQL versionados
        ├── 20260529154427_remote_schema.sql
        └── 20260529154706_remote_schema.sql
```

### Flujo de una petición
```
React → FastAPI Router → Service → Observer → Repository → Supabase/PostgreSQL
```

### Regla clave de división
- **React** nunca llama directamente a Supabase. Todo pasa por FastAPI.
- **FastAPI** no reimplementa el CRUD básico. Solo maneja lógica de negocio compleja.
- **Supabase** es exclusivamente la base de datos PostgreSQL en la nube.

---

## Patrón de Diseño: Observer

La clase `Pedido` actúa como **Subject**. Al cambiar de estado notifica automáticamente a:
- `InventarioObserver` → actualiza el stock
- `FacturacionObserver` → genera la factura
- `EnvioObserver` → registra el envío

Esto complementa los triggers de PostgreSQL que hacen lo mismo a nivel base de datos, demostrando ambas materias en paralelo.

---

## Base de Datos (ya configurada en Supabase)

### Tablas (8)
| Tabla | Descripción |
|-------|-------------|
| clientes | Información de clientes |
| categorias | Categorías de productos |
| productos | Catálogo con stock |
| pedidos | Pedidos de clientes |
| detalle_pedidos | Tabla intermedia N:M pedidos-productos |
| facturas | Facturas generadas automáticamente |
| envios | Información de envíos |
| auditoria_pedidos | Historial de cambios de estado |

### Relaciones
- `clientes` → `pedidos` (1:N)
- `categorias` → `productos` (1:N)
- `pedidos` → `detalle_pedidos` (1:N)
- `productos` → `detalle_pedidos` (1:N)
- `pedidos` → `facturas` (1:1)
- `pedidos` → `envios` (1:1)
- `pedidos` → `auditoria_pedidos` (1:N)

### Vistas (3)
- `vista_pedidos_completos` — pedido + cliente + factura + envío
- `vista_inventario` — productos con estado de stock (disponible, stock bajo, agotado)
- `vista_resumen_ventas` — ingresos agrupados por categoría

### Procedimientos almacenados (3)
- `crear_pedido(cliente_id, items_json, descuento)` — crea pedido y detalle en transacción atómica
- `cancelar_pedido(pedido_id, observacion)` — cancela y devuelve stock
- `aplicar_descuento(pedido_id)` — 10% si >3 productos, 15% si total >$500

### Triggers (3)
- `trigger_auditoria_pedidos` — registra cada cambio de estado automáticamente
- `trigger_actualizar_stock` — descuenta stock al confirmar pedido
- `trigger_generar_factura` — genera factura con IVA 19% al confirmar pedido

---

## Variables de entorno (.env en /backend)
```env
SUPABASE_URL=https://dipioyuctgreinhqrgaw.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.dipioyuctgreinhqrgaw.supabase.co:5432/postgres
```

---

## Dependencias Python (backend)
```
fastapi
uvicorn
supabase
psycopg2-binary
sqlalchemy
python-dotenv
pydantic
python-jose
passlib
```

---

## Requerimientos Funcionales

### RF-01 Gestión de Clientes
- Registrar, consultar, actualizar y eliminar clientes
- Email único por cliente
- No eliminar clientes con pedidos asociados

### RF-02 Gestión de Productos
- Registrar productos con nombre, tipo, precio, stock y descripción
- Tipos válidos: laptop, celular, accesorio, componente
- Estado de stock automático: disponible / stock bajo (≤5) / agotado

### RF-03 Gestión de Categorías
- CRUD de categorías
- No eliminar categorías con productos asociados

### RF-04 Gestión de Pedidos
- Crear pedidos con múltiples productos
- Validar stock antes de crear
- Estados: pendiente → confirmado → enviado → entregado / cancelado
- Al confirmar: descontar stock automáticamente
- Al cancelar confirmado: devolver stock

### RF-05 Sistema de Descuentos
- >3 productos distintos → 10% de descuento
- Total >$500 → 15% de descuento
- Si aplican las dos reglas → aplicar la mayor (15%)

### RF-06 Generación de Facturas
- Generación automática al confirmar pedido (trigger en BD)
- IVA del 19%
- Número único formato: `SWIFT-YYYYMMDD-XXXXXXXX`
- Un pedido = una factura (1:1)

### RF-07 Gestión de Envíos
- Asociado a pedido confirmado
- Estados: preparando, en_camino, entregado, devuelto
- Registrar transportadora, número de guía y fechas

### RF-08 Auditoría de Pedidos
- Registro automático de cada cambio de estado (trigger en BD)
- Incluye estado anterior, estado nuevo y fecha
- No modificable por el usuario

### RF-09 Reportes
- Vista de pedidos completos
- Vista de inventario con estado de stock
- Vista de ventas por categoría

---

## Estado actual del proyecto

### ✅ Completado
- Definición de arquitectura y stack tecnológico
- Modelo de base de datos diseñado
- Tablas creadas en Supabase
- Vistas, procedimientos y triggers creados en Supabase
- Migraciones versionadas en GitHub
- GitHub conectado a Supabase
- Repositorio inicializado con estructura de carpetas
- `.env` configurado en backend
- Dependencias Python instaladas

### 🔲 Pendiente
1. **Backend — FastAPI**
   - Crear `main.py` con la app de FastAPI
   - Configurar conexión a Supabase en `database/`
   - Implementar modelos Python con POO y herencia en `models/`
   - Implementar patrón Observer en `observers/`
   - Implementar repositorios en `repositories/`
   - Implementar servicios en `services/`
   - Implementar routers en `routers/`
   - Generar `requirements.txt`

2. **Frontend — React**
   - Inicializar proyecto con Vite
   - Configurar Tailwind CSS
   - Crear estructura de carpetas
   - Implementar páginas y componentes
   - Conectar con la API de FastAPI

---

## Notas importantes para el desarrollo

1. **El profesor evalúa el código Python** — la POO y el patrón Observer deben ser explícitos y bien estructurados.
2. **FastAPI no duplica el CRUD de Supabase** — solo maneja lógica de negocio compleja.
3. **El patrón Observer vive en `/observers`** — `Pedido` es el Subject, los observers son `InventarioObserver`, `FacturacionObserver` y `EnvioObserver`.
4. **Los triggers de BD complementan el Observer de Python** — ambos reaccionan al cambio de estado de un pedido, uno en Python y otro en PostgreSQL.
5. **React nunca llama a Supabase directamente** — siempre pasa por FastAPI.
