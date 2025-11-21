# VENDIO
## Plataforma SaaS de Gestión Digital para Pequeños Comercios

**Documento:** Descripción de Funcionalidades  
**Versión:** 1.0  
**Fecha:** Noviembre 2025  

---

## PARTE 1: VISIÓN

### Qué es VENDIO

VENDIO es una plataforma centralizada que permite a pequeños comercios (restaurantes, food trucks, cooks independientes) gestionar su negocio digital desde un único dashboard.

### Problema que resuelve

Pequeño restaurante necesita:
```
- Catálogo digital (menú online)
- Gestión de productos (precios, disponibilidad)
- Marketing digital (Meta Ads)
- Presencia en Google (Google Business)
- Sistema de reservas/pedidos
- Procesamiento de pagos
- Datos de ventas (analítica)
```

**Realidad actual:** 6-7 herramientas diferentes, sin integración, confuso, caro.

**Solución VENDIO:** Todo integrado en 1 plataforma, $299/mes.

### Propuesta de valor

```
SIN VENDIO:
- 6 herramientas = $600+/mes
- Tiempo: 10+ horas/semana configurando
- Conversión: Baja (no optimizado)
- Data: Dispersa en múltiples plataformas
- Escalabilidad: Manual, lenta

CON VENDIO:
- 1 herramienta = $299/mes
- Tiempo: 2 horas/semana (mantenimiento)
- Conversión: 3-5x mejor (optimizado)
- Data: Centralizada, accionable
- Escalabilidad: Automática
```

---

## PARTE 2: MERCADO OBJETIVO

### Segmentación

**Mercado Local (Neuquén, etc)**
```
Restaurantes pequeños:
├─ 50-300 covers/semana
├─ 1-5 personas en equipo
├─ Ventas: $5,000-20,000/mes
├─ Problema: Conversión manual
├─ WTP: $200-400/mes
└─ Ubicación: Ciudades locales (90% mercado local)

Food trucks & delivery:
├─ 1-2 personas
├─ Ventas: $2,000-8,000/mes
├─ Problema: Sin sistema
├─ WTP: $100-300/mes
└─ Ubicación: Rotatoria, entrega

Cooks independientes:
├─ 1 persona (founder)
├─ Ventas: $1,000-5,000/mes
├─ Problema: Cero digital
├─ WTP: $50-150/mes
└─ Ubicación: Desde casa, eventos
```

**Mercado Turístico (San Martín, Bariloche, etc)**
```
Restaurantes turísticos:
├─ 200-500 covers/semana
├─ 5-20 personas
├─ Ventas: $30,000-100,000/mes
├─ Mercado: 80% turistas, 20% local
├─ Problema: Discovery + conversión
├─ WTP: $500-1,500/mes
└─ Ubicación: Destinos turísticos
```

### Tamaño de mercado (Año 1)

```
MERCADO LOCAL (Patagonia - Neuquén, etc):
├─ TAM: 500+ restaurantes/comercios
├─ SAM: 150 pequeños (target profile)
├─ SOM Año 1: 20-30 clientes
└─ Revenue Año 1: $72,000 - $108,000

MERCADO TURÍSTICO (San Martín, Bariloche):
├─ TAM: 800 restaurantes
├─ SAM: 200 pequeños-medianos
├─ SOM Año 1: 10-15 clientes
└─ Revenue Año 1: $60,000 - $180,000 (precio más alto)

TOTAL AÑO 1: 30-45 clientes, $132,000-288,000 revenue
```

---

## PARTE 3: FUNCIONALIDADES CORE

### 1. CATÁLOGO DIGITAL

**Qué es**

Sitio web profesional donde el comercio muestra su menú/productos. Es la "vidriera digital" del negocio.

**Funcionalidades**

```
Para el comercio (Admin):
├─ Editor visual (drag-and-drop, sin código)
├─ Estructura de menú:
│  ├─ Crear categorías (Entradas, Platos, Bebidas, etc)
│  ├─ Agregar productos a cada categoría
│  ├─ Establecer precios
│  ├─ Subir fotos de productos
│  ├─ Escribir descripciones
│  └─ Definir disponibilidad (horarios específicos)
│
├─ Personalización:
│  ├─ Colores de marca
│  ├─ Logo
│  ├─ Foto de portada
│  ├─ Descripción del negocio
│  └─ Información de contacto
│
├─ Organización:
│  ├─ Reordenar categorías/productos
│  ├─ Destacar productos (¿cuáles aparecen primero?)
│  ├─ Marcar productos como "populares"
│  └─ Crear ofertas/combos
│
└─ Actualización rápida:
   ├─ Cambiar precio en 30 segundos
   ├─ Marcar producto "fuera de stock"
   ├─ Crear promoción del día
   └─ Los cambios se ven en vivo instantáneamente

Para el cliente (Public):
├─ Sitio web limpio y profesional
├─ Navegación intuitiva
├─ Búsqueda de productos
├─ Filtros (por categoría, precio, disponibilidad)
├─ Fotos grandes de productos
├─ Descripciones claras
├─ Precios visibles
├─ Información de horarios
├─ Dirección y contacto
├─ Botón para hacer pedido/reserva
└─ Responsive (funciona en móvil/desktop)
```

**Por qué es importante**

- Es el primer contacto visual con el cliente
- Genera confianza (parece profesional)
- Aumenta conversión (cliente ve qué venden, precios, fotos)
- SEO: El sitio se posiciona en Google (clientes lo encuentran)
- Disponible 24/7 (vende mientras duermes)

---

### 2. GESTIÓN DE PRODUCTOS

**Qué es**

Panel completo para administrar qué estás vendiendo, precios, disponibilidad, variaciones.

**Funcionalidades**

```
Crear/editar producto:
├─ Nombre del producto
├─ Descripción detallada
├─ Precio base
├─ Categoría
├─ Foto/múltiples fotos
├─ Ingredientes (listado)
├─ Alérgenos (advertencia importante)
├─ Disponibilidad (siempre / solo ciertos horarios)
└─ Stock (si aplica)

Variaciones:
├─ Tamaño (P/M/G → diferentes precios)
├─ Presentación (plato / para llevar)
├─ Adicionales/extras (queso extra, salsa, etc)
└─ Cada variación con precio diferente

Promotiones:
├─ Descuento por producto (ej: -20%)
├─ Precio especial por período (happy hour)
├─ Combo (producto A + B = precio especial)
├─ Cantidad limitada (ej: "Máximo 5 unidades/día")
└─ Vigencia (desde/hasta fecha)

Gestión de stock:
├─ Establecer cantidad máxima diaria
├─ Mostrar "Agoté" cuando se termina
├─ Registrar cantidad vendida
├─ Alertas si stock bajo
└─ Importar stock desde Excel

Historial:
├─ Ver qué productos se venden más
├─ En qué horarios se vende cada cosa
├─ Cuál es el margen de ganancia por producto
└─ Usar datos para optimizar menú
```

**Por qué es importante**

- Control total de qué vendes y a qué precio
- Flexibilidad (cambios rápidos sin programador)
- Inteligencia (datos de qué vende bien)
- Eficiencia (menos confusión, menos errores)

---

### 3. GESTIÓN DE META ADS

**Qué es**

Panel para crear y administrar campañas de publicidad en Meta (Facebook/Instagram) sin tocar Meta Ads Manager.

**Funcionalidades**

```
Dashboard de resumen:
├─ Cuánto gastaste este mes
├─ Cuántos clientes vinieron por Meta
├─ ROI (retorno en inversión)
├─ Gráficos de performance
└─ Recomendaciones automáticas

Crear campaña (flow simplificado):
├─ Paso 1: Básicos
│  ├─ Nombre (ej: "Tráfico Navidad")
│  ├─ Presupuesto ($100 a $1000/mes)
│  ├─ Duración (desde/hasta fecha)
│  └─ Objetivo (Tráfico / Leads / Ventas)
│
├─ Paso 2: A quién dirigirse
│  ├─ Ubicación (Neuquén, San Martín, etc)
│  ├─ Edad (25-55, por ej)
│  ├─ Intereses predefinidos (Restaurantes, viajes, comida)
│  └─ Editar si quieres ser más específico
│
├─ Paso 3: Creative (lo que ven)
│  ├─ Opción A: Fotos tu restaurante/productos
│  ├─ Opción B: Generar con IA (escribes descripción)
│  ├─ Opción C: Subir foto tuya
│  └─ Preview en móvil/desktop
│
├─ Paso 4: Dónde enviar
│  ├─ A tu catálogo digital
│  ├─ A WhatsApp
│  ├─ A página personalizada
│  └─ Tracking automático
│
└─ Paso 5: Revisar y lanzar
   ├─ Resumen visual
   ├─ Botón: "Lanzar campaña"
   └─ O guardar como borrador

Monitoreo en vivo:
├─ Tabla de todas las campañas
├─ Filtrar por estado, performance
├─ Ver métricas:
│  ├─ Gasto
│  ├─ Impresiones (cuánta gente vio)
│  ├─ Clicks (cuánta gente hizo clic)
│  ├─ CTR (porcentaje que hizo clic)
│  ├─ CPC (costo por click)
│  └─ Conversiones (si puedes medir)
│
├─ Acciones rápidas:
│  ├─ Pausar/reanudar
│  ├─ Aumentar/disminuir presupuesto
│  ├─ Cambiar foto
│  ├─ Editar texto
│  └─ Duplicar si funciona bien
│
└─ Alertas automáticas:
   ├─ "Este ad no funciona, considera pausarlo"
   ├─ "Este ad es top performer, aumenta presupuesto"
   ├─ "Te quedan $10 en presupuesto"
   └─ "Nuevo ad en estatus de aprobación Meta"

A/B testing automático:
├─ Selecciona: ¿Qué quieres probar?
│  ├─ Fotos diferentes
│  ├─ Textos diferentes
│  ├─ Audiencias diferentes
│  └─ Horarios diferentes
├─ Sistema crea variantes
├─ Ejecuta test automáticamente
├─ Gana: El mejor performer
└─ Resultado claro en dashboard
```

**Por qué es importante**

- Traer clientes nuevos (awareness)
- Sin complejidad (UI simplificada vs Meta Ads Manager)
- Decisiones basadas en datos (ROI claro)
- Escalabilidad (si funciona, aumenta presupuesto con 1 click)

---

### 4. GESTIÓN DE GOOGLE BUSINESS

**Qué es**

Panel para administrar tu presencia en Google (Google Maps, Google Search). Es CRÍTICO para que clientes te encuentren.

**Funcionalidades**

```
Información del negocio:
├─ Nombre, dirección, teléfono
├─ Horarios de atención
├─ Categoría (Restaurante, etc)
├─ Descripción del negocio
├─ Website (apunta a tu catálogo)
├─ Fotos (portada, comida, ambiente)
└─ Atributos (¿tienes WiFi? ¿Aceptas reservas? etc)

Gestión de fotos:
├─ Subir 15+ fotos profesionales
├─ Fotos del restaurante
├─ Fotos de comida
├─ Fotos del interior
├─ Sistema ordena automáticamente
├─ Ver de qué fotos los clientes hacen clic
└─ Sugerencias de qué fotos agregar

Gestión de reseñas:
├─ Ver todas las reseñas (Google, TripAdvisor, Yelp)
├─ Rating actual (estrellas)
├─ Cantidad de reseñas
├─ Ver reseñas por rating (5★, 4★, etc)
├─ Responder a TODAS las reseñas
│  ├─ Plantillas predefinidas (respuesta rápida)
│  ├─ IA que genera respuesta personalizada
│  └─ Editar y publicar
├─ Seguimiento de reseñas nuevas
│  ├─ Notificación cuando hay reseña nueva
│  ├─ Alertas si baja de cierto rating
│  └─ Análisis de sentiment (¿positiva o negativa?)
│
└─ Estrategia de reseñas:
   ├─ Campañas para generar reseñas
   ├─ QR code para dejar reseña (en mesa)
   ├─ Email automático post-compra: "Déjanos una reseña"
   ├─ SMS option también
   ├─ Tracking de cuánta gente hizo clic
   └─ Conversión (requests → reseñas reales)

Google Posts:
├─ Crear posts que aparecen en Google Maps
├─ "Menú especial de Navidad"
├─ "Nuevo chef en la cocina"
├─ "20% descuento este mes"
├─ Cada post con foto, texto, botón CTA
├─ Scheduling (publicar automáticamente)
├─ Ver engagement (cuántos leyeron, cuántos hicieron clic)
└─ Sugerencia automática de qué postear

Performance & Analytics:
├─ Vistas del perfil (cuánta gente lo vio)
├─ Clicks a tu sitio web
├─ Clicks para llamar
├─ Clicks para pedir direcciones
├─ Solicitudes de reserva
├─ Gráficos por día/semana/mes
├─ Comparar: "Enero tuve X vistas, febrero Y"
└─ Ver "peak hours" (cuándo más buscan)

Mensajes directos:
├─ Clientes pueden enviarte mensajes por Google
├─ Ves todos en un inbox
├─ Responder directamente
├─ Historial de conversaciones
└─ Estadísticas de respuesta
```

**Por qué es importante**

- 88% de la gente usa Google Maps para encontrar lugares
- Rating alto = más clientes (4.5+ estrellas abre puertas)
- Reseñas = social proof (otros recomiendan)
- Posts = señal de actividad (Google rankea mejor)
- Es GRATIS (no como Meta Ads)

---

### 5. GESTIÓN DE RESERVAS Y PEDIDOS

**Qué es**

Sistema centralizado para manejar TODO lo que el cliente quiere comprar: reservas de mesa, pedidos de comida, delivery, take-away.

**Funcionalidades**

```
Para el cliente:
├─ Opción 1: Hacer pedido
│  ├─ Ver catálogo
│  ├─ Seleccionar productos
│  ├─ Agregar variaciones (tamaño, extras)
│  ├─ Carrito con resumen
│  ├─ Elegir fecha/hora de entrega
│  ├─ Ingresar dirección (si delivery)
│  ├─ Notas especiales (sin cebolla, etc)
│  ├─ Pagar (ver sección Pagos)
│  └─ Confirmación en email + SMS
│
├─ Opción 2: Hacer reserva de mesa
│  ├─ Seleccionar fecha
│  ├─ Seleccionar hora disponible
│  ├─ Cantidad de personas
│  ├─ Nombre + teléfono
│  ├─ Notas (cumpleaños, etc)
│  └─ Confirmación
│
├─ Opción 3: Consultar via WhatsApp
│  ├─ Cliente escribe: "Hola, quiero hacer un pedido"
│  ├─ Bot automático responde
│  ├─ Maneja todo el flujo
│  └─ (ver sección WhatsApp)
│
└─ Tracking en vivo (si es delivery):
   ├─ Estado del pedido en tiempo real
   ├─ "Confirmado", "Preparando", "En camino"
   ├─ Horario estimado de llegada
   └─ Track de motociclista (si aplica)

Para el comercio (Admin):
├─ Inbox centralizado de pedidos/reservas
│  ├─ Lista de todos los pedidos
│  ├─ Filtrar (hoy, mañana, próxima semana)
│  ├─ Filtrar (confirmado, preparando, completado)
│  ├─ Buscar por cliente
│  └─ Detalles completos del pedido
│
├─ Para cada pedido ves:
│  ├─ Qué productos
│  ├─ Cantidad
│  ├─ Variaciones (tamaño, extras)
│  ├─ Precio total
│  ├─ Método de pago
│  ├─ Si ya pagó o debe efectivo
│  ├─ Horario/dirección de entrega
│  ├─ Notas del cliente
│  ├─ Teléfono para contactar
│  └─ Historial (qué cambios se hicieron)
│
├─ Acciones sobre cada pedido:
│  ├─ Confirmar recepción
│  ├─ Marcar "En preparación"
│  ├─ Marcar "Listo para entrega"
│  ├─ Marcar "Completado"
│  ├─ Cancelar (si cliente lo pide)
│  ├─ Contactar cliente (botón llama a WhatsApp)
│  └─ Imprimir etiqueta
│
├─ Calendario de reservas:
│  ├─ Vista: Semana completa
│  ├─ Ver horarios disponibles
│  ├─ Ver mesas ocupadas/libres (si aplica)
│  ├─ Ajustar capacidad por hora
│  ├─ Marcar horarios bloqueados (cerrado, etc)
│  └─ Notas por reserva (cumpleaños, alergia, etc)
│
├─ Notificaciones en tiempo real:
│  ├─ Pedido nuevo → notificación
│  ├─ Reserva nueva → notificación
│  ├─ Pago recibido → notificación
│  ├─ Cliente cancela → notificación
│  ├─ Push notification en celular
│  ├─ Email
│  └─ SMS option
│
├─ Configuración:
│  ├─ Horarios de funcionamiento
│  ├─ Días cerrado
│  ├─ Tipos de servicio (Dine-in, delivery, take-away)
│  ├─ Tiempo de preparación (por defecto)
│  ├─ Capacidad de entregas/día
│  ├─ Zona de delivery (radio, ej: 5km)
│  ├─ Costo de envío (fijo o por km)
│  ├─ Mínimo de compra
│  └─ Descuento para delivery
│
└─ Automatización:
   ├─ Email automático: "Pedido confirmado"
   ├─ Email: "Tu pedido está listo"
   ├─ SMS: Recordatorio 24hs antes de reserva
   ├─ Solicitud automática de review (después)
   └─ Reactivación de clientes antiguos
```

**Por qué es importante**

- Es el CORE del negocio (donde venden)
- Sin VENDIO: Estás respondiendo WhatsApp manualmente (agotador)
- Con VENDIO: Automático, organizado, sin errores
- Transparencia: Cliente ve estado en tiempo real
- Escalabilidad: Mismo esfuerzo para 10 que para 100 pedidos

---

### 6. GESTIÓN DE PAGOS

**Qué es**

Sistema integrado que recibe pagos de clientes de forma segura.

**Funcionalidades**

```
Métodos de pago disponibles:
├─ Tarjeta de crédito (Visa, Mastercard, Amex)
├─ Tarjeta de débito
├─ Billetera (Mercado Pago)
├─ Transferencia bancaria
├─ Efectivo (si es local/presencial)
└─ Financiación (cuotas)

Para el cliente:
├─ En checkout elige método
├─ Redirección segura (Mercado Pago)
├─ Completa los datos
├─ Recibe confirmación
├─ Email con recibo
└─ Opción de descargar factura

Para el comercio (Admin):
├─ Resumen de pagos:
│  ├─ Cuánto vendiste hoy/semana/mes
│  ├─ Cuántos pagos completados
│  ├─ Cuántos pendientes
│  ├─ Desglose por método de pago
│  └─ Comisión deducida (Mercado Pago)
│
├─ Historial de transacciones:
│  ├─ Cada pago registrado
│  ├─ Cliente, monto, fecha, método
│  ├─ Estado (completado, pendiente, fallido)
│  ├─ Comisión cobrada
│  └─ Monto neto (lo que recibes)
│
├─ Reconciliación:
│  ├─ Cuándo recibes el dinero
│  ├─ Generalmente en 24-48hs
│  ├─ Directo a tu cuenta bancaria
│  └─ Ver comprobante
│
├─ Refunds:
│  ├─ Si cliente quiere devolver
│  ├─ Procesar reembolso (1 click)
│  ├─ Dinero vuelve a cliente
│  └─ Registro automático
│
└─ Reportes:
   ├─ Exportar a Excel (para contador)
   ├─ Resumen mensual
   ├─ Desglose por categoría
   └─ Análisis de tendencias
```

**Opciones de efectivo:**
```
Si es presencial (dine-in):
├─ Cliente come/bebe
├─ Al finalizar pide cuota
├─ Opción: "Pagar con tarjeta" o "Efectivo"
├─ Si efectivo: Registras manualmente en sistema
├─ Si tarjeta: Sistema procesa automáticamente
└─ Fácil, transparente, sin confusiones
```

**Por qué es importante**

- Seguridad (no maneja dinero directo)
- Confianza (cliente ve empresa seria)
- Automático (menos trabajo manual)
- Dinero rápido (no esperas 30 días)
- Transparencia (registro claro)

---

### 7. ANALÍTICA

**Qué es**

Dashboard que te muestra datos claros: qué vende, cuándo vende, de dónde vienen los clientes, cuál es tu ganancia.

**Funcionalidades**

```
RESUMEN EJECUTIVO:
├─ Período: Hoy, semana, mes, rango personalizado
├─ KPIs principales:
│  ├─ Total vendido ($)
│  ├─ Cantidad de transacciones
│  ├─ Ticket promedio
│  ├─ Ganancias netas (después comisiones)
│  ├─ Clientes nuevos vs recurrentes
│  └─ Comparación mes anterior (↑↓)

VENTAS:
├─ Gráfico de ventas por día
│  ├─ Línea temporal (semana/mes)
│  ├─ Peaks y valleys identificados
│  └─ Patrón visible (ej: fines de semana más alto)
│
├─ Producto TOP (best sellers):
│  ├─ Ranking: Qué se vende más
│  ├─ Por cantidad vendida
│  ├─ Por dinero generado
│  ├─ Margen de ganancia por producto
│  └─ Tendencia (subiendo/bajando)
│
├─ Por categoría:
│  ├─ Qué categoría vende más
│  ├─ Asados 40%, Bebidas 30%, Postres 30%
│  └─ Oportunidades (ej: aumentar postres)
│
├─ Hora peak:
│  ├─ Qué hora del día más ventas
│  ├─ 13:00-14:00 es el pico
│  └─ Usar para staffing/stock

CLIENTES:
├─ Total de clientes:
│  ├─ Nuevos (primer compra)
│  ├─ Recurrentes (más de 1 compra)
│  ├─ Churn (que dejaron de venir)
│  └─ Lifetime value (cuánto gasta en total)
│
├─ Frequency:
│  ├─ Clientes que vienen 1 vez/semana
│  ├─ Clientes que vienen 2-3 veces/semana
│  ├─ Clientes que vienen diario
│  └─ Identificar core customers
│
├─ Segmentación:
│  ├─ Por monto gastado (high-value vs low)
│  ├─ Por método de compra (pedido, reserva, delivery)
│  ├─ Por horario (mañana, tarde, noche)
│  └─ Análisis de cohortes
│
└─ Reactivación:
   ├─ Clientes que no vinieron en 30 días
   ├─ Campañas automáticas para traerlos de vuelta
   ├─ "Te extrañamos, 20% descuento"
   └─ Track si retornan

CANALES/MARKETING:
├─ De dónde vienen los clientes:
│  ├─ Meta Ads (X% de ventas, $Y)
│  ├─ Google (búsqueda orgánica)
│  ├─ Direct (escriben dirección)
│  ├─ WhatsApp (referral)
│  └─ Otros (boca a boca, tarjeta, etc)
│
├─ ROI por canal:
│  ├─ Meta Ads: Gastaste $500, generaste $2000 (ROAS 4x)
│  ├─ Google: $0 gasto, $1000 ventas (ROAS infinito)
│  ├─ Comparativa clara
│  └─ Decisión: Dónde invertir más
│
├─ Customer acquisition cost (CAC):
│  ├─ Por Meta Ads: $30 por cliente
│  ├─ Por Google: $0
│  └─ Payback period (cuándo recupero inversión)
│
└─ Attribution:
   ├─ Primero vio Meta Ad
   ├─ Luego buscó en Google
   ├─ Finalmente compró por Google
   ├─ ¿Quién se lleva el crédito? (modelo de atribución)
   └─ Importantes para marketing decisions

FINANZAS:
├─ Revenue:
│  ├─ Ingresos brutos (antes comisiones)
│  ├─ Comisiones deducidas (Mercado Pago)
│  ├─ Ingresos netos (lo que depositan)
│  └─ Proyección (si continúa así, ganarás $X)
│
├─ Costos:
│  ├─ Comisión Meta Ads (si pagás)
│  ├─ Costo de envío (si deliverys)
│  ├─ Costo VENDIO ($299/mes)
│  └─ Margen neto final
│
├─ Comparativa:
│  ├─ Este mes vs mes anterior
│  ├─ Este mes vs mes similar año pasado
│  ├─ Trending (↑ o ↓)
│  └─ Proyecciones
│
└─ Break-even:
   ├─ Si invertiste en Meta Ads
   ├─ Cuándo recuperaste la inversión
   ├─ Viability del negocio
   └─ Decision: Aumentar presupuesto o no

OPERACIONAL:
├─ Velocidad de servicio:
│  ├─ Tiempo promedio desde pedido a listo
│  ├─ Pedidos tarde (> 45 min)
│  ├─ Alertas si demoras aumentan
│  └─ Oportunidad: Agilizar

├─ Disponibilidad:
│  ├─ Cuántas órdenes "rechazaste" (no hay stock)
│  ├─ Productos que se agotan rápido
│  ├─ Recomendación: Aumentar producción
│  └─ Oportunidad de venta pérdida

└─ Satisfacción:
   ├─ Rating de clientes (si dejan reviews)
   ├─ Tendencia de reviews
   ├─ Alertas si baja
   └─ Acción: Investigar qué pasó

REPORTES:
├─ Exportar a Excel
├─ Generar PDF
├─ Email automático semanal/mensual
├─ Dashboard personalizable
│  ├─ Elige qué métricas ves
│  └─ Tamaño de widgets
│
└─ Alertas automáticas:
   ├─ "Ventas abajo 30% respecto semana pasada"
   ├─ "Producto X se agotó"
   ├─ "Meta Ads tiene ROAS bajo, considera pausar"
   └─ "Clientes recurrentes bajaron"
```

**Por qué es importante**

- Decisiones basadas en datos (no intuición)
- Ve qué funciona, qué no
- Oportunidades de crecimiento obvias
- ROI transparente (Meta Ads vale la pena?)
- Problemas identificados rápido

---

## PARTE 4: INTEGRACIÓN WHATSAPP

**Qué es**

Automatización completa de WhatsApp. El cliente escribe, un bot responde automáticamente. Solo escalas cuando es necesario.

**Flujos automatizados:**

```
FLOW 1: Cliente quiere hacer pedido

Cliente: "Hola, quiero pedir"

Bot responde (automático):
├─ "¡Bienvenido! ¿Qué te gustaría comer?"
├─ Muestra productos populares con botones
├─ Cliente selecciona: "Asado para 2"
├─ Bot: "¿Tamaño?"
├─ Opciones: Pequeño / Mediano / Grande
├─ Cliente elige: "Mediano"
├─ Bot: "¿A qué hora lo querés?" (ve disponibilidad en tiempo real)
├─ Opciones de horarios disponibles
├─ Cliente elige: "20:30"
├─ Bot resumen: "Asado Mediano - $450 - 20:30 ¿Confirmar?"
├─ Cliente: "Sí"
├─ Bot: "¿Cómo pagás?" (tarjeta, efectivo, etc)
├─ Si tarjeta: Link a pago
├─ Si efectivo: "Confirmar - Pagarás en la entrega"
├─ Confirmación: "Tu pedido #2849 confirmado!"
├─ "Te avisaremos cuando esté listo"
└─ Automáticamente aparece en dashboard del comercio

FLOW 2: Cliente quiere hacer reserva

Cliente: "Hola, necesito reservar mesa"

Bot responde:
├─ "¡Claro! ¿Cuántas personas?"
├─ Cliente: "4"
├─ "¿Para qué día?"
├─ Cliente: "Sábado"
├─ "¿Qué hora?" (muestra disponibilidad)
├─ Cliente: "21:00"
├─ "¿Tu nombre?"
├─ Cliente: "Juan"
├─ Resumen: "Mesa 4 personas - Sábado 21:00 - A nombre de Juan. ¿Confirmar?"
├─ Cliente: "Sí"
├─ Confirmación: "Reserva confirmada! Te esperamos."
├─ SMS/email también con detalles
└─ Aparece en calendario del comercio

FLOW 3: Cliente pregunta disponibilidad

Cliente: "¿Cierran hoy?"

Bot responde (automático):
├─ "Abierto hasta las 23:00"
├─ O si es un lunes (cerrado): "Cerrado lunes. Abierto mañana 12:00"
└─ Info actualizada automáticamente

FLOW 4: Cliente pregunta sobre alérgeno

Cliente: "¿El asado tiene gluten?"

Bot responde:
├─ Busca información del producto
├─ "No, nuestro asado es sin gluten"
└─ Información precisa

FLOW 5: Cliente quiere pedir descuento

Cliente: "¿Tienen descuento?"

Bot responde:
├─ "Sí, primera compra 10% off"
├─ "Ofertas de la semana: ..."
└─ Promueve lo que tienes

FLOW 6: Notificaciones automáticas

Después de que el cliente compra:

Bot envía (automático):
├─ Inmediatamente: "Tu pedido confirmado"
├─ En 10 min: "Estamos preparando tu comida"
├─ En 30 min: "Tu pedido está listo!"
├─ En 35 min (delivery): "Motociclista en camino"
├─ En 40 min: "Lllegada en 5 minutos"
├─ Después de entrega: "¿Cómo estuvo? Déjanos una reseña"
└─ 24hs después: "Extrañamos tu pedido. 20% off"

Para reservas:

Bot envía:
├─ Confirmación inmediata
├─ Recordatorio 24hs antes: "Tu reserva es mañana 21:00"
├─ Recordatorio 2hs antes: "Te esperamos en 2 horas"
└─ Después: "¿Cómo estuvo? Review aquí"
```

**Por qué es importante**

- Cliente no espera (respuesta instantánea)
- Comercio no responde mensajes (automático)
- Escalable (100 chats sin esfuerzo)
- Conversión (cliente en WhatsApp → compra)
- Datos (cada interacción registrada)

---

## PARTE 5: PLANES Y PRECIOS

### Estructura de precios

```
PLAN BÁSICO - $99/mes
├─ Catálogo digital
├─ Gestión de productos
├─ Gestión de Google Business (básica)
├─ WhatsApp Bot (respuestas automáticas)
├─ Mercado Pago (pagos)
├─ Analítica básica
├─ Soporte por email
└─ Máximo 100 productos

PRO PLAN - $299/mes (RECOMENDADO)
├─ Todo de BÁSICO +
├─ Meta Ads Manager (centralizado)
├─ A/B testing de campaigns
├─ Google Business (full: fotos, posts, reviews)
├─ WhatsApp Bot (avanzado + AI responses)
├─ Reservas y pedidos (sistema completo)
├─ Analítica avanzada
├─ Soporte prioritario
├─ Unlimited productos
└─ Integraciones adicionales

ENTERPRISE - Precio custom
├─ Todo de PRO +
├─ Múltiples sucursales
├─ Account manager dedicado
├─ Integraciones custom
├─ API access
├─ White-label option
└─ SLA garantizado (99.9% uptime)
```

### Beneficios de cada plan

**BÁSICO ($99/mes):**
- Para: Negocios que empiezan
- Objetivo: Tener presencia digital básica
- Suficiente para: Food trucks, cooks independientes
- No incluye: Meta Ads management

**PRO ($299/mes):**
- Para: Restaurantes que quieren crecer
- Objetivo: Sistema integrado completo
- Suficiente para: Restaurantes locales + turísticos
- Incluye: TODO (Meta Ads, Google, reviews, etc)
- Mejor ROI: VENDIO se paga solo

**ENTERPRISE (Custom):**
- Para: Cadenas, multi-ubicación
- Objetivo: Control total + soporte dedicado
- Suficiente para: Negocios grandes
- Premium: Personalizacion, integraciones, soporte

---

## PARTE 6: PROPUESTA DE VALOR POR SEGMENTO

### Para restaurante local (Neuquén, etc)

**Problema actual:**
- Responde WhatsApp manualmente
- No sabe qué vende bien
- Sin presencia en Google
- Sin publicidad digital (no tiene presupuesto)
- Conversión baja

**VENDIO resuelve:**
```
Catálogo digital → Clientes ven menú 24/7
Gestión de productos → Control de precios/ofertas
WhatsApp Bot → Responde automáticamente
Google Business → Los encuentran en Google
Analítica → Sabe qué vende (datos claros)
Meta Ads (PRO) → Tráfico pagado si quiere escalar

Resultado:
- Ventas +30-50%
- Tiempo ahorrado: 5+ horas/semana
- Decisiones inteligentes (basadas en datos)
- Escalabilidad (mismo esfuerzo, más pedidos)
```

### Para restaurante turístico (San Martín, Bariloche)

**Problema actual:**
- Turistas no saben que existen
- Baja presencia en Google
- Instagram sin actualizaciones
- Confusión de reservas (por email, WhatsApp, llamada)
- No sabe de dónde vienen clientes

**VENDIO resuelve:**
```
Meta Ads → Turistas los ven en Facebook/Instagram
Catálogo digital SEO → Ranking en Google
Google Business → Fotos, reseñas, posts automáticos
Gestión de reservas → Sistema ordenado
Analítica → Entienden conversión

Resultado:
- +50-100% ocupación (temporada)
- Presencia profesional
- Reseñas que hablan por sí solas
- Decisiones basadas en datos reales
- Escalabilidad instantánea (más anuncios = más clientes)
```

### Para food truck / negocio pequeño

**Problema actual:**
- Sin website
- Solo WhatsApp/llamadas
- Clientes inconsistentes
- Difícil escalar

**VENDIO resuelve:**
```
Catálogo digital → "Hoy estaré en Parque Central"
Pedidos → Cliente ve qué hay, pide
WhatsApp → Confirmaciones automáticas
Analítica → Horarios/lugares más rentables

Resultado:
- Profesionalismo (se ve como negocio real)
- Eficiencia operacional
- Datos para optimizar ubicación/horario
- Escalable (si funciona, replica)
```

---

## PARTE 7: MÉTRICAS DE ÉXITO

### Para VENDIO (SaaS)

```
Año 1:
├─ Clientes: 30-50
├─ Revenue: $120,000 - $180,000
├─ Churn rate: <5% monthly
├─ NPS: >40

Año 2:
├─ Clientes: 100-150
├─ Revenue: $400,000 - $600,000
├─ Churn rate: <3% monthly
├─ NPS: >50
└─ Expansion revenue (upseeling): +20%

Año 3:
├─ Clientes: 300+
├─ Revenue: $1.2M - $1.8M
├─ Churn rate: <2% monthly
├─ NPS: >60
└─ Market share: 10-15% de Patagonia
```

### Para cliente (restaurante usando VENDIO)

```
Mes 1:
├─ Catalogo online live ✓
├─ Google Business optimizado ✓
└─ Primeros pedidos por sistema ✓

Mes 2-3:
├─ +20% en conversión (más clientes)
├─ 5+ horas/semana ahorradas
├─ Datos claros (qué vende)
└─ Primeras campañas Meta Ads

Mes 4-6:
├─ +50% en conversión
├─ Reseñas subiendo
├─ Google ranking mejor
├─ ROI en Meta Ads visible

Mes 12:
├─ +100% en conversión (se dobla negocio)
├─ Datos ultra precisos (decisiones fáciles)
├─ Presencia digital profesional
├─ Escalabilidad automática
└─ Payback VENDIO en 2-3 meses
```

---

## RESUMEN EJECUTIVO

### ¿Qué es VENDIO?

**Una plataforma SaaS que centraliza TODO lo que un pequeño comercio necesita para vender online:**

1. **Catálogo digital** - Vidriera 24/7
2. **Gestión de productos** - Precios, stock, ofertas
3. **Meta Ads** - Publicidad sin complicación
4. **Google Business** - Discovery (donde encuentran)
5. **Reservas/Pedidos** - Sistema único (sin confusión)
6. **Pagos** - Integrado, seguro
7. **WhatsApp** - Bot automático
8. **Analítica** - Datos claros (decisiones inteligentes)

### Propuesta de valor

```
SIN VENDIO:
├─ 6-7 herramientas diferentes
├─ $600+/mes
├─ 10+ horas/semana manual
├─ Datos dispersos
├─ Conversión media
└─ Escalabilidad = trabajo extra

CON VENDIO:
├─ 1 plataforma integrada
├─ $99-299/mes
├─ 2 horas/semana mantenimiento
├─ Datos centralizados + accionables
├─ Conversión 3-5x mejor
└─ Escalabilidad automática
```

### Por qué funciona

```
✅ Resuelve problemas reales (no feature creep)
✅ Precio accesible ($299 se paga solo)
✅ ROI claro y medible
✅ Interfaz simple (no requiere aprendizaje)
✅ Integración total (funciona junto, no separado)
✅ Automático (ahorra tiempo real)
✅ Datos (decisiones inteligentes)
✅ Escalable (de 1 a 1000 clientes sin esfuerzo)
```

---

*Documento v1.0 - Noviembre 2025 - Mentat*