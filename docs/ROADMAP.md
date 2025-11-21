# VENDIO Product Roadmap 2025-2026

**Documento:** Plan de Ejecución Estratégico  
**Basado en:** [VENDIO Vision](vendio_vision.md) y Estado Actual del Desarrollo  
**Fecha:** Noviembre 2025  
**Estado:** Vivo (Se actualiza trimestralmente)

---

## 🗺️ Resumen Ejecutivo

Este roadmap traza el camino para transformar el MVP actual de **VENDIO** en la plataforma SaaS líder para pequeños comercios en la Patagonia. La estrategia se centra en consolidar primero el **núcleo operativo** (que el comercio pueda vender y gestionar pedidos sin fricción) antes de expandir hacia las herramientas de **crecimiento** (Ads, Google, Bots).

---

## 📍 Estado Actual (Q4 2025) - "Cimientos Sólidos"

Hemos completado la infraestructura crítica multi-tenant y la experiencia de compra esencial.

### ✅ Completado
- **Arquitectura Multi-Tenant:** Subdominios/rutas por comercio, bases de datos aisladas (RLS).
- **Sistema de Templates:**
  - 🎨 **Galería:** Para artistas/moda (Visual-first).
  - 🍔 **Restaurante:** Para gastronomía (Menú, categorías colapsables).
- **Checkout & Pagos:** Integración completa con **MercadoPago** y opción de "Pago en Efectivo".
- **Personalización:** Editor de temas (colores, fuentes, layout) desde el admin.
- **Onboarding:** Flujo de registro y configuración inicial de tienda.
- **Landing Central:** Directorio de comercios activos.

### 🚧 En Progreso (Inmediato)
- **Variantes de Producto (FEAT-20251116):**
  - Tallas, colores, materiales (para Artistas).
  - Ingredientes extra, "sin cebolla" (para Restaurantes).
  - *Crítico para desbloquear el uso real en restaurantes.*

---

## 📅 Fase 1: Núcleo Operativo (Q1 2026)
**Objetivo:** Que un restaurante pueda operar un turno completo de noche solo usando VENDIO.

### 1.1 Gestión de Pedidos (Order Manager)
*El "Kitchen Display System" simplificado.*
- **Dashboard de Pedidos en Vivo:** Vista auto-refrescable de pedidos entrantes.
- **Estados de Pedido:** Pendiente → Confirmado → En Preparación → Listo/En Camino → Entregado.
- **Notificaciones Sonoras:** Alerta cuando entra un pedido nuevo (crítico para cocinas ruidosas).
- **Impresión de Comandas:** Generación de PDF simple para impresoras térmicas (80mm).

### 1.2 Gestión de Catálogo Avanzada
- **Control de Stock Simple:** "Pausar" producto (86'd) con un click desde el móvil.
- **Horarios de Menú:** Mostrar desayuno solo de 8am a 11am.
- **Buscador y Filtros:** Para clientes en menús extensos.

### 1.3 WhatsApp "Click-to-Chat"
- En lugar de un bot complejo, iniciar con enlaces inteligentes.
- Botón "Consultar por WhatsApp" en cada producto que pre-llena el mensaje con el pedido
- Confirmación de pedido envía link a WhatsApp del comercio.

---

## 📅 Fase 2: Descubrimiento y Tracción (Q2 2026)
**Objetivo:** Que los comercios consigan sus primeros 100 clientes a través de VENDIO.

### 2.1 Google Business Sync (MVP)
- **Sincronización Básica:** Horarios y dirección desde VENDIO hacia Google Maps.
- **Link al Menú:** Asegurar que el botón "Menú" en Maps lleve a la tienda VENDIO.

### 2.2 Analítica Accionable (V1)
- **Dashboard de Ventas:** Gráficos diarios/semanales.
- **Top Productos:** "¿Qué se vendió más ayer?".
- **Reporte de Cierre de Caja:** Resumen simple para cuadrar efectivo/MP al final del día.

### 2.3 SEO Automático
- **Sitemaps Dinámicos:** Generación automática para cada tenant.
- **Meta Tags Inteligentes:** Títulos y descripciones optimizados para compartir en redes ("Open Graph").
- **Schema.org:** Marcado de "Restaurant" y "Menu" para Google Rich Snippets.

---

## 📅 Fase 3: Aceleración y Automatización (Q3 2026)
**Objetivo:** Automatizar el marketing y la atención al cliente (Plan PRO).

### 3.1 Meta Ads Manager (Simplificado)
- **"Boost this Product":** Crear anuncio de Instagram desde el panel de VENDIO en 3 clicks.
- **Plantillas de Anuncios:** Generadas automáticamente con las fotos del producto.
- **Audiencias Predefinidas:** "Gente a 5km a la redonda interesada en comida".

### 3.2 WhatsApp Bot (V1)
- **Respuestas Automáticas:** Horarios, dirección, menú.
- **Estado de Pedido:** Cliente consulta "¿Cómo va mi pedido?" y recibe estado real.

### 3.3 Fidelización Básica
- **Base de Datos de Clientes:** CRM simple (quién compró, cuándo).
- **Email Marketing:** "Hace 30 días no vienes, aquí tienes un cupón".

---

## 📅 Fase 4: Escala y Ecosistema (Q4 2026+)
**Objetivo:** Funcionalidades Enterprise y expansión de nicho.

### 4.1 Sistema de Reservas
- Gestión de mesas y turnos.
- Recordatorios por WhatsApp/SMS.

### 4.2 Logística y Delivery
- Integración con proveedores de última milla (si aplica en la región) o gestión de flota propia (app para repartidor).

### 4.3 API Pública & Integraciones
- Conectar con sistemas POS legacy (Maxirest, Fudo, etc.) si es necesario para clientes grandes.

---

## 📊 Hitos de Negocio Alineados

| Fase | Meta Técnica | Meta de Negocio (KPI) |
|------|--------------|-----------------------|
| **Actual** | Variantes + Templates Estables | 5 Comercios Beta Activos |
| **Fase 1** | Order Manager + Stock | 20 Comercios Pagos (Plan Básico) |
| **Fase 2** | Google Sync + Analytics | 50 Comercios Pagos |
| **Fase 3** | Ads + Bot | 100+ Comercios (30% en Plan PRO) |

---

## 🛠️ Stack Tecnológico Evolutivo

- **Frontend:** Next.js 15 (App Router) - Mantener performance <2s LCP.
- **Backend:** Supabase - Escalar RLS y Edge Functions para lógica de negocio compleja (ej. asignación de pedidos).
- **Infra:** Vercel - Migrar a planes Pro/Enterprise según demanda de ancho de banda.
- **Pagos:** MercadoPago - Evaluar Stripe si hay expansión internacional.
- **AI:** OpenAI/Claude - Para generación de descripciones de productos y respuestas de bot en Fase 3.

