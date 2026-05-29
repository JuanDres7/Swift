# Swift — Documento de Requerimientos Funcionales

## 1. Introducción

### 1.1 Propósito
Este documento describe los requerimientos funcionales del sistema **Swift**, una aplicación web de gestión de pedidos para una tienda de tecnología. El documento está dirigido al equipo de desarrollo y sirve como guía para la implementación del sistema.

### 1.2 Alcance
Swift es un sistema web que permite gestionar el ciclo completo de ventas de una tienda de tecnología: desde el registro de clientes y productos hasta la generación automática de facturas y el control de envíos. El sistema integra una capa de lógica de negocio en Python con una base de datos PostgreSQL administrada mediante Supabase.

### 1.3 Definiciones y Acrónimos
| Término | Definición |
|---------|-----------|
| POO | Programación Orientada a Objetos |
| API | Application Programming Interface |
| REST | Representational State Transfer |
| CRUD | Create, Read, Update, Delete |
| JWT | JSON Web Token |
| ORM | Object Relational Mapping |

---

## 2. Descripción General del Sistema

### 2.1 Contexto
Swift nace como respuesta a la necesidad de digitalizar y automatizar los procesos de ventas de una tienda de tecnología. El sistema centraliza la gestión de clientes, productos, pedidos, facturas y envíos en una sola plataforma accesible desde el navegador.

### 2.2 Stack Tecnológico
| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| Base de datos | PostgreSQL (Supabase) |
| Control de versiones | Git + GitHub |

### 2.3 Arquitectura
El sistema sigue una arquitectura de tres capas:
- **Capa de presentación:** interfaz web construida en React
- **Capa de lógica de negocio:** API REST construida en FastAPI con POO y patrón Observer
- **Capa de datos:** base de datos PostgreSQL en Supabase con vistas, procedimientos almacenados y triggers

### 2.4 Patrón de Diseño
El sistema implementa el patrón **Observer** en la capa de backend. La clase `Pedido` actúa como Subject; al cambiar de estado notifica automáticamente a los módulos de `Inventario`, `Facturación` y `Envío`, desacoplando la lógica de cada módulo.

---

## 3. Requerimientos Funcionales

### RF-01 Gestión de Clientes
| Campo | Descripción |
|-------|-------------|
| ID | RF-01 |
| Nombre | Gestión de clientes |
| Descripción | El sistema debe permitir registrar, consultar, actualizar y eliminar clientes |
| Prioridad | Alta |

**Detalle:**
- RF-01.1 El sistema debe permitir registrar un cliente con nombre, email, teléfono y dirección
- RF-01.2 El email del cliente debe ser único en el sistema
- RF-01.3 El sistema debe permitir buscar clientes por nombre o email
- RF-01.4 El sistema debe permitir actualizar los datos de un cliente existente
- RF-01.5 El sistema debe impedir eliminar un cliente que tenga pedidos asociados

---

### RF-02 Gestión de Productos
| Campo | Descripción |
|-------|-------------|
| ID | RF-02 |
| Nombre | Gestión de productos |
| Descripción | El sistema debe permitir registrar y administrar el catálogo de productos tecnológicos |
| Prioridad | Alta |

**Detalle:**
- RF-02.1 El sistema debe permitir registrar productos con nombre, tipo, precio, stock y descripción
- RF-02.2 Los productos deben clasificarse por tipo: laptop, celular, accesorio o componente
- RF-02.3 Los productos deben estar asociados a una categoría
- RF-02.4 El sistema debe mostrar el estado del stock: disponible, stock bajo (≤5 unidades) o agotado
- RF-02.5 El stock no puede ser negativo

---

### RF-03 Gestión de Categorías
| Campo | Descripción |
|-------|-------------|
| ID | RF-03 |
| Nombre | Gestión de categorías |
| Descripción | El sistema debe permitir organizar los productos por categorías |
| Prioridad | Media |

**Detalle:**
- RF-03.1 El sistema debe permitir crear, editar y eliminar categorías
- RF-03.2 No se puede eliminar una categoría que tenga productos asociados
- RF-03.3 El nombre de la categoría debe ser único

---

### RF-04 Gestión de Pedidos
| Campo | Descripción |
|-------|-------------|
| ID | RF-04 |
| Nombre | Gestión de pedidos |
| Descripción | El sistema debe permitir crear y gestionar pedidos de clientes |
| Prioridad | Alta |

**Detalle:**
- RF-04.1 Un pedido debe estar asociado a un cliente existente
- RF-04.2 Un pedido puede contener uno o más productos con sus respectivas cantidades
- RF-04.3 El sistema debe validar el stock disponible antes de crear un pedido
- RF-04.4 El sistema debe calcular automáticamente el subtotal de cada ítem y el total del pedido
- RF-04.5 El pedido debe manejar los siguientes estados: pendiente → confirmado → enviado → entregado / cancelado
- RF-04.6 Al confirmar un pedido, el sistema debe descontar automáticamente el stock de cada producto
- RF-04.7 Al cancelar un pedido confirmado, el sistema debe devolver el stock a los productos

---

### RF-05 Sistema de Descuentos
| Campo | Descripción |
|-------|-------------|
| ID | RF-05 |
| Nombre | Sistema de descuentos |
| Descripción | El sistema debe calcular y aplicar descuentos automáticamente según reglas de negocio |
| Prioridad | Media |

**Detalle:**
- RF-05.1 Si un pedido contiene más de 3 productos distintos, se aplica un descuento del 10%
- RF-05.2 Si el total del pedido supera $500, se aplica un descuento del 15%
- RF-05.3 Las reglas de descuento son excluyentes; si aplican las dos, se aplica la mayor (15%)
- RF-05.4 El descuento se calcula sobre el total antes de impuestos

---

### RF-06 Generación de Facturas
| Campo | Descripción |
|-------|-------------|
| ID | RF-06 |
| Nombre | Generación automática de facturas |
| Descripción | El sistema debe generar una factura automáticamente al confirmar un pedido |
| Prioridad | Alta |

**Detalle:**
- RF-06.1 Al confirmar un pedido, el sistema genera automáticamente una factura mediante un trigger en la BD
- RF-06.2 La factura debe incluir subtotal, impuestos (19% IVA) y total
- RF-06.3 El número de factura debe ser único y generarse automáticamente con el formato: `SWIFT-YYYYMMDD-XXXXXXXX`
- RF-06.4 Un pedido solo puede tener una factura asociada

---

### RF-07 Gestión de Envíos
| Campo | Descripción |
|-------|-------------|
| ID | RF-07 |
| Nombre | Gestión de envíos |
| Descripción | El sistema debe permitir registrar y rastrear el envío de cada pedido |
| Prioridad | Media |

**Detalle:**
- RF-07.1 Un envío debe estar asociado a un pedido confirmado
- RF-07.2 El envío debe manejar los estados: preparando, en_camino, entregado, devuelto
- RF-07.3 El sistema debe registrar transportadora, número de guía y fechas de envío y entrega
- RF-07.4 Un pedido solo puede tener un envío asociado

---

### RF-08 Auditoría de Pedidos
| Campo | Descripción |
|-------|-------------|
| ID | RF-08 |
| Nombre | Auditoría automática de pedidos |
| Descripción | El sistema debe registrar automáticamente cada cambio de estado de un pedido |
| Prioridad | Media |

**Detalle:**
- RF-08.1 Cada cambio de estado de un pedido debe registrarse automáticamente mediante un trigger en la BD
- RF-08.2 El registro debe incluir estado anterior, estado nuevo, fecha y hora del cambio
- RF-08.3 El historial de auditoría no puede ser modificado ni eliminado por el usuario

---

### RF-09 Reportes y Consultas
| Campo | Descripción |
|-------|-------------|
| ID | RF-09 |
| Nombre | Reportes y consultas |
| Descripción | El sistema debe ofrecer vistas consolidadas de información para la toma de decisiones |
| Prioridad | Media |

**Detalle:**
- RF-09.1 El sistema debe mostrar un resumen de pedidos con cliente, estado, total y número de factura
- RF-09.2 El sistema debe mostrar el estado del inventario con clasificación de stock
- RF-09.3 El sistema debe mostrar un resumen de ventas agrupado por categoría con ingresos totales

---

## 4. Requerimientos No Funcionales

### RNF-01 Seguridad
- Las credenciales de la base de datos deben almacenarse en variables de entorno, nunca en el código fuente
- Las contraseñas de usuarios deben almacenarse encriptadas

### RNF-02 Usabilidad
- La interfaz debe ser intuitiva y navegable sin necesidad de capacitación
- El sistema debe ser responsivo y funcionar en navegadores modernos

### RNF-03 Mantenibilidad
- El código debe seguir una arquitectura en capas (routers, services, models, repositories)
- Cada módulo debe tener una responsabilidad única
- El código debe estar documentado con docstrings en Python

### RNF-04 Control de versiones
- Todo el código fuente y las migraciones de BD deben estar versionados en GitHub
- Los mensajes de commit deben seguir el estándar Conventional Commits

---

## 5. Modelo de Datos

### 5.1 Tablas principales
| Tabla | Descripción |
|-------|-------------|
| clientes | Información de los clientes registrados |
| categorias | Categorías de productos |
| productos | Catálogo de productos con stock |
| pedidos | Pedidos realizados por los clientes |
| detalle_pedidos | Productos incluidos en cada pedido (N:M) |
| facturas | Facturas generadas automáticamente |
| envios | Información de envío de cada pedido |
| auditoria_pedidos | Historial de cambios de estado de pedidos |

### 5.2 Objetos de base de datos
| Tipo | Nombre | Descripción |
|------|--------|-------------|
| Vista | vista_pedidos_completos | Pedidos con cliente, factura y envío |
| Vista | vista_inventario | Productos con estado de stock |
| Vista | vista_resumen_ventas | Ventas agrupadas por categoría |
| Procedimiento | crear_pedido | Crea pedido y detalle en transacción atómica |
| Procedimiento | cancelar_pedido | Cancela pedido y devuelve stock |
| Procedimiento | aplicar_descuento | Aplica descuento según reglas de negocio |
| Trigger | trigger_auditoria_pedidos | Registra cambios de estado automáticamente |
| Trigger | trigger_actualizar_stock | Descuenta stock al confirmar pedido |
| Trigger | trigger_generar_factura | Genera factura al confirmar pedido |

---

## 6. Integrantes del Proyecto

| Nombre | Rol |
|--------|-----|
| | |
| | |
| | |

---

*Documento generado para el proyecto Swift — Sistema de Gestión de Pedidos*
*Materias: Programación 2 + Sistemas de Bases de Datos*
