# SKY-029: Product Size Selection - Sentinela Tasks

## Objetivo
Verificar que los productos de artmonkeys muestren correctamente las opciones de tamaño (Small 30×40cm, Medium 50×70cm, Large 100×140cm) y que al seleccionar un tamaño se actualice el precio.

## Contexto Técnico
- **Template**: gallery (artmonkeys)
- **Componente**: GalleryGrid (`components/gallery-v2/GalleryGrid.tsx`)
- **Datos**: metadata.sizes en productos (3 productos: Toro, Samurai, Chamán)
- **Tamaños configurados**:
  - Small: precio base (30×40cm)
  - Medium: precio × 1.5 (50×70cm)
  - Large: precio × 2.5 (100×140cm)

## Test IDs Requeridos
Si faltan, agregar a los componentes relevantes:
- `data-testid="artwork-card-{id}"` - Card del producto
- `data-testid="artwork-size-selector-{id}"` - Selector de tamaño
- `data-testid="artwork-size-option-{size}"` - Opción de tamaño (small/medium/large)
- `data-testid="artwork-price-{id}"` - Display del precio actual
- `data-testid="artwork-add-to-cart-{id}"` - Botón add to cart

## Tasks

### 1. Investigar por qué no se muestran los tamaños
- [ ] Navegar a http://localhost:3000/es/artmonkeys
- [ ] Inspeccionar productos: Toro (id:19), Samurai (id:20), Chamán (id:21)
- [ ] Verificar si existe UI de selector de tamaños
- [ ] Tomar screenshot del estado actual
- [ ] Si no existe, revisar componente GalleryGrid y sus hijos
- [ ] Identificar qué componente debería renderizar el selector de tamaños
- [ ] Reportar hallazgos en `SKY_029_INVESTIGATION_REPORT.md`

### 2. Test E2E: Size Selection Flow
Una vez que el selector esté implementado:

```typescript
test('artmonkeys products show size options', async ({ page }) => {
  await page.goto('http://localhost:3000/es/artmonkeys')

  // Verificar producto Toro
  const toroCard = page.getByTestId('artwork-card-19')
  await expect(toroCard).toBeVisible()

  // Verificar que existan opciones de tamaño
  const sizeSelector = page.getByTestId('artwork-size-selector-19')
  await expect(sizeSelector).toBeVisible()

  // Verificar las 3 opciones
  await expect(page.getByTestId('artwork-size-option-small')).toBeVisible()
  await expect(page.getByTestId('artwork-size-option-medium')).toBeVisible()
  await expect(page.getByTestId('artwork-size-option-large')).toBeVisible()
})

test('selecting size updates price correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/es/artmonkeys')

  const toroCard = page.getByTestId('artwork-card-19')
  const priceDisplay = page.getByTestId('artwork-price-19')

  // Small (base: 8500)
  await page.getByTestId('artwork-size-option-small').click()
  await expect(priceDisplay).toContainText('8500')

  // Medium (8500 × 1.5 = 12750)
  await page.getByTestId('artwork-size-option-medium').click()
  await expect(priceDisplay).toContainText('12750')

  // Large (8500 × 2.5 = 21250)
  await page.getByTestId('artwork-size-option-large').click()
  await expect(priceDisplay).toContainText('21250')
})

test('size dimensions are displayed', async ({ page }) => {
  await page.goto('http://localhost:3000/es/artmonkeys')

  // Verificar que se muestren las dimensiones
  await expect(page.getByText('30 × 40 cm')).toBeVisible()
  await expect(page.getByText('50 × 70 cm')).toBeVisible()
  await expect(page.getByText('100 × 140 cm')).toBeVisible()
})
```

### 3. Agregar Test IDs
- [ ] Revisar `components/gallery-v2/GalleryGrid.tsx`
- [ ] Revisar componentes hijos que renderizan productos
- [ ] Agregar test IDs según lista arriba
- [ ] Commit: "test: add test IDs for size selection in GalleryGrid"

### 4. Regression Testing
- [ ] Verificar que mangobajito (restaurant) sigue funcionando
- [ ] Verificar que productos sin metadata.sizes usen fallback correcto
- [ ] Verificar cart flow con tamaños seleccionados

## Criterios de Aceptación
- [ ] Productos de artmonkeys muestran selector de tamaños
- [ ] Se visualizan 3 opciones: Small, Medium, Large con dimensiones
- [ ] Precio se actualiza al cambiar tamaño
- [ ] Tests E2E pasan sin falsos positivos
- [ ] Coverage ≥80% en flujo de size selection

## Notas
- Si GalleryGrid no implementa size selector, escalar a Pixel
- Productos actualizados: Toro (19), Samurai (20), Chamán (21)
- DB query ya incluye metadata en select

## Archivo de Tests
`tests/e2e/artmonkeys-size-selection.spec.ts`
