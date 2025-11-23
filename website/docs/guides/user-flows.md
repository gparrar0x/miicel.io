---
sidebar_position: 1
title: Document
---

---
sidebar_position: 3
title: User Flows
---

## VENDIO - User Flows

**Audience:** Product, UX, engineering, sales  
**Version:** 0.1 (draft)  
**Updated:** 2025-11-22  

---

## 1. Roles

- **Usuario Administrador (Tenant Owner):** Persona que configura la tienda, sube productos, ve pedidos y ajusta precios.
- **Usuario Comprador (Cliente final):** Persona que entra al sitio / menú online y realiza el pedido / compra.

---

## 2. Flujos – Usuario Administrador

### 2.1 Alta de cuenta y creación de tenant

1. Admin llega a la landing de VENDIO y hace clic en **Crear cuenta**.
2. Completa formulario de registro (email, contraseña, datos básicos).
3. El sistema crea un **tenant** con un `slug` único basado en el nombre del negocio.
4. Admin es redirigido al **onboarding inicial** del tenant.

Resultado: existe un tenant activo con dueño autenticado listo para configurar.

---

### 2.2 Onboarding inicial del negocio

1. Desde el onboarding, el Admin:
   - Carga **logo** (archivo JPG/PNG, validación de tamaño).
   - Carga **banner/portada** opcional.
   - Ingresa **nombre del negocio**, **subtítulo**, **ubicación** y **teléfono**.
2. El sistema sube las imágenes a Storage y persiste la configuración básica en Supabase.
3. Al finalizar, se habilita la tienda pública en `/{locale}/{tenantSlug}`.

Resultado: storefront público con branding mínimo operativo.

---

### 2.3 Configuración de plantilla y tema (Appearance)

1. Admin accede a `/{tenantId}/dashboard/settings/appearance`.
2. El sistema valida que el usuario es OWNER del tenant.
3. En la vista de Theme Editor:
   - Elige **plantilla**: Gallery, Detail, Minimal o Restaurant.
   - Ajusta **grid columns**, **image aspect ratio**, **card variant**, **spacing** y **colores de marca**.
4. Observa cambios en el **preview en vivo** (300ms debounce).
5. Hace clic en **Save Changes** para persistir.

Resultado: el storefront público refleja inmediatamente la plantilla y tema seleccionados.

---

### 2.4 Gestión de catálogo (categorías y productos)

1. Desde el dashboard, Admin entra a la sección de **Productos**.
2. Crea o edita **categorías** (por ejemplo: Entradas, Panchos, Bebidas).
3. Para cada producto:
   - Define **nombre**, **descripción**, **precio**, **categoría**, **stock**.
   - Sube una **imagen principal** (`image_url`) respetando las dimensiones recomendadas.
4. Guarda los cambios; los productos quedan asociados al tenant y visibles en el storefront.

Resultado: el menú / catálogo público muestra las nuevas categorías y productos ordenados por categoría.

---

### 2.5 Actualización rápida de precios y stock

1. Admin accede al listado de productos en dashboard.
2. Localiza el producto a modificar (por búsqueda o filtro por categoría).
3. Edita:
   - **Precio** (para cambiar promociones, inflación, etc.).
   - **Stock** (para marcar producto como agotado o volver a disponible).
4. Guarda; los cambios se reflejan inmediatamente en la tienda (Precio y disponibilidad).

Resultado: los clientes ven precios actualizados y no pueden pedir productos sin stock.

---

### 2.6 Revisión y gestión de pedidos

1. Admin abre el dashboard y navega a la sección **Orders** / **Pedidos**.
2. Ve listado de pedidos con:
   - Estado (pending, paid, completed, cancelled).
   - Monto total y forma de pago.
   - Detalle de ítems.
3. Puede:
   - Cambiar el **estado** (ej. de pending → in preparation → completed).
   - Ver detalles para preparación en cocina.
4. En integraciones futuras, estos cambios disparan notificaciones (WhatsApp, email).

Resultado: el negocio puede operar el flujo de pedidos end‑to‑end desde VENDIO.

---

### 2.7 Acceso rápido al dashboard desde la tienda

1. Admin abre su propia tienda pública `/{locale}/{tenantSlug}`.
2. Estando autenticado, ve el botón flotante o acceso rápido al **Dashboard**.
3. Hace clic y es redirigido al panel administrativo de su tenant.

Resultado: el dueño puede saltar del sitio público al dashboard sin recordar URLs largas.

---

## 3. Flujos – Usuario Comprador

### 3.1 Descubrimiento y acceso a la tienda

1. Cliente recibe un **link**, **QR** o encuentra el negocio en Google / redes.
2. Abre la URL pública `https://{host}/{locale}/{tenantSlug}` desde su móvil.
3. Ve la **cabecera** con logo, banner, nombre del negocio, subtítulo y ubicación.

Resultado: el cliente entiende inmediatamente qué vende el negocio y dónde está.

---

### 3.2 Exploración del catálogo / menú

1. Cliente hace scroll en la home del tenant.
2. Según la plantilla:
   - **Restaurant template:** ve acordeón de categorías y cards de producto con foto grande, nombre, descripción y precio.
   - **Gallery / Detail / Minimal:** ve grids adaptados (más visual, más detalle, o más compacto).
3. Puede cambiar de categoría, o usar filtros/búsqueda donde estén disponibles.

Resultado: el cliente puede navegar fácilmente por el menú hasta encontrar lo que quiere.

---

### 3.3 Selección de productos y carrito

1. En cada card de producto, el cliente:
   - Revisa imagen, descripción corta y precio.
   - Hace clic en **Agregar** o equivalente.
2. El sistema:
   - Añade el ítem al carrito (con cantidad inicial 1).
   - Actualiza contador de items y total en el botón flotante / icono de carrito.
3. Cliente puede:
   - Abrir el **cart drawer / sheet** para revisar su pedido.
   - Ajustar **cantidades** o **eliminar** productos.

Resultado: el cliente construye su pedido de forma visual y reversible.

---

### 3.4 Checkout y pago

1. Desde el carrito, el cliente hace clic en **Ir a pagar** / **Confirmar pedido**.
2. Es redirigido al flujo de **checkout**, donde:
   - Confirma datos de contacto / entrega (según configuración del tenant).
   - Revisa el resumen de items y total.
3. El sistema crea la **preferencia de pago** (Mercado Pago) y redirige al gateway o muestra el widget correspondiente.
4. Cliente completa el pago (tarjeta u otros medios soportados).
5. Al finalizar, el sistema:
   - Actualiza el estado del pedido.
   - Redirige a página de **success**, **failure** o **pending** según resultado.

Resultado: el cliente tiene confirmación clara de su pedido y estado de pago.

---

### 3.5 Post‑compra (estado y comunicación)

1. Tras el pago exitoso, el cliente ve pantalla de **confirmación** con resumen del pedido.
2. Puede recibir:
   - Notificación en pantalla (toast / mensaje).
   - En futuras integraciones, mensajes de WhatsApp / email con detalles.
3. El negocio prepara el pedido y, según las integraciones, el cliente podría recibir cambios de estado (en preparación, listo, en camino).

Resultado: el cliente entiende qué pasó con su pedido y cuándo esperar la entrega / retiro.

---

## 4. Cobertura de flujos por rol

- **Usuario Administrador**
  - Alta de cuenta y tenant
  - Onboarding de negocio
  - Configuración de plantilla y tema
  - Gestión de catálogo (categorías y productos)
  - Actualización rápida de precios y stock
  - Revisión y gestión de pedidos
  - Acceso rápido al dashboard desde la tienda

- **Usuario Comprador**
  - Descubrimiento y acceso a la tienda
  - Exploración del catálogo / menú
  - Selección de productos y carrito
  - Checkout y pago
  - Post‑compra y estado del pedido


