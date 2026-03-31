# SKY-198 — Descuentos por producto (rewrite)

> **Fecha:** 2026-03-26 | **Participantes:** Kokoro, Pixel, Centinela | **Issue:** SKY-198

## Decisiones necesarias

1. Schema: campos planos en `products` vs columna JSONB `discount`
2. Helper de cálculo de precio descontado: compartido (lib) o cada capa calcula
3. Cleanup legacy: migration destructiva (DROP) o soft-delete
4. Storefront: dónde mostrar precio tachado (product card, detail, cart, checkout)
5. Test IDs contract para E2E

---

## Propuestas

### Kokoro

| Decision | Propuesta | Justificacion |
|---|---|---|
| 1. Schema | Campos planos: `discount_type discount_scope discount_value discount_starts_at discount_ends_at` en `products` | Enums `discount_type`/`discount_scope` ya existen en DB; JSONB complica índices y RLS |
| 2. Helper cálculo | `lib/pricing.ts` → `computeEffectivePrice(product): number` compartido | Checkout y storefront deben producir el mismo precio; duplicar = drift |
| 3. Cleanup legacy | Migration non-destructiva: renombrar a `discount_legacy Json null` + comentario; DROP en sprint +1 | Rollback seguro si hay regresión en MP; sin pérdida de datos |
| 4. Storefront (API) | `/products` response incluye `original_price` y `discount_active`; precio final calculado server-side | Pixel consume precio ya calculado, no recalcula; checkout recibe `price` final |
| 5. Test IDs contract | API expone `discount_active: boolean` + `original_price: number`; Pixel ubica `data-testid="product-original-price"` y `data-testid="product-discount-badge"` | Contrato de datos estable antes de que Centinela escriba assertions |

**Necesito de otros:**
- Pixel: confirmar que `CheckoutItem.price` siempre es precio final (post-descuento), no original.
- Mentat: aprobar si `discount_starts_at/ends_at` entran en este sprint o se difieren.

**Conflicto que veo:**
- Checkout actual recibe `price` desde el cliente sin validación server-side → con descuentos activos, cliente puede manipular precio. Necesito validar en `CheckoutService` contra DB antes de crear preferencia MP.

### Pixel

| Decision | Propuesta | Justificacion |
|---|---|---|
| 1. Schema | Campos planos — alineado con Kokoro | Sin opinión propia; lo que viene de API ya calculado es suficiente para UI |
| 2. Helper de cálculo | Consumir `original_price` + `discount_active` que expone Kokoro; no recalcular en cliente | `GalleryCard.tsx` y `CartSheet.tsx` solo necesitan renderizar, no calcular |
| 3. Cleanup legacy | Sin opinión — decisión de Kokoro | Pixel no toca migrations |
| 4. Storefront precio tachado | `GalleryCard` (overlay info, `data-testid="product-card-original-price"`), `CartSheet` (por item), detail page; NO checkout | Cart y card son donde el descuento influye la decisión de compra |
| 5. Test IDs | `product-card-original-price`, `product-card-discounted-price`, `product-discount-badge`, `cart-item-original-price`, `cart-item-discounted-price`, `product-form-discount-type`, `product-form-discount-value` | Patrón `{feature}-{element}` ya establecido en `ProductForm.tsx` y `GalleryCard.tsx` |

**Necesito de otros:**
- Kokoro: confirmar shape exacto del objeto `Product` con los campos nuevos antes de tocar `ProductForm.tsx` y `GalleryCard.tsx`
- Kokoro: `item.price` en `cartStore` debe ser precio final post-descuento; `item.originalPrice` debe viajar separado para mostrar tachado en `CartSheet.tsx`

**Conflicto que veo:**
- `CartSheet.tsx` usa `item.price` directo desde `cartStore` — si el store no incluye `originalPrice`, perdemos el precio tachado en cart sin cambiar la interfaz del store (coordinación con Kokoro sobre shape del cart item)

### Centinela

| Decision | Propuesta | Justificacion |
|---|---|---|
| Test IDs contract | Usar `admin-discount-*`, `cart-summary-*`, `checkout-summary-*`, `kds-order-*` per discounts.locators.ts | Contrato existente, reutilizable para producto vs order discounts |
| Specs: fixture + scope | Quick: discounts-storefront.spec.ts (product card + cart); Balanced: + discounts-checkout.spec.ts + discounts-validation.spec.ts | Cobertura smoke + happy path; reutilizar loginAsOwner, seed con productos + descuentos |
| E2E flow: quién aplica | Owner/admin aplica en panel; checkout calcula automático; KDS refleja final | Alineado con roles existentes, no requiere mock |
| Mocks: precio, cálculo | Sin mocks; E2E real con DB seed (product.price, discount valor) | Determinístico, valida cadena completa |
| Observabilidad | Screenshots on fail + trace; validar precio final = original - discount | Suficiente para debugging, evita brittleness de hardcoded values |

**Necesito de otros:**
- Pixel: confirmar data-testid placement en components (product card discount badge, cart summary)
- Kokoro: seeder para productos con descuentos preconfigurados

**Conflicto que veo:**
- Si Pixel usa componente Badge compartido, need test ID en contexto (cart vs checkout) para diferenciar

---

## Conflictos

Sin conflictos. Coordinacion resuelta inline.

---

## Decisiones finales

| # | Decision | Resolucion | Owner |
|---|---|---|---|
| 1 | Schema | Campos planos en `products`: `discount_type`, `discount_value`, `discount_starts_at`, `discount_ends_at`. No JSONB. No `discount_scope` (siempre es producto). | Kokoro |
| 2 | Helper calculo | `lib/pricing.ts` → `computeEffectivePrice(product)` + `isDiscountActive(product)`. Compartido entre API response y checkout. | Kokoro |
| 3 | Cleanup legacy | Migration non-destructiva: renombrar columnas legacy, DROP tabla `discounts` (no tiene data real de produccion). Eliminar endpoints y componentes legacy. | Kokoro |
| 4 | Storefront precio | Product card + detail + cart muestran precio tachado + descontado. Checkout muestra solo precio final. API calcula server-side, Pixel solo renderiza. | Pixel |
| 5 | Test IDs | Pixel: `product-card-original-price`, `product-card-discounted-price`, `product-discount-badge`, `cart-item-original-price`, `cart-item-discounted-price`, `product-form-discount-type`, `product-form-discount-value`, `product-form-discount-toggle`. Centinela: specs `discounts-storefront.spec.ts` + `discounts-checkout.spec.ts`. | Pixel + Centinela |
| 6 | Seguridad | `CheckoutService` valida precios contra DB antes de crear preference MP. No confiar en precio del cliente. | Kokoro |
| 7 | Cart store | `CartItem` agrega `originalPrice: number`. `price` = precio final post-descuento. Ambos viajan en el store. | Kokoro + Pixel |

## Timeline

| Dia | Entregable | Owner | Depende de |
|---|---|---|---|
| D+0 | Migration + `lib/pricing.ts` + API response con campos descuento + validacion checkout | Kokoro | — |
| D+0 | Cleanup legacy (endpoints, componentes, migrations) | Kokoro | — |
| D+1 | ProductForm discount fields + GalleryCard/detail/cart precio tachado + cartStore `originalPrice` | Pixel | Kokoro D+0 |
| D+2 | E2E: discounts-storefront + discounts-checkout specs | Centinela | Pixel D+1 |

## Pendientes (usuario)

- Ninguno. Vigencia (starts_at/ends_at) entra en este sprint como opcional.
